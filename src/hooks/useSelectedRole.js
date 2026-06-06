import { useState, useEffect, useCallback } from 'react'

/**
 * Shared "selected role" state.
 * Persists the staff member's currently-selected role identifier in
 * localStorage so every Compass sub-page stays in sync.
 *
 * Usage:
 *   const [roleId, setRoleId] = useSelectedRoleId()
 *   const activeRole = ROLES.find(r => r.id === roleId) || ROLES[0]
 */

const STORAGE_KEY = 'nexgen_selected_role'
const EVENT_NAME = 'nexgen:role-change'

export function getStoredRoleId() {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setStoredRoleId(id) {
  if (typeof window === 'undefined') return
  try {
    if (id) {
      window.localStorage.setItem(STORAGE_KEY, id)
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    /* ignore */
  }
  // Notify same-tab listeners (the native `storage` event only fires across tabs)
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: id }))
}

export function useSelectedRoleId() {
  const [id, setId] = useState(() => getStoredRoleId())

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key && e.key !== STORAGE_KEY) return
      setId(getStoredRoleId())
    }
    const onCustom = () => setId(getStoredRoleId())
    window.addEventListener('storage', onStorage)
    window.addEventListener(EVENT_NAME, onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(EVENT_NAME, onCustom)
    }
  }, [])

  const update = useCallback((next) => {
    setStoredRoleId(next)
    setId(next)
  }, [])

  return [id, update]
}
