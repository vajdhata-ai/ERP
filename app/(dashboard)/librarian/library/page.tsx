'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { Search, Plus, Book, BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'

type LibraryBook = {
  id: string
  accession_no: string
  title: string
  author: string
  publisher: string | null
  subject: string | null
  book_type: string
  total_copies: number
  available_copies: number
}

export default function LibrarianCatalogPage() {
  const [books, setBooks] = React.useState<LibraryBook[]>([])
  const [loading, setLoading] = React.useState(true)
  const [search, setSearch] = React.useState('')
  const [isAddOpen, setIsAddOpen] = React.useState(false)

  // Add form state
  const [formData, setFormData] = React.useState({
    title: '', author: '', accession_no: '', publisher: '', subject: '', book_type: 'Textbook', total_copies: 1
  })
  const [submitting, setSubmitting] = React.useState(false)

  const fetchBooks = React.useCallback(async (q = '') => {
    setLoading(true)
    try {
      const res = await fetch(`/api/library/books?search=${encodeURIComponent(q)}`)
      const data = await res.json()
      setBooks(data.books || [])
    } catch {
      toast.error('Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchBooks(search)
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/library/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Book added: ${data.book.title}`)
        setIsAddOpen(false)
        setFormData({ title: '', author: '', accession_no: '', publisher: '', subject: '', book_type: 'Textbook', total_copies: 1 })
        fetchBooks()
      } else {
        toast.error(data.error || 'Failed to add book')
      }
    } catch (err: any) {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Library Catalog" 
        subtitle="Manage books, add new stock, and search the inventory."
        action={
          <button onClick={() => setIsAddOpen(!isAddOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add Book
          </button>
        }
      />

      {isAddOpen && (
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <h3 className="text-lg font-bold mb-4">Add New Book</h3>
          <form onSubmit={handleAddSubmit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Title *</label>
              <input required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Author *</label>
              <input required value={formData.author} onChange={e => setFormData(p => ({ ...p, author: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Accession Number *</label>
              <input required value={formData.accession_no} onChange={e => setFormData(p => ({ ...p, accession_no: e.target.value }))}
                placeholder="e.g. ACC-1001"
                className="w-full px-3 py-2 text-sm font-mono border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Subject</label>
              <input value={formData.subject} onChange={e => setFormData(p => ({ ...p, subject: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Type</label>
              <select value={formData.book_type} onChange={e => setFormData(p => ({ ...p, book_type: e.target.value }))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none">
                <option>Textbook</option>
                <option>Reference</option>
                <option>Fiction</option>
                <option>Non-Fiction</option>
                <option>Magazine</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold">Total Copies</label>
              <input type="number" min="1" required value={formData.total_copies} onChange={e => setFormData(p => ({ ...p, total_copies: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-accent">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {submitting ? 'Adding...' : 'Save Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b bg-muted/20">
          <form onSubmit={handleSearch} className="relative max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by title, author, or accession no..."
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-xl bg-background focus:ring-2 ring-primary/20 outline-none transition-all"
            />
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-4 font-medium text-muted-foreground pl-6">Accession</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Title & Author</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                <th className="text-right p-4 font-medium text-muted-foreground">Availability</th>
                <th className="text-right p-4 font-medium text-muted-foreground pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading catalog...</td>
                </tr>
              ) : books.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No books found matching your search.</td>
                </tr>
              ) : (
                books.map(b => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 pl-6 font-mono text-xs">{b.accession_no}</td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{b.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{b.author}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-accent text-[10px] font-bold uppercase tracking-wide">
                        {b.book_type}
                      </span>
                      {b.subject && <p className="text-xs text-muted-foreground mt-1">{b.subject}</p>}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {b.available_copies} / {b.total_copies}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {b.available_copies > 0 ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs font-bold">
                          <BookOpen className="h-3 w-3" /> Checked Out
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
