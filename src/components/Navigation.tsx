'use client'

import React from 'react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { ThemeSelector } from './ThemeSelector'

interface NavItem {
  label: string
  href: string
  icon?: string
}

interface TopNavProps {
  title?: string
  onMenuClick?: () => void
  rightContent?: React.ReactNode
  projectName?: string
  statsBadge?: string
  userLabel?: string
}

export const TopNav: React.FC<TopNavProps> = ({
  title = 'Lexicon Master',
  onMenuClick,
  rightContent,
  projectName,
  statsBadge,
  userLabel,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              ☰
            </button>
          )}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
          {projectName && (
            <span className="text-sm text-gray-600 dark:text-gray-300">/ {projectName}</span>
          )}
          {statsBadge && (
            <span className="ml-2 text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary">
              {statsBadge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {userLabel && (
            <span className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300">
              {userLabel}
            </span>
          )}
          <ThemeSelector />
          {rightContent || <ThemeToggle />}
        </div>
      </div>
    </header>
  )
}

interface SidebarProps {
  items: NavItem[]
  activeHref?: string
  isOpen?: boolean
  onClose?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  recentProjects?: Array<{ id: string; name: string }>
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeHref,
  isOpen = true,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
  recentProjects = [],
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-200 pt-20 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-0 lg:pt-0 transition-all`}
      >
        <div className="flex items-center justify-between px-4 pt-4">
          {!isCollapsed && (
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Navigation</p>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? '»' : '«'}
            </button>
          )}
        </div>
        <nav className="px-4 py-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${
                activeHref === item.href
                  ? 'bg-primary text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={onClose}
            >
              {item.icon && <span>{item.icon}</span>}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        {!isCollapsed && (
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Recent Projects</p>
            {recentProjects.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">No recent projects</p>
            ) : (
              <ul className="space-y-1">
                {recentProjects.map((project) => (
                  <li key={project.id} className="text-sm text-gray-700 dark:text-gray-300">
                    {project.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </aside>
    </>
  )
}

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-400 dark:text-gray-500">/</span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="text-primary hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}
