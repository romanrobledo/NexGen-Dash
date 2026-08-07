import { useMemo, useState } from 'react'
import {
  Wallet,
  Search,
  RefreshCw,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react'
import { useBankTransactions } from '../hooks/useBankTransactions'
import { useVendorRules } from '../hooks/useVendorRules'
import TransactionResolveDrawer from '../components/TransactionResolveDrawer'

/**
 * Books → Transactions. Table view over bank_transactions joined to the
 * containing statement. Review queue is a filter state, not a separate
 * page — the badge on the header applies the filter with one click.
 */
export default function BooksTransactionsPage() {
  const [filters, setFilters] = useState({
    month: '',
    category: '',
    direction: '',
    status: '',
    reviewOnly: false,
  })
  const [search, setSearch] = useState('')
  const [drawer, setDrawer] = useState({ open: false, transaction: null })

  const {
    transactions,
    reviewCount,
    loading,
    error,
    saving,
    refetch,
    resolveTransaction,
  } = useBankTransactions(filters)
  const { categories, subcategoriesFor, createRule } = useVendorRules()

  // Client-side description search (server has no full-text yet).
  const visibleTxns = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return transactions
    return transactions.filter((t) => (t.description || '').toLowerCase().includes(q))
  }, [transactions, search])

  const filterCount =
    (filters.month ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.direction ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.reviewOnly ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
                Finance · Books
              </p>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                Transactions
              </h1>
            </div>
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, reviewOnly: !f.reviewOnly }))
              }
              className={`inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold rounded-lg border transition ${
                filters.reviewOnly
                  ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                  : reviewCount > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
              title={reviewCount > 0 ? `${reviewCount} transactions need review` : 'Nothing needs review'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Review queue
              <span className="tabular-nums">({reviewCount})</span>
            </button>
            <button
              onClick={refetch}
              disabled={loading}
              className="inline-flex items-center gap-1.5 h-10 px-3 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Filters + search */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description…"
                className="w-full h-10 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
              />
            </div>
            <input
              type="month"
              value={filters.month}
              onChange={(e) => setFilters((f) => ({ ...f, month: e.target.value }))}
              className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            />
            <select
              value={filters.category}
              onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
              className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filters.direction}
              onChange={(e) => setFilters((f) => ({ ...f, direction: e.target.value }))}
              className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            >
              <option value="">Any direction</option>
              <option value="credit">Credit (in)</option>
              <option value="debit">Debit (out)</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none"
            >
              <option value="">Any status</option>
              <option value="categorized">Categorized</option>
              <option value="needs_review">Needs review</option>
              <option value="unmatched">Unmatched</option>
            </select>
            {(filterCount > 0 || search) && (
              <button
                onClick={() => {
                  setFilters({ month: '', category: '', direction: '', status: '', reviewOnly: false })
                  setSearch('')
                }}
                className="h-10 px-3 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg inline-flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {error && (
          <div className="mb-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-[10px] uppercase tracking-wider font-bold text-gray-500 flex items-center gap-2">
            <span>
              {visibleTxns.length} {visibleTxns.length === 1 ? 'transaction' : 'transactions'}
            </span>
            {filters.reviewOnly && (
              <span className="ml-auto text-amber-800 normal-case font-semibold">
                Review queue filter active
              </span>
            )}
          </div>
          {loading ? (
            <p className="px-4 py-10 text-sm text-gray-400 italic text-center">
              Loading transactions…
            </p>
          ) : visibleTxns.length === 0 ? (
            <p className="px-4 py-16 text-sm text-gray-400 italic text-center">
              No transactions. Upload a statement in Books → Accounts.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-[10px] uppercase tracking-wider font-bold text-gray-500">
                    <th className="text-left px-3 py-2">Date</th>
                    <th className="text-left px-3 py-2">Description</th>
                    <th className="text-right px-3 py-2">Amount</th>
                    <th className="text-left px-3 py-2">Category</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visibleTxns.map((t) => (
                    <TransactionRow
                      key={t.id}
                      txn={t}
                      onClick={() => setDrawer({ open: true, transaction: t })}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TransactionResolveDrawer
        open={drawer.open}
        transaction={drawer.transaction}
        categories={categories}
        subcategoriesFor={subcategoriesFor}
        onClose={() => setDrawer({ open: false, transaction: null })}
        onResolve={resolveTransaction}
        onCreateRule={createRule}
        saving={saving}
      />
    </div>
  )
}

function TransactionRow({ txn, onClick }) {
  const isUnresolved = txn.status === 'needs_review' || txn.status === 'unmatched'
  const amountCls = txn.direction === 'credit' ? 'text-emerald-700' : 'text-red-700'
  const sign = txn.direction === 'credit' ? '+' : '−'

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer hover:bg-gray-50 ${
        isUnresolved ? 'bg-amber-50/40' : ''
      }`}
    >
      <td className="px-3 py-2 text-xs text-gray-700 tabular-nums whitespace-nowrap">
        {formatDate(txn.txnDate)}
      </td>
      <td className="px-3 py-2 text-xs text-gray-900 max-w-[420px]">
        <p className="truncate font-medium">{txn.description || '(no description)'}</p>
        {txn.checkNumber && (
          <p className="text-[10px] text-gray-400 tabular-nums">check #{txn.checkNumber}</p>
        )}
      </td>
      <td className={`px-3 py-2 text-xs text-right tabular-nums font-semibold ${amountCls}`}>
        {sign}{formatUSD(txn.amount)}
      </td>
      <td className="px-3 py-2 text-xs text-gray-700">
        {txn.category ? (
          <>
            <span className="font-semibold">{txn.category}</span>
            {txn.subcategory && (
              <span className="text-gray-400"> · {txn.subcategory}</span>
            )}
          </>
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </td>
      <td className="px-3 py-2">
        <StatusPill status={txn.status} categorizedBy={txn.categorizedBy} />
      </td>
    </tr>
  )
}

function StatusPill({ status, categorizedBy }) {
  const map = {
    categorized: {
      cls: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      label: 'Categorized',
    },
    needs_review: {
      cls: 'bg-amber-50 text-amber-800 border-amber-200',
      label: 'Needs review',
    },
    unmatched: {
      cls: 'bg-gray-100 text-gray-700 border-gray-200',
      label: 'Unmatched',
    },
  }
  const meta = map[status] || map.unmatched
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full border font-semibold text-[10px] uppercase tracking-wider w-fit ${meta.cls}`}
      >
        {meta.label}
      </span>
      {categorizedBy && (
        <span className="text-[10px] text-gray-400">by {categorizedBy}</span>
      )}
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

function formatUSD(n) {
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
