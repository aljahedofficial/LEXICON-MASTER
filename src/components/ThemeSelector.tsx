'use client'

import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/components/ThemeProvider'
import { THEMES } from '@/lib/themes'

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const groupedThemes = {
    classic: THEMES.filter((t) => t.category === 'classic'),
    grey: THEMES.filter((t) => t.category === 'grey'),
    blue: THEMES.filter((t) => t.category === 'blue'),
    paper: THEMES.filter((t) => t.category === 'paper'),
    lowlight: THEMES.filter((t) => t.category === 'lowlight'),
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
        style={{
          backgroundColor: `${colorTheme.background}20`,
          color: colorTheme.font,
          border: `1px solid ${colorTheme.font}40`,
        }}
        title="Select Theme"
      >
        🎨 Theme
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl border z-50 max-h-96 overflow-y-auto"
          style={{
            backgroundColor: colorTheme.background,
            borderColor: `${colorTheme.font}30`,
          }}
        >
          {/* Classic & High-Contrast */}
          <div className="p-3 border-b" style={{ borderColor: `${colorTheme.font}20` }}>
            <h3
              className="text-xs font-bold uppercase tracking-wide mb-2 opacity-60"
              style={{ color: colorTheme.font }}
            >
              Classic & High-Contrast
            </h3>
            <div className="space-y-1">
              {groupedThemes.classic.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2 py-2 rounded text-sm transition-all hover:opacity-80"
                  style={{
                    backgroundColor:
                      colorTheme.id === theme.id
                        ? `${colorTheme.font}15`
                        : `${colorTheme.font}08`,
                    color: colorTheme.font,
                    border: colorTheme.id === theme.id ? `2px solid ${colorTheme.font}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.font,
                      }}
                    />
                    <span>{theme.name}</span>
                    {colorTheme.id === theme.id && <span className="ml-auto">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Grey-Based */}
          <div className="p-3 border-b" style={{ borderColor: `${colorTheme.font}20` }}>
            <h3
              className="text-xs font-bold uppercase tracking-wide mb-2 opacity-60"
              style={{ color: colorTheme.font }}
            >
              Grey-Based
            </h3>
            <div className="space-y-1">
              {groupedThemes.grey.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2 py-2 rounded text-sm transition-all hover:opacity-80"
                  style={{
                    backgroundColor:
                      colorTheme.id === theme.id
                        ? `${colorTheme.font}15`
                        : `${colorTheme.font}08`,
                    color: colorTheme.font,
                    border: colorTheme.id === theme.id ? `2px solid ${colorTheme.font}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.font,
                      }}
                    />
                    <span>{theme.name}</span>
                    {colorTheme.id === theme.id && <span className="ml-auto">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Blue-Based */}
          <div className="p-3 border-b" style={{ borderColor: `${colorTheme.font}20` }}>
            <h3
              className="text-xs font-bold uppercase tracking-wide mb-2 opacity-60"
              style={{ color: colorTheme.font }}
            >
              Blue-Based (Academic & Tech)
            </h3>
            <div className="space-y-1">
              {groupedThemes.blue.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2 py-2 rounded text-sm transition-all hover:opacity-80"
                  style={{
                    backgroundColor:
                      colorTheme.id === theme.id
                        ? `${colorTheme.font}15`
                        : `${colorTheme.font}08`,
                    color: colorTheme.font,
                    border: colorTheme.id === theme.id ? `2px solid ${colorTheme.font}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.font,
                      }}
                    />
                    <span>{theme.name}</span>
                    {colorTheme.id === theme.id && <span className="ml-auto">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Paper-Like */}
          <div className="p-3 border-b" style={{ borderColor: `${colorTheme.font}20` }}>
            <h3
              className="text-xs font-bold uppercase tracking-wide mb-2 opacity-60"
              style={{ color: colorTheme.font }}
            >
              Paper-Like / Eye-Friendly
            </h3>
            <div className="space-y-1">
              {groupedThemes.paper.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2 py-2 rounded text-sm transition-all hover:opacity-80"
                  style={{
                    backgroundColor:
                      colorTheme.id === theme.id
                        ? `${colorTheme.font}15`
                        : `${colorTheme.font}08`,
                    color: colorTheme.font,
                    border: colorTheme.id === theme.id ? `2px solid ${colorTheme.font}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.font,
                      }}
                    />
                    <span>{theme.name}</span>
                    {colorTheme.id === theme.id && <span className="ml-auto">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Low-Light & Focus */}
          <div className="p-3" style={{ borderColor: `${colorTheme.font}20` }}>
            <h3
              className="text-xs font-bold uppercase tracking-wide mb-2 opacity-60"
              style={{ color: colorTheme.font }}
            >
              Low-Light & Focus
            </h3>
            <div className="space-y-1">
              {groupedThemes.lowlight.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setColorTheme(theme)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-2 py-2 rounded text-sm transition-all hover:opacity-80"
                  style={{
                    backgroundColor:
                      colorTheme.id === theme.id
                        ? `${colorTheme.font}15`
                        : `${colorTheme.font}08`,
                    color: colorTheme.font,
                    border: colorTheme.id === theme.id ? `2px solid ${colorTheme.font}` : 'none',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded border"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.font,
                      }}
                    />
                    <span>{theme.name}</span>
                    {colorTheme.id === theme.id && <span className="ml-auto">✓</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
