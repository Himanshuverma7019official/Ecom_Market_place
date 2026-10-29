import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

type ThemeContextValue = {
  darkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('limited-stock-theme')
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(stored ? stored === 'dark' : systemDark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    window.localStorage.setItem('limited-stock-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const value = useMemo(() => ({ darkMode, toggleTheme: () => setDarkMode((v) => !v) }), [darkMode])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
