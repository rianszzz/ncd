import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  Share2,
  Check,
  X,
  Tag,
} from 'lucide-react'
import { api, Post } from '../services/api'
import { NewsCardSkeleton } from '../components/Skeletons'

type CategoryFilter = 'ALL' | 'Pengumuman' | 'Rilis Produk' | 'Riset & Edukasi'

const CATEGORIES: CategoryFilter[] = ['ALL', 'Pengumuman', 'Rilis Produk', 'Riset & Edukasi']

function getReadingTime(text: string): string {
  if (!text) return '1 mnt baca'
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 160))
  return `${minutes} mnt baca`
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Pengumuman':
      return 'text-amber-800'
    case 'Rilis Produk':
      return 'text-[#6456EB]'
    case 'Riset & Edukasi':
      return 'text-emerald-800'
    default:
      return 'text-[#525660]'
  }
}

/**
 * Lightweight, accessible markdown renderer for post body
 */
function MarkdownContent({ content }: { content: string }) {
  const lines = useMemo(() => content.split('\n'), [content])

  return (
    <div className="space-y-4 text-[#111215] text-sm md:text-base leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim()

        if (!trimmed) {
          return <div key={idx} className="h-2" />
        }

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-lg md:text-xl font-bold tracking-tight text-[#111215] pt-4">
              {trimmed.replace('### ', '')}
            </h3>
          )
        }

        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-base md:text-lg font-semibold tracking-tight text-[#111215] pt-2">
              {trimmed.replace('#### ', '')}
            </h4>
          )
        }

        if (trimmed === '---') {
          return <hr key={idx} className="border-[#111215]/10 my-6" />
        }

        if (trimmed.startsWith('> ')) {
          return (
            <blockquote
              key={idx}
              className="p-3.5 my-3 rounded-xl bg-[#111215]/5 border-l-4 border-[#6456EB] font-mono text-xs md:text-sm text-[#111215] overflow-x-auto"
            >
              {trimmed.replace('> ', '')}
            </blockquote>
          )
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.substring(2)
          return (
            <li key={idx} className="ml-5 list-disc text-[#525660]">
              <span className="text-[#111215]">{renderInlineFormatting(itemText)}</span>
            </li>
          )
        }

        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)/)
        if (numberedMatch) {
          return (
            <div key={idx} className="ml-4 flex items-start gap-2 text-[#525660]">
              <span className="font-semibold text-[#6456EB] font-tabular">{numberedMatch[1]}.</span>
              <span className="text-[#111215]">{renderInlineFormatting(numberedMatch[2])}</span>
            </div>
          )
        }

        return (
          <p key={idx} className="text-[#525660]">
            {renderInlineFormatting(line)}
          </p>
        )
      })}
    </div>
  )
}

function renderInlineFormatting(text: string) {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[#111215]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded-md bg-[#111215]/6 font-mono text-xs text-[#6456EB]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

export function News() {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Fetch posts from API
  const { data: posts, isLoading, error } = useQuery<Post[]>({
    queryKey: ['publicPosts'],
    queryFn: async () => {
      const res = await api.get('/public/posts')
      return res.data
    },
  })

  // Prevent scroll when modal is open
  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedPost])

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedPost(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filtered posts based on active category
  const filteredPosts = useMemo(() => {
    if (!posts) return []
    if (activeCategory === 'ALL') return posts
    return posts.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase())
  }, [posts, activeCategory])

  // Pinned post (shown as featured hero if exists and matches filter)
  const pinnedPost = useMemo(() => {
    if (activeCategory === 'ALL') {
      return posts?.find((p) => p.is_pinned) || null
    }
    return filteredPosts.find((p) => p.is_pinned) || null
  }, [posts, filteredPosts, activeCategory])

  // Grid posts: excluding featured pinned post if shown at top
  const gridPosts = useMemo(() => {
    if (!pinnedPost) return filteredPosts
    return filteredPosts.filter((p) => p.id !== pinnedPost.id)
  }, [filteredPosts, pinnedPost])

  // Share / Copy handler
  const handleCopyLink = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/news#${post.slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(post.slug)
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 text-left">
      {/* Page Header without sub-heading or eyebrow */}
      <div className="mb-10 md:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Portal Warta & Berita
        </h1>
        <p className="text-xs sm:text-sm text-[#525660] mt-2.5 leading-relaxed max-w-2xl">
          Rangkuman pengumuman resmi, catatan rilis arsitektur sistem, dan publikasi kajian riset teknologi Nusantara Code Division.
        </p>

        {/* Category Filters Toolbar */}
        <div className="mt-8 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {CATEGORIES.map((cat) => {
            const count =
              cat === 'ALL'
                ? posts?.length ?? 0
                : posts?.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length ?? 0
            const isActive = activeCategory === cat

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 min-h-[38px] rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#111215] text-[#F4F1EB]'
                    : 'text-[#525660] hover:text-[#111215] hover:bg-[#111215]/4'
                }`}
              >
                <span>{cat === 'ALL' ? 'Semua Warta' : cat}</span>
                <span
                  className={`text-[11px] font-tabular ${
                    isActive ? 'text-[#F4F1EB]/70' : 'text-[#525660]/70'
                  }`}
                >
                  ({count})
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-8">
          <div className="w-full h-64 rounded-2xl bg-white border border-[#111215]/8 p-8 animate-pulse flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-28 h-6 rounded-xl bg-[#111215]/8" />
              <div className="w-2/3 h-8 rounded-lg bg-[#111215]/10" />
              <div className="w-full h-4 rounded bg-[#111215]/6" />
              <div className="w-4/5 h-4 rounded bg-[#111215]/6" />
            </div>
            <div className="w-36 h-5 rounded bg-[#111215]/8" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="p-8 rounded-2xl bg-white border border-rose-200 text-center">
          <p className="text-sm font-semibold text-rose-600 mb-1">Gagal Memuat Warta</p>
          <p className="text-xs text-[#525660]">
            Terjadi kendala saat mengambil data publikasi. Silakan muat ulang halaman.
          </p>
        </div>
      )}

      {/* Content View */}
      {!isLoading && !error && (
        <div className="space-y-10">
          {/* Highlight / Pinned Hero Article */}
          {pinnedPost && (
            <article
              onClick={() => setSelectedPost(pinnedPost)}
              className="bg-white rounded-2xl border border-[#111215]/8 p-6 md:p-8 shadow-2xs hover:border-[#111215]/20 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#111215]/6 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB]">
                    Disorot · {pinnedPost.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-[#525660] font-tabular">
                  <span>{formatDate(pinnedPost.published_at)}</span>
                  <span>•</span>
                  <span>{getReadingTime(pinnedPost.content_md)}</span>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-[-0.02em] text-[#111215] mb-2.5 group-hover:text-[#6456EB] transition-colors leading-tight">
                  {pinnedPost.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#525660] leading-relaxed max-w-3xl">
                  {pinnedPost.summary}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-[#111215]/8 text-xs">
                <div className="text-xs text-[#525660]">
                  <span>Penulis: </span>
                  <span className="text-[#111215] font-semibold">{pinnedPost.author_name}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(pinnedPost, e)}
                    className="p-2 min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-[#525660] hover:bg-[#111215]/5 hover:text-[#111215] transition-colors cursor-pointer"
                    title="Salin tautan artikel"
                  >
                    {copiedSlug === pinnedPost.slug ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                  </button>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#6456EB] group-hover:translate-x-0.5 transition-transform">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </article>
          )}

          {/* Post Grid */}
          <div>
            {gridPosts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#111215]/8">
                <h3 className="text-sm font-semibold text-[#111215] mb-1">
                  Tidak Ada Warta Ditemukan
                </h3>
                <p className="text-xs text-[#525660] mb-4">
                  Belum ada artikel warta untuk kategori "{activeCategory}".
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory('ALL')}
                  className="px-4 py-2 rounded-xl bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-[#6456EB] transition-colors cursor-pointer"
                >
                  Tampilkan Semua Warta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="bg-white rounded-2xl border border-[#111215]/8 p-6 shadow-2xs hover:border-[#111215]/20 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      {/* Top Metadata Row */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#111215]/6 text-xs gap-2">
                        <span className={`font-semibold uppercase tracking-wider text-[11px] ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                        <span className="text-[11px] text-[#525660] font-tabular">
                          {getReadingTime(post.content_md)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-semibold text-[#111215] group-hover:text-[#6456EB] transition-colors line-clamp-2 mt-3 mb-2 leading-snug">
                        {post.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-xs text-[#525660] leading-relaxed line-clamp-3 mb-3">
                        {post.summary}
                      </p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#111215]/4 text-[#525660]"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer: Author & Date */}
                    <div className="mt-4 pt-3.5 border-t border-[#111215]/8 flex items-center justify-between text-xs text-[#525660]">
                      <span className="truncate font-medium text-[#111215] text-[11px] max-w-[60%]">
                        {post.author_name}
                      </span>
                      <span className="text-[11px] font-tabular text-[#525660] shrink-0">
                        {formatDate(post.published_at)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reader Modal / Expandable Sheet */}
      {selectedPost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111215]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white max-w-3xl w-full max-h-[92dvh] rounded-2xl border border-[#111215]/10 shadow-xl flex flex-col overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 md:px-8 border-b border-[#111215]/8 flex items-center justify-between bg-white">
              <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB]">
                {selectedPost.is_pinned ? 'Disorot · ' : ''}{selectedPost.category}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(selectedPost, e)}
                  className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#525660] hover:bg-[#111215]/5 hover:text-[#111215] transition-colors cursor-pointer"
                  title="Salin Tautan"
                >
                  {copiedSlug === selectedPost.slug ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <Check className="w-4 h-4" />
                      <span>Tersalin</span>
                    </span>
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg text-[#525660] hover:bg-[#111215]/5 hover:text-[#111215] transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="overflow-y-auto p-6 md:p-8 space-y-6">
              {/* Meta bar */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#525660] font-tabular">
                <span className="font-semibold text-[#111215]">{selectedPost.author_name}</span>
                <span>•</span>
                <span>{formatDate(selectedPost.published_at)}</span>
                <span>•</span>
                <span>{getReadingTime(selectedPost.content_md)}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-semibold tracking-[-0.02em] text-[#111215] leading-tight">
                {selectedPost.title}
              </h2>

              {/* Summary Lead Callout */}
              <div className="pl-4 border-l-2 border-[#6456EB] text-xs md:text-sm text-[#111215] font-medium leading-relaxed">
                {selectedPost.summary}
              </div>

              {/* Full Content Markdown */}
              <div className="pt-2">
                <MarkdownContent content={selectedPost.content_md} />
              </div>

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="pt-6 border-t border-[#111215]/8">
                  <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#525660]">
                    <Tag className="w-3.5 h-3.5 text-[#6456EB]" />
                    <span>Topik & Label:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-[#111215]/4 text-[#525660]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="p-4 px-6 md:px-8 border-t border-[#111215]/8 bg-[#F4F1EB]/40 flex items-center justify-between">
              <span className="text-[11px] text-[#525660]">
                ID Warta: <span className="font-mono text-[#111215]">{selectedPost.slug}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 min-h-[40px] rounded-xl bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-[#6456EB] transition-colors cursor-pointer"
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default News