'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { THEMES, ThemeConfig, DEFAULT_THEME } from '@/lib/themes'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
  colorTheme: ThemeConfig
  setColorTheme: (theme: ThemeConfig) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [colorTheme, setColorTheme] = useState<ThemeConfig>(DEFAULT_THEME)

  useEffect(() => {
    // Load theme from localStorage
    const storedTheme = localStorage.getItem('theme') as Theme
    if (storedTheme) {
      setTheme(storedTheme)
    }

    // Load color theme from localStorage
    const storedColorTheme = localStorage.getItem('colorTheme')
    if (storedColorTheme) {
      const foundTheme = THEMES.find((t) => t.id === storedColorTheme)
      if (foundTheme) {
        setColorTheme(foundTheme)
      }
    }
  }, [])

  useEffect(() => {
    const root = window.document.documentElement

    // Remove previous theme
    root.classList.remove('light', 'dark')

    // Determine the resolved theme
    let newResolvedTheme: 'light' | 'dark' = 'light'

    if (theme === 'system') {
      newResolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } else {
      newResolvedTheme = theme as 'light' | 'dark'
    }

    setResolvedTheme(newResolvedTheme)
    root.classList.add(newResolvedTheme)
    root.setAttribute('data-theme', newResolvedTheme)

    // Store theme in localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Apply color theme
  useEffect(() => {
    const root = window.document.documentElement
    root.style.setProperty('--color-bg', colorTheme.background)
    root.style.setProperty('--color-font', colorTheme.font)
    localStorage.setItem('colorTheme', colorTheme.id)
  }, [colorTheme])

  // Listen to system theme changes
  useEffect(() => {
    if (theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      const newResolvedTheme = mediaQuery.matches ? 'dark' : 'light'
      setResolvedTheme(newResolvedTheme)
      document.documentElement.classList.remove('light', 'dark')
      document.documentElement.classList.add(newResolvedTheme)
      document.documentElement.setAttribute('data-theme', newResolvedTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
