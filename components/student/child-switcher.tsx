'use client'
/* eslint-disable @next/next/no-img-element */

import * as React from 'react'
import { Users, Check, ChevronDown } from 'lucide-react'
import { LinkedChild } from '@/lib/data/student-dashboard'
import { cn } from '@/lib/utils'

interface ChildSwitcherProps {
  childrenList: LinkedChild[]
  activeChildId: string
  onSelectChild: (childId: string) => void
  className?: string
}

export function ChildSwitcher({
  childrenList,
  activeChildId,
  onSelectChild,
  className,
}: ChildSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  const activeChild =
    childrenList.find((c) => c.id === activeChildId) || childrenList[0]

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (childrenList.length <= 1) {
    return null
  }

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'relative inline-block w-full sm:w-auto',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 shrink-0">
          <Users className="h-3.5 w-3.5 text-primary" />
          Switch Child:
        </span>

        {/* Large screens: Segmented pill tabs */}
        <div className="hidden sm:inline-flex items-center p-1 rounded-xl bg-muted/70 border border-border/70 shadow-2xs gap-1">
          {childrenList.map((child) => {
            const isSelected = child.id === activeChild?.id
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => onSelectChild(child.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  isSelected
                    ? 'bg-card text-foreground font-semibold shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                aria-pressed={isSelected}
              >
                {child.avatar_url ? (
                  <img
                    src={child.avatar_url}
                    alt={child.full_name}
                    className="h-5 w-5 rounded-full object-cover ring-1 ring-border shrink-0"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                    {child.full_name.charAt(0)}
                  </div>
                )}
                <span className="truncate max-w-[120px]">{child.full_name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                  {child.class_name}-{child.section_name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Mobile dropdown selector */}
        <div className="sm:hidden relative w-full">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-card border border-border shadow-xs text-xs font-semibold text-foreground"
          >
            <div className="flex items-center gap-2 truncate">
              {activeChild?.avatar_url ? (
                <img
                  src={activeChild.avatar_url}
                  alt={activeChild.full_name}
                  className="h-5 w-5 rounded-full object-cover ring-1 ring-border shrink-0"
                />
              ) : (
                <div className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                  {activeChild?.full_name?.charAt(0) || 'S'}
                </div>
              )}
              <span className="truncate">{activeChild?.full_name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                {activeChild?.class_name}-{activeChild?.section_name}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-muted-foreground transition-transform shrink-0',
                isOpen && 'rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-xl border border-border bg-card shadow-lg p-1 space-y-1 animate-in fade-in-50 zoom-in-95">
              {childrenList.map((child) => {
                const isSelected = child.id === activeChild?.id
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => {
                      onSelectChild(child.id)
                      setIsOpen(false)
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors text-left',
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-accent text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {child.avatar_url ? (
                        <img
                          src={child.avatar_url}
                          alt={child.full_name}
                          className="h-6 w-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                          {child.full_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="truncate font-medium">{child.full_name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Class {child.class_name}-{child.section_name} • Adm: {child.admission_no}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-primary shrink-0 ml-2" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
