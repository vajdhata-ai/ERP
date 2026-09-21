'use client'

import * as React from 'react'
import { Plus, Image as ImageIcon, Upload, X, Trash2, FolderOpen } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalAlbums, saveLocalAlbums, GalleryAlbum } from '@/lib/data/gallery'
import { toast } from 'sonner'

export default function TeacherGalleryPage() {
  const [albums, setAlbums] = React.useState(getLocalAlbums())
  const [isCreating, setIsCreating] = React.useState(false)
  const [formData, setFormData] = React.useState({ title: '', month: 'August', academic_year: '2026-2027' })
  const [files, setFiles] = React.useState<File[]>([])
  const [uploading, setUploading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const simulateCompression = async () => {
    // In a real app, we'd draw the image to a canvas and use toDataURL/toBlob here
    return new Promise(resolve => setTimeout(resolve, 800))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0) {
      toast.error('Please select at least one photo')
      return
    }

    setUploading(true)
    
    // Simulate compression + upload for each file
    toast.loading(`Compressing and uploading ${files.length} photos...`)
    await simulateCompression()
    
    const newAlbum: GalleryAlbum = {
      id: crypto.randomUUID(),
      title: formData.title,
      month: formData.month,
      academic_year: formData.academic_year,
      cover_photo_url: URL.createObjectURL(files[0]), // Mock local URL
      photo_count: files.length,
      photos: files.map((f, i) => ({
        id: crypto.randomUUID(),
        photo_url: URL.createObjectURL(f),
        caption: `Photo ${i + 1}`
      }))
    }

    const updated = [newAlbum, ...albums]
    setAlbums(updated)
    saveLocalAlbums(updated)
    
    toast.dismiss()
    toast.success('Album created successfully')
    
    setIsCreating(false)
    setFormData({ title: '', month: 'August', academic_year: '2026-2027' })
    setFiles([])
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gallery Management" 
        subtitle="Upload photos for school events. Images are automatically compressed before upload."
        action={
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Create Album
          </button>
        }
      />

      {isCreating && (
        <div className="rounded-2xl border bg-card shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">New Album</h3>
            <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-muted rounded-full">
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Album Title *</label>
                <input required value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Month *</label>
                  <select required value={formData.month} onChange={e => setFormData(p => ({ ...p, month: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none">
                    <option>August</option><option>September</option><option>October</option><option>November</option><option>December</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Academic Year *</label>
                  <input required value={formData.academic_year} onChange={e => setFormData(p => ({ ...p, academic_year: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border rounded-lg bg-background focus:ring-1 ring-primary outline-none" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold">Photos * (Client-side compression enabled)</label>
              <div 
                className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 transition-colors h-[132px]"
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold">Click to select files</p>
                <p className="text-xs text-muted-foreground mt-1">{files.length} files selected</p>
              </div>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t">
              <button type="submit" disabled={uploading} className="px-6 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {uploading ? 'Processing...' : 'Upload & Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {albums.map(album => (
          <div key={album.id} className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all">
            <div className="aspect-[4/3] bg-muted relative">
              <img src={album.cover_photo_url} alt={album.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm">
                  <FolderOpen className="h-5 w-5" />
                </button>
                <button className="p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full backdrop-blur-sm"
                  onClick={() => {
                    const newAlbums = albums.filter(a => a.id !== album.id)
                    setAlbums(newAlbums)
                    saveLocalAlbums(newAlbums)
                    toast.success('Album deleted')
                  }}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-sm line-clamp-1">{album.title}</h3>
                <span className="text-xs bg-muted px-2 py-0.5 rounded font-semibold text-muted-foreground shrink-0">{album.photo_count} photos</span>
              </div>
              <p className="text-xs text-muted-foreground">{album.month} • {album.academic_year}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
