'use client'

import * as React from 'react'
import { ImageIcon, X, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { getLocalAlbums, GalleryAlbum } from '@/lib/data/gallery'

export default function StudentGalleryPage() {
  const albums = getLocalAlbums()
  
  // Extract unique academic years for tabs
  const years = Array.from(new Set(albums.map(a => a.academic_year))).sort().reverse()
  const [activeYear, setActiveYear] = React.useState(years[0] || '2026-2027')
  
  const [selectedAlbum, setSelectedAlbum] = React.useState<GalleryAlbum | null>(null)
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null)

  const filteredAlbums = albums.filter(a => a.academic_year === activeYear)

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    document.body.style.overflow = 'hidden'
  }
  
  const closeLightbox = () => {
    setLightboxIndex(null)
    document.body.style.overflow = 'auto'
  }

  const nextPhoto = () => {
    if (selectedAlbum && lightboxIndex !== null && lightboxIndex < selectedAlbum.photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1)
    }
  }

  const prevPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1)
    }
  }

  return (
    <div className="space-y-6">
      {!selectedAlbum ? (
        <>
          <PageHeader 
            title="Photo Gallery" 
            subtitle="Memories, events, and highlights from the school year."
          />

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setActiveYear(year)}
                className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeYear === year ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground hover:bg-muted'}`}
              >
                {year}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filteredAlbums.map(album => (
              <div 
                key={album.id} 
                className="group relative rounded-2xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedAlbum(album)}
              >
                <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                  <img src={album.cover_photo_url} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 text-white flex items-center gap-1">
                    <ImageIcon className="h-4 w-4" />
                    <span className="text-xs font-bold">{album.photo_count} photos</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm line-clamp-1">{album.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{album.month}</p>
                </div>
              </div>
            ))}
            {filteredAlbums.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p>No albums found for {activeYear}</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedAlbum(null)}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-bold">{selectedAlbum.title}</h2>
              <p className="text-sm text-muted-foreground">{selectedAlbum.month} {selectedAlbum.academic_year} • {selectedAlbum.photo_count} photos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedAlbum.photos.map((photo, index) => (
              <div 
                key={photo.id} 
                className="aspect-square bg-muted rounded-xl overflow-hidden cursor-pointer group relative"
                onClick={() => openLightbox(index)}
              >
                <img src={photo.photo_url} alt={photo.caption || ''} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Play className="h-8 w-8 text-white fill-white opacity-80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && selectedAlbum && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <button onClick={closeLightbox} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <X className="h-6 w-6" />
          </button>
          
          <button 
            onClick={prevPhoto}
            disabled={lightboxIndex === 0}
            className="absolute left-6 p-3 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="max-w-4xl max-h-[80vh] w-full px-16 flex flex-col items-center">
            <img 
              src={selectedAlbum.photos[lightboxIndex].photo_url} 
              alt="Gallery" 
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
            {selectedAlbum.photos[lightboxIndex].caption && (
              <p className="text-white/80 mt-6 text-lg font-medium tracking-wide">
                {selectedAlbum.photos[lightboxIndex].caption}
              </p>
            )}
            <p className="text-white/40 text-sm mt-2 font-mono">
              {lightboxIndex + 1} / {selectedAlbum.photos.length}
            </p>
          </div>

          <button 
            onClick={nextPhoto}
            disabled={lightboxIndex === selectedAlbum.photos.length - 1}
            className="absolute right-6 p-3 text-white/70 hover:text-white rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      )}
    </div>
  )
}
