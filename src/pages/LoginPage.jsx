import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { AlertCircle, Loader2 } from 'lucide-react'

/**
 * PIN-code login. 4 digits. iPhone-style.
 *
 * Flow:
 *   1. User types a 4-digit PIN
 *   2. Client calls the public.resolve_pin(pin) RPC — a SECURITY DEFINER
 *      function that joins public.staff → auth.users and returns the
 *      email for that PIN (anon can call it; no staff columns leak).
 *   3. Client calls signIn(email, pin) — normal Supabase password auth.
 *      The PIN doubles as the auth password.
 *
 * Adding a new staff PIN — three coordinated steps:
 *   1. Create their auth user in Supabase (email + password = their PIN).
 *   2. Insert into public.staff with auth_user_id set + login_pin = PIN.
 *   3. Done — they can now log in with just their PIN.
 *
 * The `login_pin` column is UNIQUE, so two staff can't share a PIN.
 * The `resolve_pin` RPC returns NULL for unknown PINs, which we surface
 * as a friendly "Incorrect PIN" without leaking whether the PIN exists.
 */

const PIN_LENGTH = 4

export default function LoginPage() {
  const [digits, setDigits] = useState(Array(PIN_LENGTH).fill(''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const refs = useRef(Array(PIN_LENGTH).fill(null))
  const navigate = useNavigate()
  const { signIn } = useAuth()

  // Auto-focus first box on mount
  useEffect(() => {
    refs.current[0]?.focus()
  }, [])

  function updateDigit(index, raw) {
    // Strip non-digits and cap to one character (paste of "2580" is
    // handled separately below).
    const digit = raw.replace(/\D/g, '').slice(-1)
    setError('')
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      // Advance focus if a digit was entered and we're not on the last box.
      if (digit && index < PIN_LENGTH - 1) {
        refs.current[index + 1]?.focus()
      }
      // Auto-submit once the last box is filled.
      if (digit && index === PIN_LENGTH - 1 && next.every(Boolean)) {
        submit(next.join(''))
      }
      return next
    })
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      // Backspace on an empty box jumps to the previous box AND clears it,
      // which is the behavior every PIN pad has.
      e.preventDefault()
      refs.current[index - 1]?.focus()
      setDigits((prev) => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault()
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < PIN_LENGTH - 1) {
      e.preventDefault()
      refs.current[index + 1]?.focus()
    }
  }

  function handlePaste(e) {
    // If someone pastes 2580 into any box, spread it across all boxes.
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, PIN_LENGTH)
    if (pasted.length === 0) return
    e.preventDefault()
    const next = Array(PIN_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i]
    setDigits(next)
    const nextFocus = Math.min(pasted.length, PIN_LENGTH - 1)
    refs.current[nextFocus]?.focus()
    if (pasted.length === PIN_LENGTH) submit(pasted)
  }

  async function submit(pin) {
    setLoading(true)
    setError('')
    try {
      // Step 1: PIN → email via SECURITY DEFINER RPC. Anon-callable so
      // this works from the login page before we have a session.
      const { data: email, error: rpcErr } = await supabase.rpc(
        'resolve_pin',
        { pin_code: pin }
      )
      if (rpcErr) throw rpcErr
      if (!email) {
        // Unknown PIN — same message as wrong-password so we don't leak
        // whether a PIN happens to be registered.
        throw new Error('Invalid login credentials')
      }
      // Step 2: sign in with normal password auth. The PIN doubles as
      // the auth password on that account.
      await signIn(email, pin)
      navigate('/', { replace: true })
    } catch (err) {
      // Wrong PIN: clear the boxes, refocus the first, keep it friendly.
      setDigits(Array(PIN_LENGTH).fill(''))
      refs.current[0]?.focus()
      setError(
        err.message === 'Invalid login credentials'
          ? 'Incorrect PIN. Try again.'
          : err.message || 'Something went wrong. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">NEXGEN</h1>
          <p className="text-gray-400 mt-2 text-sm">Staff Management Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
            Enter your PIN
          </h2>
          <p className="text-sm text-gray-400 mb-6 text-center">
            4-digit access code
          </p>

          {/* PIN boxes */}
          <div className="flex justify-center gap-3 mb-4" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (refs.current[i] = el)}
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete="off"
                disabled={loading}
                value={digit}
                onChange={(e) => updateDigit(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                aria-label={`PIN digit ${i + 1} of ${PIN_LENGTH}`}
                className="w-14 h-16 text-center text-2xl font-bold tabular-nums border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ))}
          </div>

          {/* Status row — reserves height so error/loading state doesn't shift layout. */}
          <div className="min-h-[24px] text-center">
            {loading ? (
              <p className="text-xs text-gray-500 inline-flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Signing in…
              </p>
            ) : error ? (
              <p className="text-xs text-red-600 inline-flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            ) : (
              <p className="text-xs text-gray-300">Auto-submits when all 4 digits are entered</p>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          &copy; 2026 NexGen School &middot; Contact your administrator for a new PIN
        </p>
      </div>
    </div>
  )
}
