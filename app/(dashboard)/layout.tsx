import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-lg text-foreground">Vajdhata School ERP</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Dashboard</span>
        </div>
      </header>
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
