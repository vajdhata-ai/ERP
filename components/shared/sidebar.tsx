'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { NavItem } from '@/lib/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  navItems: NavItem[]
  isOpen: boolean
  onClose: () => void
}

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const pathname = usePathname()
  const Icon = item.icon

  // Active if exact match OR if the path starts with href and href is not just "/"
  const isActive =
    pathname === item.href ||
    (item.href !== '/' &&
      item.href.includes('#')
        ? false
        : pathname.startsWith(item.href + '/') && item.href.split('/').length > 2)

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-primary text-primary-foreground shadow-xs'
          : 'text-foreground/70 hover:bg-accent/80 hover:text-foreground'
      )}
    >
      <Icon
        className={cn(
          'h-4.5 w-4.5 shrink-0 transition-colors',
          isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
        )}
        style={{ height: '18px', width: '18px' }}
      />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            'ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold',
            isActive
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-primary/10 text-primary'
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  )
}

export function Sidebar({ navItems, isOpen, onClose }: SidebarProps) {
  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const SidebarContent = (
    <nav className="flex flex-col h-full py-4 px-3 overflow-y-auto" aria-label="Main navigation">
      <div className="space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href + item.label} item={item} onClick={onClose} />
        ))}
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar: always visible, fixed on left */}
      <aside className="hidden md:flex md:w-60 lg:w-64 shrink-0 flex-col border-r border-border bg-card min-h-screen sticky top-0 h-screen overflow-y-auto">
        {SidebarContent}
      </aside>

      {/* Mobile: slide-over drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-in fade-in"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col border-r border-border bg-card shadow-2xl md:hidden animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/70">
              <span className="font-bold text-sm text-foreground tracking-tight">Navigation</span>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {SidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
