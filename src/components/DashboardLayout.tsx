'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { TopNav } from './Navigation'
import { Sidebar } from './Navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
  rightContent?: React.ReactNode
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📊' },
  { label: 'New Extraction', href: '/dashboard/extraction', icon: '📤' },
  { label: 'Projects', href: '/dashboard/projects', icon: '📁' },
  { label: 'Flashcards', href: '/dashboard/flashcards', icon: '📝' },
  { label: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
  { label: 'Settings', href: '/dashboard/settings', icon: '⚙️' },
]

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, rightContent }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        items={navItems}
        activeHref={pathname}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          rightContent={rightContent}
        />
        <main className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
