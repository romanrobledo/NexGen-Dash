import { useEffect, useRef, useState } from 'react'
import {
  Upload,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Plus,
  Landmark,
  Trash2,
  RefreshCw,
} from 'lucide-react'
import { useBankAccounts } from '../hooks/useBankAccounts'
import { useBankStatements } from '../hooks/useBankStatements'

/**
 * Books → Accounts.
 *
 * Layout: account picker (or first-time inline creation) → PDF drop
 * zone → statement list, newest first. Every state expresses ignorance
 * honestly — never fabricated dates, never $0.00 for absent data.
 */
export default function BooksAccountsPage() {
  const {
    accounts,
    loading: accountsLoading,
    error: accountsError,
    createAccount,
    refetch: refetchAccounts,
  } = useBankAccounts()
  const {
    statements,
    loading: statementsLoading,
    error: statementsError,
    uploadStatement,
    uploading,
    uploadError,
    refetch: refetchStatements,
  } = useBankStatements()

  const [selectedAccountId, setSelectedAccountId] = useState('')

  // Default the picker to the first account once loaded.
  useEffect(() => {
    if (!selectedAccountId && accounts.length > 0) {
      setSelectedAccountId(accounts[0].id)
    }
  }, [accounts, selectedAccountId])

  const readyToUpload = !!selectedAccountId && accounts.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Finance · Books
              </p>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Accounts
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload bank statements. Parsing runs asynchronously; rows land as
                "Awaiting processing" until reconciled.
              </p>
            </div>
            <button
              onClick={() => {
                refetchAccounts()
                refetchStatements()
              }}
              disabled={accountsLoading || statementsLoading}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              title="Refresh from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${accountsLoading || statementsLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {accountsError && (
          <ErrorBanner text={accountsError} />
        )}

        {/* Account picker or first-time setup */}
        <AccountPickerSection
          accounts={accounts}
          loading={accountsLoading}
          selectedId={selectedAccountId}
          onSelect={setSelectedAccountId}
          onCreate={createAccount}
        />

        {/* Upload zone */}
        <UploadZone
          disabled={!readyToUpload || uploading}
          uploading={uploading}
          uploadError={uploadError}
          onUpload={(file) => uploadStatement(file, selectedAccountId)}
          accountLabel={
            accounts.find((a) => a.id === selectedAccountId)?.accountLabel || ''
          }
        />

        {/* Statement list */}
        <StatementList
          statements={statements}
          loading={statementsLoading}
          error={statementsError}
        />
      </div>
    </div>
  )
}

// ─── Sections ───────────────────────────────────────────────────────────────

function AccountPickerSection({ accounts, loading, selectedId, onSelect, onCreate }) {
  const [showCreate, setShowCreate] = useState(false)

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5 text-sm text-gray-400">
        Loading bank accounts…
      </div>
    )
  }

  if (accounts.length === 0) {
    // Empty state — cannot upload without an account. Inline creation.
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Landmark className="w-4 h-4 text-emerald-700" />
          <h2 className="text-sm font-bold text-gray-900">Add your first bank account</h2>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Statements have to belong to an account. Add one below to unlock the
          upload zone.
        </p>
        <NewAccountForm onCreate={onCreate} />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 flex-wrap">
      <label className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
        Statement belongs to
      </label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none flex-1 min-w-[240px]"
      >
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.institution} — {a.accountLabel}
            {a.accountLast4 ? ` (••${a.accountLast4})` : ''}
          </option>
        ))}
      </select>
      {showCreate ? (
        <div className="w-full mt-2 pt-3 border-t border-gray-100">
          <NewAccountForm
            onCreate={async (input) => {
              const res = await onCreate(input)
              if (!res.error) {
                setShowCreate(false)
                if (res.data) onSelect(res.data.id)
              }
              return res
            }}
            onCancel={() => setShowCreate(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          Add account
        </button>
      )}
    </div>
  )
}

function NewAccountForm({ onCreate, onCancel }) {
  const [institution, setInstitution] = useState('')
  const [accountLabel, setAccountLabel] = useState('')
  const [accountLast4, setAccountLast4] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  async function submit(e) {
    e.preventDefault()
    if (!institution.trim() || !accountLabel.trim()) {
      setErr('Institution and label are required.')
      return
    }
    setBusy(true)
    setErr('')
    const res = await onCreate({ institution, accountLabel, accountLast4 })
    setBusy(false)
    if (res.error) setErr(res.error)
    else {
      setInstitution('')
      setAccountLabel('')
      setAccountLast4('')
    }
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
      <div>
        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">
          Institution *
        </label>
        <input
          type="text"
          value={institution}
          onChange={(e) => setInstitution(e.target.value)}
          placeholder="e.g. Wells Fargo"
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">
          Account label *
        </label>
        <input
          type="text"
          value={accountLabel}
          onChange={(e) => setAccountLabel(e.target.value)}
          placeholder="Business Checking"
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-bold text-gray-500 block mb-1">
          Last 4
        </label>
        <input
          type="text"
          value={accountLast4}
          onChange={(e) => setAccountLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="1234"
          inputMode="numeric"
          className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm tabular-nums focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
        />
      </div>
      {err && (
        <div className="sm:col-span-3 flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {err}
        </div>
      )}
      <div className="sm:col-span-3 flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-3 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add account
        </button>
      </div>
    </form>
  )
}

function UploadZone({ disabled, uploading, uploadError, onUpload, accountLabel }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [flash, setFlash] = useState(/** @type {{ tone:'ok'|'err', msg:string }|null} */ (null))

  async function handleFile(file) {
    if (!file || disabled) return
    setFlash(null)
    const res = await onUpload(file)
    if (res?.error) {
      setFlash({ tone: 'err', msg: res.error })
    } else {
      setFlash({ tone: 'ok', msg: `Uploaded "${file.name}" — awaiting processing.` })
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const zoneCls = `
    rounded-xl border-2 border-dashed p-6 sm:p-8 text-center transition
    ${disabled
      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
      : dragOver
        ? 'border-emerald-400 bg-emerald-50'
        : 'border-gray-300 bg-white hover:border-emerald-300'
    }
  `

  return (
    <div>
      <div
        className={zoneCls}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center mx-auto mb-3">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-500" />
          )}
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {uploading
            ? 'Uploading…'
            : disabled
              ? 'Add a bank account first to unlock uploads'
              : `Drop a PDF here${accountLabel ? ` for ${accountLabel}` : ''}`}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {disabled
            ? ''
            : 'or '}
          {!disabled && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-emerald-700 font-semibold hover:underline"
            >
              browse for a file
            </button>
          )}
          {' '}
          <span className="text-gray-400">· PDF only · max 15 MB</span>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {(flash || uploadError) && (
        <div
          className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-xs ${
            flash?.tone === 'ok'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {flash?.tone === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          )}
          <span>{flash?.msg || uploadError}</span>
        </div>
      )}
    </div>
  )
}

function StatementList({ statements, loading, error }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 flex-wrap">
        <FileText className="w-4 h-4 text-gray-500" />
        <p className="text-[11px] uppercase tracking-wider font-bold text-gray-500">
          Statements
        </p>
        <p className="text-[11px] text-gray-400 tabular-nums ml-auto">
          {statements.length} {statements.length === 1 ? 'statement' : 'statements'}
        </p>
      </div>

      {error && <ErrorBanner text={error} inline />}

      {loading ? (
        <p className="px-4 py-8 text-sm text-gray-400 italic text-center">Loading statements…</p>
      ) : statements.length === 0 ? (
        <p className="px-4 py-10 text-sm text-gray-400 italic text-center">
          No statements uploaded yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                <th className="text-left px-4 py-2">Period</th>
                <th className="text-left px-4 py-2">Account</th>
                <th className="text-left px-4 py-2">Uploaded</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-right px-4 py-2">Deposits</th>
                <th className="text-right px-4 py-2">Withdrawals</th>
                <th className="text-right px-4 py-2">Reconciliation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {statements.map((s) => (
                <StatementRow key={s.id} statement={s} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function StatementRow({ statement }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2.5">
        <p className="text-xs font-semibold text-gray-900 tabular-nums">
          {formatPeriod(statement.periodStart, statement.periodEnd)}
        </p>
        <p className="text-[10px] text-gray-400 truncate max-w-[220px]">
          {statement.fileName || '(no filename)'}
        </p>
      </td>
      <td className="px-4 py-2.5 text-xs text-gray-700">
        {statement.account
          ? `${statement.account.accountLabel}${statement.account.accountLast4 ? ` ••${statement.account.accountLast4}` : ''}`
          : <span className="text-gray-400 italic">—</span>}
      </td>
      <td className="px-4 py-2.5 text-xs text-gray-600 tabular-nums">
        {formatDateTime(statement.uploadedAt)}
      </td>
      <td className="px-4 py-2.5">
        <StatusBadge status={statement.status} rejectionReason={statement.rejectionReason} />
      </td>
      <td className="px-4 py-2.5 text-xs text-right tabular-nums">
        {formatCurrencyOrDash(statement.totalDeposits)}
      </td>
      <td className="px-4 py-2.5 text-xs text-right tabular-nums">
        {formatCurrencyOrDash(statement.totalWithdrawals)}
      </td>
      <td className="px-4 py-2.5 text-xs text-right tabular-nums">
        {statement.status === 'reconciled'
          ? formatCurrencyOrDash(statement.reconciliationDelta ?? 0)
          : '—'}
      </td>
    </tr>
  )
}

function StatusBadge({ status, rejectionReason }) {
  const map = {
    pending: {
      cls: 'bg-gray-100 text-gray-700 border-gray-200',
      dot: 'bg-gray-400',
      label: 'Awaiting processing',
    },
    processing: {
      cls: 'bg-blue-50 text-blue-800 border-blue-200',
      dot: 'bg-blue-500',
      label: 'Processing',
    },
    reconciled: {
      cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Balanced',
    },
    rejected: {
      cls: 'bg-red-50 text-red-800 border-red-200',
      dot: 'bg-red-500',
      label: 'Rejected',
    },
  }
  const meta = map[status] || map.pending
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-semibold text-[10px] uppercase tracking-wider w-fit ${meta.cls}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {meta.label}
      </span>
      {status === 'rejected' && (
        <p className="text-[11px] text-red-700 italic">
          {rejectionReason || 'No reason provided.'}
        </p>
      )}
    </div>
  )
}

function ErrorBanner({ text, inline }) {
  return (
    <div className={`${inline ? '' : 'mb-2'} flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700`}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  )
}

// ─── Utils ───────────────────────────────────────────────────────────────

function formatPeriod(start, end) {
  if (!start && !end) return '—'
  const fmt = (iso) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  if (start && end) return `${fmt(start)} – ${fmt(end)}`
  return fmt(start || end)
}

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function formatCurrencyOrDash(n) {
  if (n == null) return '—'
  const num = Number(n)
  if (Number.isNaN(num)) return '—'
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
