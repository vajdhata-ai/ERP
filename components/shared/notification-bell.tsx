'use client'

import * as React from 'react'
import { Bell, CheckCheck, Clock, Info, AlertCircle, BookOpen, DollarSign, Bus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { NotificationItem } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface NotificationBellProps {
  profileId?: string
  schoolId?: string
}

export function NotificationBell({ profileId }: NotificationBellProps) {
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = React.useState(0)
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch initial notifications
  const fetchNotifications = React.useCallback(async () => {
    if (!profileId) return
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profileId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.warn('Could not fetch notifications:', error.message)
        return
      }

      if (data) {
        setNotifications(data as NotificationItem[])
        setUnreadCount(data.filter((n: NotificationItem) => !n.is_read).length)
      }
    } catch (err) {
      console.warn('Error fetching notifications:', err)
    }
  }, [profileId, supabase])


  React.useEffect(() => {
    fetchNotifications()

    // Realtime subscription if available
    if (!profileId) return
    const channel = supabase
      .channel(`notifications-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          fetchNotifications()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId, fetchNotifications, supabase])

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!profileId) return
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)

      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('profile_id', profileId)
        .eq('is_read', false)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'fee':
        return <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      case 'homework':
        return <BookOpen className="h-4 w-4 text-sky-600 dark:text-sky-400" />
      case 'transport':
        return <Bus className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      case 'attendance':
        return <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      default:
        return <Info className="h-4 w-4 text-primary" />
    }
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        aria-expanded={isOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-xs animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl border border-border bg-card shadow-xl z-50 text-foreground animate-in fade-in-50 zoom-in-95 overflow-hidden">
          <div className="p-3.5 border-b border-border/70 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold tracking-tight text-foreground">Notifications</h4>
              {unreadCount > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">No notifications</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  You are all caught up for today!
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => !item.is_read && markAsRead(item.id)}
                  className={cn(
                    'p-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-muted/40',
                    !item.is_read && 'bg-primary/5 dark:bg-primary/10'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted border border-border/80">
                    {getNotificationIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          'text-xs line-clamp-1',
                          !item.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
                        )}
                      >
                        {item.title}
                      </p>
                      {!item.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                      {item.body}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {item.created_at
                          ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                          : 'just now'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
