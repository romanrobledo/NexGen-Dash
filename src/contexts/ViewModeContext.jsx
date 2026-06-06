import { createContext, useContext, useState, useEffect } from 'react'

const ViewModeContext = createContext()

export function ViewModeProvider({ children }) {
  const [mobileMode, setMobileMode] = useState(() => {
    return localStorage.getItem('nexgen-view-mode') === 'mobile'
  })

  useEffect(() => {
    localStorage.setItem('nexgen-view-mode', mobileMode ? 'mobile' : 'desktop')
  }, [mobileMode])

  return (
    <ViewModeContext.Provider value={{ mobileMode, setMobileMode }}>
      {children}
    </ViewModeContext.Provider>
  )
}

export function useViewMode() {
  return useContext(ViewModeContext)
}
