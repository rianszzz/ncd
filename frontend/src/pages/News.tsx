import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'motion/react'
import {
  ArrowRight,
  Share2,
  Check,
  X,
  Tag,
  RotateCw,
} from 'lucide-react'
import { api, Post } from '../services/api'
import { NewsCardSkeleton } from '../components/Skeletons'

type CategoryFilter = 'ALL' | 'Pengumuman' | 'Rilis Produk' | 'Riset & Edukasi'

const CATEGORIES: CategoryFilter[] = ['ALL', 'Pengumuman', 'Rilis Produk', 'Riset & Edukasi']

function getReadingTime(text: string): string {
  if (!text) return '1 mnt baca'
  const words = text.trim().split(/\s+/).length
  return `${Math.max(1, Math.ceil(words / 160))} mnt baca`
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
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
          className="px-1.5 py-0.5 rounded-none bg-[#111215]/6 font-mono text-xs text-[#6456EB]"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}

/**
 * Memoized, lag-free markdown renderer: parses once per post body.
 */
const MarkdownContent = React.memo(function MarkdownContent({ content }: { content: string }) {
  const renderedElements = useMemo(() => {
    const lines = content.split('\n')
    return lines.map((line, idx) => {
      const trimmed = line.trim()
      if (!trimmed) return <div key={idx} className="h-2" />

      if (trimmed.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-lg md:text-xl font-bold tracking-tight text-[#111215] pt-3">
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
        return <hr key={idx} className="border-[#111215]/10 my-5" />
      }

      if (trimmed.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="p-3.5 my-3 rounded-none bg-[#111215]/5 border-l-4 border-[#6456EB] font-mono text-xs md:text-sm text-[#111215] overflow-x-auto"
          >
            {trimmed.replace('> ', '')}
          </blockquote>
        )
      }

      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        return (
          <li key={idx} className="ml-5 list-disc text-[#525660]">
            <span className="text-[#111215]">{renderInlineFormatting(trimmed.substring(2))}</span>
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
    })
  }, [content])

  return (
    <div className="space-y-4 text-[#111215] text-sm md:text-base leading-relaxed">
      {renderedElements}
    </div>
  )
})

export function News() {
  const shouldReduceMotion = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  // Fetch posts with caching for low-connection / offline tolerance
  const {
    data: posts,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery<Post[]>({
    queryKey: ['publicPosts'],
    queryFn: async () => {
      const res = await api.get('/public/posts')
      return res.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache validity
    gcTime: 1000 * 60 * 30, // 30 minutes in memory
    retry: 2,
  })

  // Prevent background body scroll when reader is open
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
      if (e.key === 'Escape') setSelectedPost(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredPosts = useMemo(() => {
    if (!posts) return []
    if (activeCategory === 'ALL') return posts
    return posts.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase())
  }, [posts, activeCategory])

  const pinnedPost = useMemo(() => {
    if (activeCategory === 'ALL') return posts?.find((p) => p.is_pinned) || null
    return filteredPosts.find((p) => p.is_pinned) || null
  }, [posts, filteredPosts, activeCategory])

  const gridPosts = useMemo(() => {
    if (!pinnedPost) return filteredPosts
    return filteredPosts.filter((p) => p.id !== pinnedPost.id)
  }, [filteredPosts, pinnedPost])

  const handleCopyLink = (post: Post, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/news#${post.slug}`)
    setCopiedSlug(post.slug)
    setTimeout(() => setCopiedSlug(null), 2500)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-20 text-left">
      <motion.div
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
        className="mb-10 md:mb-12"
      >
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Portal Warta & Berita
        </h1>
        <p className="text-xs sm:text-sm text-[#525660] mt-2.5 leading-relaxed max-w-2xl">
          Rangkuman pengumuman resmi, catatan rilis arsitektur sistem, dan publikasi kajian riset teknologi Nusantara Code Division.
        </p>

        {/* Category Toolbar */}
        <div role="group" aria-label="Filter kategori warta" className="mt-8 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
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
                aria-pressed={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 min-h-[40px] rounded-none text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-[#111215] text-[#F4F1EB]'
                    : 'text-[#525660] hover:text-[#111215] hover:bg-[#111215]/4'
                }`}
              >
                <span>{cat === 'ALL' ? 'Semua Berita' : cat}</span>
                <span className={`text-[11px] font-tabular font-semibold ${isActive ? 'text-[#F4F1EB]' : 'text-[#525660]'}`}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>
      </motion.div>

      {isLoading && (
        <div className="space-y-8">
          <div className="w-full h-64 rounded-none bg-white border border-[#111215]/8 p-8 animate-pulse flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-28 h-6 rounded-none bg-[#111215]/8" />
              <div className="w-2/3 h-8 rounded-none bg-[#111215]/10" />
              <div className="w-full h-4 rounded-none bg-[#111215]/6" />
              <div className="w-4/5 h-4 rounded-none bg-[#111215]/6" />
            </div>
            <div className="w-36 h-5 rounded-none bg-[#111215]/8" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <NewsCardSkeleton />
            <NewsCardSkeleton />
            <NewsCardSkeleton />
          </div>
        </div>
      )}

      {isError && !isLoading && (
        <div className="p-8 rounded-none bg-white border border-rose-200 text-center max-w-lg mx-auto">
          <p className="text-sm font-semibold text-rose-600 mb-1">Koneksi Terputus atau Lambat</p>
          <p className="text-xs text-[#525660] mb-4">
            Terjadi kendala saat mengambil data publikasi. Periksa koneksi Anda dan coba kembali.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-none bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-[#6456EB] transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Memuat Ulang...' : 'Coba Lagi'}</span>
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="space-y-10">
          {pinnedPost && (
            <article
              onClick={() => setSelectedPost(pinnedPost)}
              className="bg-white rounded-none border border-[#111215]/8 p-6 md:p-8 shadow-2xs hover:border-[#111215]/20 hover:shadow-xs transition-all cursor-pointer group"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#111215]/6 text-xs">
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#6456EB]">
                  Disorot · {pinnedPost.category}
                </span>
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
                    className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-none text-[#525660] hover:bg-[#111215]/5 hover:text-[#111215] transition-colors cursor-pointer"
                    title="Salin tautan artikel"
                  >
                    {copiedSlug === pinnedPost.slug ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#6456EB] group-hover:translate-x-0.5 transition-transform">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </article>
          )}

          <div>
            {!pinnedPost && gridPosts.length === 0 ? (
              <div className="p-12 text-center rounded-none bg-white border border-[#111215]/8 shadow-2xs">
                <h3 className="text-base font-semibold text-[#111215] mb-1">
                  {posts && posts.length === 0
                    ? 'Belum ada warta publikasi'
                    : 'Tidak Ada Berita Ditemukan'}
                </h3>
                <p className="text-xs text-[#525660] mb-4">
                  {posts && posts.length === 0
                    ? 'Informasi warta dan pengumuman resmi NCD akan diterbitkan dan dikelola oleh administrator.'
                    : `Belum ada artikel untuk kategori "${activeCategory}".`}
                </p>
                {posts && posts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveCategory('ALL')}
                    className="px-4 py-2 min-h-[40px] rounded-none bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-[#6456EB] transition-colors cursor-pointer"
                  >
                    Tampilkan Semua Berita
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map((post) => (
                  <article
                    key={post.id}
                    onClick={() => setSelectedPost(post)}
                    className="bg-white rounded-none border border-[#111215]/8 p-6 shadow-2xs hover:border-[#111215]/20 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-[#111215]/6 text-xs gap-2">
                        <span className={`font-semibold uppercase tracking-wider text-[11px] ${getCategoryColor(post.category)}`}>
                          {post.category}
                        </span>
                        <span className="text-[11px] text-[#525660] font-tabular">{getReadingTime(post.content_md)}</span>
                      </div>

                      <h3 className="text-base font-semibold text-[#111215] group-hover:text-[#6456EB] transition-colors line-clamp-2 mt-3 mb-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs text-[#525660] leading-relaxed line-clamp-3 mb-3">{post.summary}</p>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 rounded-none text-[10px] font-medium bg-[#111215]/4 text-[#525660]">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-[#111215]/8 flex items-center justify-between text-xs text-[#525660]">
                      <span className="truncate font-medium text-[#111215] text-[11px] max-w-[60%]">{post.author_name}</span>
                      <span className="text-[11px] font-tabular text-[#525660] shrink-0">{formatDate(post.published_at)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reader Modal */}
      {selectedPost && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#111215]/60 flex items-end sm:items-center justify-center sm:p-4 md:p-6 overflow-hidden overscroll-contain"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white w-full h-[100dvh] sm:h-auto sm:max-h-[88vh] sm:max-w-3xl rounded-none border-0 sm:border border-[#111215]/10 shadow-xl flex flex-col overflow-hidden will-change-transform transform-gpu overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="shrink-0 p-4 sm:p-5 md:px-8 border-b border-[#111215]/8 flex items-center justify-between bg-white z-10">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold uppercase tracking-wider ${getCategoryColor(selectedPost.category)}`}>
                  {selectedPost.category}
                </span>
                <span className="text-[#525660] text-xs">•</span>
                <span className="text-xs text-[#525660] font-tabular">{formatDate(selectedPost.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCopyLink(selectedPost, e)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-none text-[#525660] hover:bg-[#111215]/5 transition-colors cursor-pointer"
                  title="Bagikan tautan artikel"
                >
                  {copiedSlug === selectedPost.slug ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPost(null)}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-none text-[#525660] hover:bg-[#111215]/5 hover:text-[#111215] transition-colors cursor-pointer"
                  title="Tutup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Reader Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 md:p-8 overscroll-contain">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-[-0.02em] text-[#111215] mb-4 leading-tight">
                {selectedPost.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 pb-6 mb-6 border-b border-[#111215]/8 text-xs text-[#525660]">
                <div>
                  Ditulis oleh <span className="font-semibold text-[#111215]">{selectedPost.author_name}</span>
                </div>
                <span>•</span>
                <div className="font-tabular">{getReadingTime(selectedPost.content_md)}</div>
              </div>

              {/* Parsed Markdown Output */}
              <MarkdownContent content={selectedPost.content_md} />

              {/* Tags Section */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-[#111215]/8">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-3.5 h-3.5 text-[#525660]" />
                    {selectedPost.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded-none text-xs bg-[#111215]/5 text-[#525660] font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 p-4 border-t border-[#111215]/8 bg-[#F4F1EB]/40 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 min-h-[40px] rounded-none bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-[#6456EB] transition-colors cursor-pointer"
              >
                Tutup Bacaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default News
