// lib/data/gallery.ts
export type GalleryAlbum = {
  id: string
  title: string
  month: string
  academic_year: string
  cover_photo_url: string
  photo_count: number
  photos: GalleryPhoto[]
}

export type GalleryPhoto = {
  id: string
  photo_url: string
  caption?: string
}

export const DEMO_ALBUMS: GalleryAlbum[] = [
  {
    id: 'gal-1',
    title: 'Annual Sports Day 2026',
    month: 'December',
    academic_year: '2026-2027',
    cover_photo_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=600&auto=format&fit=crop',
    photo_count: 5,
    photos: [
      { id: 'p1', photo_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format&fit=crop', caption: '100m Sprint Finals' },
      { id: 'p2', photo_url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?q=80&w=1200&auto=format&fit=crop', caption: 'Relay Race' },
      { id: 'p3', photo_url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200&auto=format&fit=crop', caption: 'Medal Ceremony' },
    ]
  },
  {
    id: 'gal-2',
    title: 'Science Exhibition',
    month: 'August',
    academic_year: '2026-2027',
    cover_photo_url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?q=80&w=600&auto=format&fit=crop',
    photo_count: 3,
    photos: [
      { id: 'p4', photo_url: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?q=80&w=1200&auto=format&fit=crop', caption: 'Robotics Project' },
      { id: 'p5', photo_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1200&auto=format&fit=crop', caption: 'Chemistry Lab Demo' },
    ]
  }
]

export function getLocalAlbums() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('erp_gallery_albums')
    if (saved) return JSON.parse(saved) as GalleryAlbum[]
    localStorage.setItem('erp_gallery_albums', JSON.stringify(DEMO_ALBUMS))
  }
  return DEMO_ALBUMS
}

export function saveLocalAlbums(albums: GalleryAlbum[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('erp_gallery_albums', JSON.stringify(albums))
  }
}
