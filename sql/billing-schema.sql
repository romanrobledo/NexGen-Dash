-- ─────────────────────────────────────────────────────────────────────────────
-- BILLING SCHEMA — plans, invoices, invoice_line_items, payments.
-- ─────────────────────────────────────────────────────────────────────────────
-- Money stored as integer cents everywhere. No floats — floats lie about
-- pennies at scale and eventually you find yourself off by $2 for a
-- month. Store cents, format for display.
--
-- Stripe-ready: external_ref columns on invoices and payments hold the
-- Stripe object id when we wire the connector. Without Stripe, invoices
-- and payments are manual entries — the app still tracks status.
--
-- RLS gated on current_staff_is_books_admin() — same predicate the rest
-- of the family + books tables use.

BEGIN;

-- ── plans ────────────────────────────────────────────────────────────────────
-- Tuition tiers ("Full-Time Toddler", "Part-Time Pre-K", "CCMS Toddler",
-- "Registration fee", etc.). Frequencies today: weekly, monthly, one_time.
-- amount_cents is the base charge for one period.
CREATE TABLE IF NOT EXISTS public.billing_plans (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  description   text,
  amount_cents  integer     NOT NULL CHECK (amount_cents >= 0),
  frequency     text        NOT NULL DEFAULT 'monthly'
                  CHECK (frequency IN ('weekly', 'monthly', 'one_time')),
  age_range     text,       -- optional label like '0-17mo' or '4-5yr'
  active        boolean     NOT NULL DEFAULT true,
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS billing_plans_active_idx ON public.billing_plans (active);

DROP TRIGGER IF EXISTS billing_plans_touch_updated_at ON public.billing_plans;
CREATE TRIGGER billing_plans_touch_updated_at
  BEFORE UPDATE ON public.billing_plans
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── invoice numbering sequence ──────────────────────────────────────────────
-- Auto-incrementing per-tenant invoice number. Starts at 1000 so the
-- first invoice looks like "INV-1001" not "INV-1". Not a natural key
-- (invoice.id stays uuid) — invoice_number is just for humans.
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1001;

-- ── invoices ────────────────────────────────────────────────────────────────
-- Status: draft (composed but not sent), sent (out to the family),
-- paid (fully paid), partial (some payments applied but not all),
-- overdue (past due_date, unpaid), voided (cancelled, don't count in
-- reports). partial + overdue are computed at query time in views —
-- persisted status here is the "manual" flag the user sets.
CREATE TABLE IF NOT EXISTS public.invoices (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number        integer     NOT NULL UNIQUE
                          DEFAULT nextval('public.invoice_number_seq'),
  family_id             uuid        NOT NULL REFERENCES public.families(id) ON DELETE RESTRICT,
  status                text        NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'voided')),
  issue_date            date        NOT NULL DEFAULT current_date,
  due_date              date,
  subtotal_cents        integer     NOT NULL DEFAULT 0,
  total_cents           integer     NOT NULL DEFAULT 0,
  amount_paid_cents     integer     NOT NULL DEFAULT 0,
  notes                 text,
  external_ref          text,       -- Stripe invoice id when integrated
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoices_family_id_idx ON public.invoices (family_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx    ON public.invoices (status);
CREATE INDEX IF NOT EXISTS invoices_due_date_idx  ON public.invoices (due_date) WHERE status NOT IN ('paid', 'voided');

DROP TRIGGER IF EXISTS invoices_touch_updated_at ON public.invoices;
CREATE TRIGGER invoices_touch_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── invoice_line_items ─────────────────────────────────────────────────────
-- One row per line on an invoice. plan_id is optional — invoices can
-- have ad-hoc lines ("Late fee", "One-time uniform charge") that don't
-- correspond to a plan. amount_cents == quantity * unit_amount_cents is
-- enforced client-side (kept as a stored value for reporting).
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id         uuid        NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  plan_id            uuid        REFERENCES public.billing_plans(id) ON DELETE SET NULL,
  description        text        NOT NULL,
  quantity           numeric     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_amount_cents  integer     NOT NULL CHECK (unit_amount_cents >= 0),
  amount_cents       integer     NOT NULL,
  position           integer     NOT NULL DEFAULT 0,
  notes              text,
  created_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS invoice_line_items_invoice_id_idx
  ON public.invoice_line_items (invoice_id, position);

-- ── payments ────────────────────────────────────────────────────────────────
-- One row per payment received. invoice_id is optional — a payment can
-- be a credit on the family account before an invoice is issued. Method
-- is free text but the UI picks from a preset list.
CREATE TABLE IF NOT EXISTS public.payments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id         uuid        NOT NULL REFERENCES public.families(id) ON DELETE RESTRICT,
  invoice_id        uuid        REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount_cents      integer     NOT NULL CHECK (amount_cents > 0),
  payment_method    text        NOT NULL DEFAULT 'other'
                      CHECK (payment_method IN ('cash','check','card','ach','ccms','other')),
  payment_date      date        NOT NULL DEFAULT current_date,
  reference_number  text,       -- check number, last-4 of card, ACH ref, etc.
  notes             text,
  external_ref      text,       -- Stripe payment intent id when integrated
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS payments_family_id_idx    ON public.payments (family_id);
CREATE INDEX IF NOT EXISTS payments_invoice_id_idx   ON public.payments (invoice_id) WHERE invoice_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_payment_date_idx ON public.payments (payment_date DESC);

DROP TRIGGER IF EXISTS payments_touch_updated_at ON public.payments;
CREATE TRIGGER payments_touch_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ── payment → invoice roll-up trigger ────────────────────────────────────────
-- Whenever a payment is inserted, updated, or deleted with a linked
-- invoice_id, recompute that invoice's amount_paid_cents + status. Keeps
-- the invoice's paid-vs-not state honest without app-side recompute.
CREATE OR REPLACE FUNCTION public.recompute_invoice_paid_state(target_invoice_id uuid)
RETURNS void AS $$
DECLARE
  paid       integer;
  total      integer;
  new_status text;
  cur_status text;
  cur_due    date;
BEGIN
  IF target_invoice_id IS NULL THEN RETURN; END IF;
  SELECT COALESCE(SUM(amount_cents), 0) INTO paid
  FROM   public.payments WHERE invoice_id = target_invoice_id;
  SELECT total_cents, status, due_date
    INTO total, cur_status, cur_due
  FROM   public.invoices WHERE id = target_invoice_id;
  IF total IS NULL THEN RETURN; END IF;
  -- Don't override voided invoices.
  IF cur_status = 'voided' THEN
    UPDATE public.invoices SET amount_paid_cents = paid WHERE id = target_invoice_id;
    RETURN;
  END IF;
  IF paid >= total AND total > 0 THEN
    new_status := 'paid';
  ELSIF paid > 0 THEN
    new_status := 'partial';
  ELSIF cur_due IS NOT NULL AND cur_due < current_date THEN
    new_status := 'overdue';
  ELSE
    new_status := 'sent';
  END IF;
  -- Preserve 'draft' — draft means the invoice hasn't been sent yet.
  IF cur_status = 'draft' AND paid = 0 THEN new_status := 'draft'; END IF;
  UPDATE public.invoices
     SET amount_paid_cents = paid,
         status = new_status
   WHERE id = target_invoice_id;
END $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.payments_after_write()
RETURNS trigger AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    PERFORM public.recompute_invoice_paid_state(OLD.invoice_id);
    RETURN OLD;
  ELSE
    PERFORM public.recompute_invoice_paid_state(NEW.invoice_id);
    IF (TG_OP = 'UPDATE' AND NEW.invoice_id IS DISTINCT FROM OLD.invoice_id) THEN
      PERFORM public.recompute_invoice_paid_state(OLD.invoice_id);
    END IF;
    RETURN NEW;
  END IF;
END $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS payments_recompute_invoice ON public.payments;
CREATE TRIGGER payments_recompute_invoice
  AFTER INSERT OR UPDATE OR DELETE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.payments_after_write();

-- ── ROW-LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE public.billing_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_line_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments            ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS books_admins_billing_plans      ON public.billing_plans;
DROP POLICY IF EXISTS books_admins_invoices           ON public.invoices;
DROP POLICY IF EXISTS books_admins_invoice_line_items ON public.invoice_line_items;
DROP POLICY IF EXISTS books_admins_payments           ON public.payments;

CREATE POLICY books_admins_billing_plans ON public.billing_plans
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

CREATE POLICY books_admins_invoices ON public.invoices
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

CREATE POLICY books_admins_invoice_line_items ON public.invoice_line_items
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

CREATE POLICY books_admins_payments ON public.payments
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

COMMIT;

-- ── SEED — starter plans matching Roman's current tuition tiers ──────────────
-- These come from the children.program_class values he already tracks
-- (0-17mo 43.03/day, 18-3yr 37.67/day, 4-5yr 39.60/day, 6up 32.96/day)
-- plus CCMS tiers and part-time drop-in. Safe to re-run: ON CONFLICT
-- (name) keeps a single row per plan name.
INSERT INTO public.billing_plans (name, description, amount_cents, frequency, age_range, active) VALUES
  ('Registration Fee', 'One-time enrollment / registration charge.', 15000, 'one_time', NULL, true),
  ('Full-Time — 0-17 mo',  'Infant room, private pay',     21515, 'weekly', '0-17mo', true),
  ('Full-Time — 18mo-3yr', 'Toddler / young toddler room', 18835, 'weekly', '18mo-3yr', true),
  ('Full-Time — 4-5 yr',   'Pre-K / Kinder',               19800, 'weekly', '4-5yr', true),
  ('Full-Time — 6+ yr',    'Afterschool full-time',        16480, 'weekly', '6+', true),
  ('Drop-In Day',          'Single-day drop-in rate',       4500, 'one_time', NULL, true)
ON CONFLICT DO NOTHING;

-- ── VERIFICATION ────────────────────────────────────────────────────────────
SELECT table_name, column_name, data_type
FROM   information_schema.columns
WHERE  table_schema = 'public'
  AND  table_name IN ('billing_plans','invoices','invoice_line_items','payments')
ORDER BY table_name, ordinal_position;

SELECT count(*) AS starter_plans_seeded FROM public.billing_plans;
