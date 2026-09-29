-- ─────────────────────────────────────────────────────────────────────────────
-- FAMILY DOCUMENTS SCHEMA — Phase 3, Paperwork tab.
-- ─────────────────────────────────────────────────────────────────────────────
-- One table (family_documents), one private Storage bucket
-- (family-documents), RLS gated by current_staff_is_books_admin(). Modeled
-- on the bank_statements pattern.
--
-- Doc types come from src/lib/familyDocumentTypes.js — the DB doesn't
-- constrain doc_type to an enum so Roman can add new types in the JS lib
-- without a schema migration. Compliance status (submitted / expiring /
-- expired / missing) is derived at read time from expires_at, not
-- persisted.

BEGIN;

-- ── family_documents ────────────────────────────────────────────────────────
-- child_id is nullable: family-scoped docs (parent handbook, enrollment
-- agreement) leave it null; child-scoped docs (immunization records,
-- allergy plans) set it. doc_type is a free text key that matches an
-- entry in familyDocumentTypes.js.
CREATE TABLE IF NOT EXISTS public.family_documents (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id     uuid        NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_id      uuid        REFERENCES public.children(id) ON DELETE CASCADE,
  doc_type      text        NOT NULL,
  file_path     text        NOT NULL,   -- Storage bucket key
  file_name     text        NOT NULL,   -- original upload name (display)
  expires_at    date,                   -- NULL for docs that don't expire
  notes         text,
  uploaded_by   uuid        REFERENCES public.staff(id),
  uploaded_at   timestamptz NOT NULL DEFAULT now()
);

-- One doc of a given type per family (family-scoped) OR per child
-- (child-scoped) at a time — uploading a replacement swaps the file.
-- Enforcing this at the DB layer via a partial unique index makes the
-- upload flow's upsert semantics honest.
CREATE UNIQUE INDEX IF NOT EXISTS family_documents_family_scope_idx
  ON public.family_documents (family_id, doc_type)
  WHERE child_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS family_documents_child_scope_idx
  ON public.family_documents (child_id, doc_type)
  WHERE child_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS family_documents_family_id_idx
  ON public.family_documents (family_id);

CREATE INDEX IF NOT EXISTS family_documents_expires_at_idx
  ON public.family_documents (expires_at)
  WHERE expires_at IS NOT NULL;

-- ── ROW-LEVEL SECURITY ──────────────────────────────────────────────────────
ALTER TABLE public.family_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS books_admins_family_documents ON public.family_documents;
CREATE POLICY books_admins_family_documents ON public.family_documents
  FOR ALL TO authenticated
  USING (public.current_staff_is_books_admin())
  WITH CHECK (public.current_staff_is_books_admin());

-- ── STORAGE BUCKET ──────────────────────────────────────────────────────────
-- Private (no public URL). App fetches signed URLs on demand for view/
-- download. Bucket size limit is Supabase's default; MIME restricted to
-- PDF at the app layer, not the bucket level (bucket allows anything the
-- policy lets through — same pattern as bank-statements).
INSERT INTO storage.buckets (id, name, public)
VALUES ('family-documents', 'family-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS. Any authenticated books-admin can read/write objects in
-- this bucket. Non-admin roles are denied outright.
DROP POLICY IF EXISTS "family_documents_books_admin_read"  ON storage.objects;
DROP POLICY IF EXISTS "family_documents_books_admin_write" ON storage.objects;

CREATE POLICY "family_documents_books_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'family-documents' AND public.current_staff_is_books_admin());

CREATE POLICY "family_documents_books_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'family-documents' AND public.current_staff_is_books_admin())
  WITH CHECK (bucket_id = 'family-documents' AND public.current_staff_is_books_admin());

COMMIT;

-- ── VERIFICATION ────────────────────────────────────────────────────────────
SELECT table_name, column_name, data_type, is_nullable
FROM   information_schema.columns
WHERE  table_schema = 'public' AND table_name = 'family_documents'
ORDER BY ordinal_position;

SELECT tablename, policyname
FROM   pg_policies
WHERE  schemaname = 'public' AND tablename = 'family_documents';

SELECT id, name, public FROM storage.buckets WHERE id = 'family-documents';
