import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import {
  Calendar,
  Clock,
  Radio,
  CheckCircle2,
  ArrowRight,
  X,
  Loader2,
  Lock,
  GraduationCap,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  UploadCloud,
  ImageIcon,
} from 'lucide-react'
import {
  registerLearningSession,
  getMyLearningSessionRegistrations,
  getLearningSessionClasses,
  createLearningSessionClass,
  deleteLearningSessionClass,
} from '../services/api'
import fawwazPoster from '../assets/learning-session/fawwaz-poster.png'
import fauzanPoster from '../assets/learning-session/fauzan-poster.png'

export interface ClassSession {
  id?: string
  slug: string
  classNumber: string
  speakerName: string
  title: string
  description: string
  dateLabel: string
  timeLabel: string
  platform: string
  mode: string
  posterUrl: string
  accentColor: string
  discordUrl: string
  isCustom?: boolean
}

export const LEARNING_CLASSES: ClassSession[] = [
  {
    id: 'class-fawwaz-01',
    slug: 'fawwaz-webdev',
    classNumber: 'CLASS 01',
    speakerName: 'Muhammad Fawwaz Rayyan Khalish',
    title: 'WEB DEVELOPMENT FUNDAMENTALS: From Internet to Website',
    description:
      'Pelajari dasar cara kerja internet, HTTP/HTTPS, domain, hosting, DNS, serta bagaimana browser dan server bekerja dalam menampilkan sebuah website.',
    dateLabel: 'Sabtu, 07 November 2026',
    timeLabel: '20.00–21.00 WIB',
    platform: 'Discord',
    mode: 'Online Live Session',
    posterUrl: fawwazPoster,
    accentColor: '#3B82F6',
    discordUrl: 'https://discord.com/events/1566134369398034514/1566142733561634877',
    isCustom: false,
  },
  {
    id: 'class-fauzan-02',
    slug: 'fauzan-team101',
    classNumber: 'CLASS 02',
    speakerName: 'Muhamad Fauzan Al Farikhi',
    title: 'TEAM FORMATION 101: From Strangers to One Team',
    description:
      'Pelajari cara membangun chemistry, mengenali potensi anggota, membagi tanggung jawab, dan menciptakan kolaborasi tim lintas jurusan yang efektif.',
    dateLabel: 'Senin, 16 November 2026',
    timeLabel: '20.00–21.00 WIB',
    platform: 'Discord',
    mode: 'Online Live Session',
    posterUrl: fauzanPoster,
    accentColor: '#6366F1',
    discordUrl: 'https://discord.com/events/1566134369398034514/1566143302619767078',
    isCustom: false,
  },
]

interface Props {
  initialOpenClass?: string | null
  showFullHeader?: boolean
  canManageClasses?: boolean
}

export function LearningSessionSection({
  initialOpenClass,
  showFullHeader = true,
  canManageClasses = false,
}: Props) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const shouldReduceMotion = useReducedMotion()
  const ease = [0.22, 1, 0.36, 1] as const

  const token = typeof window !== 'undefined' ? localStorage.getItem('ncd_jwt') : null
  const localUserRaw = typeof window !== 'undefined' ? localStorage.getItem('ncd_user') : null
  const localUser = localUserRaw ? JSON.parse(localUserRaw) : null
  const isLoggedIn = Boolean(token && localUser)

  // Remote classes query
  const { data: remoteClasses } = useQuery({
    queryKey: ['learningSessionClasses'],
    queryFn: getLearningSessionClasses,
    enabled: isLoggedIn,
    staleTime: 60 * 1000,
  })

  const posterMap: Record<string, string> = {
    'fawwaz-poster': fawwazPoster,
    'fauzan-poster': fauzanPoster,
  }

  const displayClasses: ClassSession[] = React.useMemo(() => {
    if (remoteClasses && remoteClasses.length > 0) {
      return remoteClasses.map((rc) => ({
        id: rc.id,
        slug: rc.slug,
        classNumber: rc.class_number,
        speakerName: rc.speaker_name,
        title: rc.title,
        description: rc.description,
        dateLabel: rc.date_label,
        timeLabel: rc.time_label,
        platform: rc.platform,
        mode: rc.mode,
        posterUrl: posterMap[rc.poster_url] || rc.poster_url || fawwazPoster,
        accentColor: rc.accent_color || '#3B82F6',
        discordUrl: rc.discord_url,
        isCustom: rc.id !== 'class-fawwaz-01' && rc.id !== 'class-fauzan-02',
      }))
    }
    return LEARNING_CLASSES
  }, [remoteClasses])

  // Registration modal state
  const [activeModalClass, setActiveModalClass] = useState<ClassSession | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneWA: '',
    university: '',
    major: '',
  })
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)

  // Create class modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    classNumber: 'CLASS 03',
    speakerName: '',
    title: '',
    description: '',
    dateLabel: '',
    timeLabel: '20.00–21.00 WIB',
    platform: 'Discord',
    mode: 'Online Live Session',
    posterChoice: 'template-fawwaz' as 'template-fawwaz' | 'template-fauzan' | 'upload',
    uploadedPoster: '',
    discordUrl: '',
    accentColor: '#3B82F6',
  })
  const [createError, setCreateError] = useState('')
  const [previewPosterUrl, setPreviewPosterUrl] = useState<string>(fawwazPoster)

  // Query registered classes for current member
  const { data: myRegistrations } = useQuery({
    queryKey: ['myLearningSessions'],
    queryFn: getMyLearningSessionRegistrations,
    enabled: isLoggedIn,
    staleTime: 60 * 1000,
  })

  const registeredSlugs: string[] = myRegistrations?.registered_slugs || []

  // Pre-fill user data when registration modal opens
  const openRegistrationModal = (c: ClassSession) => {
    if (!isLoggedIn) {
      navigate(`/login?redirect=/learning-session&class=${encodeURIComponent(c.slug)}`)
      return
    }

    setFormData({
      fullName: localUser?.full_name || localUser?.name || '',
      email: localUser?.email || '',
      phoneWA: localUser?.phone_number || '',
      university: localUser?.university || '',
      major: localUser?.major || '',
    })
    setSubmitError('')
    setSubmitSuccess(false)
    setActiveModalClass(c)
  }

  // Handle URL query direct trigger (e.g. redirected back from login)
  useEffect(() => {
    if (initialOpenClass && isLoggedIn) {
      const target = displayClasses.find((c) => c.slug === initialOpenClass)
      if (target && !registeredSlugs.includes(target.slug)) {
        openRegistrationModal(target)
      }
    }
  }, [initialOpenClass, isLoggedIn, registeredSlugs, displayClasses])

  // Registration Mutation
  const registerMutation = useMutation({
    mutationFn: registerLearningSession,
    onSuccess: () => {
      setSubmitSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['myLearningSessions'] })
      queryClient.invalidateQueries({ queryKey: ['adminLearningSessionRegistrations'] })
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Gagal mendaftar kelas. Pastikan data terisi dengan benar.'
      setSubmitError(msg)
    },
  })

  // Create Class Mutation
  const createClassMutation = useMutation({
    mutationFn: createLearningSessionClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningSessionClasses'] })
      setIsCreateModalOpen(false)
      const nextNum = displayClasses.length + 2
      setCreateFormData({
        classNumber: `CLASS 0${nextNum}`,
        speakerName: '',
        title: '',
        description: '',
        dateLabel: '',
        timeLabel: '20.00–21.00 WIB',
        platform: 'Discord',
        mode: 'Online Live Session',
        posterChoice: 'template-fawwaz',
        uploadedPoster: '',
        discordUrl: '',
        accentColor: '#3B82F6',
      })
      setCreateError('')
      setPreviewPosterUrl(fawwazPoster)
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Gagal menambahkan kelas baru. Periksa kembali kelengkapan formulir.'
      setCreateError(msg)
    },
  })

  // Delete Class Mutation
  const deleteClassMutation = useMutation({
    mutationFn: deleteLearningSessionClass,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningSessionClasses'] })
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Gagal menghapus kelas.'
      alert(msg)
    },
  })

  const handleDeleteClass = (id?: string, title?: string) => {
    if (!id) return
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kelas "${title}"? Data pendaftaran terkait pada kelas ini akan ikut terhapus.`
    )
    if (confirmed) {
      deleteClassMutation.mutate(id)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setCreateError('Format file harus berupa gambar (PNG, JPG, WebP).')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setCreateError('Ukuran gambar maksimal 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setCreateFormData((prev) => ({
        ...prev,
        uploadedPoster: result,
      }))
      setPreviewPosterUrl(result)
      setCreateError('')
    }
    reader.onerror = () => {
      setCreateError('Gagal membaca file gambar.')
    }
    reader.readAsDataURL(file)
  }

  const handlePosterChoiceChange = (choice: 'template-fawwaz' | 'template-fauzan' | 'upload') => {
    setCreateFormData((prev) => ({ ...prev, posterChoice: choice }))
    if (choice === 'template-fawwaz') {
      setPreviewPosterUrl(fawwazPoster)
    } else if (choice === 'template-fauzan') {
      setPreviewPosterUrl(fauzanPoster)
    } else if (choice === 'upload') {
      setPreviewPosterUrl(createFormData.uploadedPoster || fawwazPoster)
    }
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')

    let posterUrlToSend = 'fawwaz-poster'
    if (createFormData.posterChoice === 'template-fauzan') {
      posterUrlToSend = 'fauzan-poster'
    } else if (createFormData.posterChoice === 'upload') {
      if (!createFormData.uploadedPoster) {
        setCreateError('Silakan pilih dan unggah berkas gambar poster terlebih dahulu.')
        return
      }
      posterUrlToSend = createFormData.uploadedPoster
    }

    if (!createFormData.title.trim()) {
      setCreateError('Judul kelas wajib diisi.')
      return
    }
    if (!createFormData.speakerName.trim()) {
      setCreateError('Nama pemateri wajib diisi.')
      return
    }
    if (!createFormData.dateLabel.trim()) {
      setCreateError('Tanggal pelaksanaan kelas wajib diisi.')
      return
    }
    if (!createFormData.discordUrl.trim()) {
      setCreateError('Tautan event room Discord wajib diisi.')
      return
    }

    createClassMutation.mutate({
      class_number: createFormData.classNumber.trim() || `CLASS 0${displayClasses.length + 1}`,
      speaker_name: createFormData.speakerName.trim(),
      title: createFormData.title.trim(),
      description: createFormData.description.trim(),
      date_label: createFormData.dateLabel.trim(),
      time_label: createFormData.timeLabel.trim() || '20.00–21.00 WIB',
      platform: createFormData.platform.trim() || 'Discord',
      mode: createFormData.mode.trim() || 'Online Live Session',
      poster_url: posterUrlToSend,
      accent_color: createFormData.accentColor || '#3B82F6',
      discord_url: createFormData.discordUrl.trim(),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeModalClass) return
    setSubmitError('')

    registerMutation.mutate({
      class_slug: activeModalClass.slug,
      full_name: formData.fullName.trim(),
      email: formData.email.trim(),
      phone_wa: formData.phoneWA.trim(),
      university: formData.university.trim(),
      major: formData.major.trim(),
    })
  }

  return (
    <section id="learning-session" className="w-full max-w-6xl mx-auto px-5 sm:px-6 py-12 md:py-20 text-left">
      {/* Header */}
      {showFullHeader && (
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease }}
          className="mb-10 md:mb-14 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111215] leading-tight">
            NCD Learning Session
          </h2>
        </motion.div>
      )}

      {/* Admin Action Bar: God Admin & Super Admin Only */}
      {canManageClasses && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 p-4 sm:p-5 bg-[#F4F1EB] border border-[#111215]/15 rounded-none shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#7E8492] font-semibold">
                Manajemen Sesi Belajar
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#111215] text-[#F4F1EB] rounded-none">
                ADMIN
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-[#111215] mt-0.5">
              Katalog Sesi Belajar Komunitas ({displayClasses.length} Kelas Aktif)
            </h3>
            <p className="text-xs text-[#525660] mt-0.5">
              Tambah kelas baru, unggah poster kustom, dan kelola jadwal room siaran Discord.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreateError('')
              setIsCreateModalOpen(true)
            }}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#111215] text-[#F4F1EB] hover:bg-[#6456EB] font-semibold text-xs rounded-none transition-colors shadow-2xs cursor-pointer select-none shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas Baru</span>
          </button>
        </div>
      )}

      {/* Grid Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
        {displayClasses.map((session, idx) => {
          const isRegistered = registeredSlugs.includes(session.slug)

          return (
            <motion.div
              key={session.slug || session.id || idx}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : idx * 0.12,
                ease,
              }}
              className="group flex flex-col bg-white border border-[#111215]/15 shadow-sm hover:shadow-md hover:border-[#111215]/30 transition-all duration-300 rounded-none overflow-hidden"
            >
              {/* Visual Poster Container: Full Quality, Proportional */}
              <div className="relative w-full aspect-[9/16] max-h-[580px] sm:max-h-[640px] md:max-h-[680px] bg-[#0A0D14] flex items-center justify-center overflow-hidden">
                <img
                  src={session.posterUrl}
                  alt={`Poster Resmi ${session.title} oleh ${session.speakerName}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-contain object-center group-hover:scale-[1.015] transition-transform duration-500 ease-out select-none"
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-3 py-1 rounded-none text-[11px] font-mono font-bold uppercase tracking-wider bg-[#111215]/80 text-[#F4F1EB] backdrop-blur-md border border-white/20 shadow-xs">
                    {session.classNumber}
                  </span>
                  {isRegistered ? (
                    <span className="px-3 py-1 rounded-none text-[11px] font-semibold bg-emerald-500/90 text-white backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Terdaftar</span>
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-none text-[11px] font-semibold bg-[#6456EB]/90 text-white backdrop-blur-md flex items-center gap-1.5 shadow-sm">
                      <Radio className="w-3 h-3 animate-pulse" />
                      <span>Registrasi Dibuka</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Information & Action Section */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-white border-t border-[#111215]/10">
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono uppercase tracking-wider text-[#6456EB] font-bold mb-1.5">
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Speaker: {session.speakerName}</span>
                    </div>

                    {canManageClasses && session.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteClass(session.id, session.title)}
                        disabled={deleteClassMutation.isPending}
                        title="Hapus Kelas Ini"
                        className="p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-none transition-colors cursor-pointer select-none"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111215] leading-snug group-hover:text-[#6456EB] transition-colors">
                    {session.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-[#525660] leading-relaxed">
                    {session.description}
                  </p>

                  {/* Schedule & Platform Metadata */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 bg-[#F4F1EB]/80 rounded-none border border-[#111215]/10 text-xs text-[#111215]">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[#6456EB] shrink-0" />
                      <span className="font-medium">{session.dateLabel}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[#6456EB] shrink-0" />
                      <span className="font-medium">{session.timeLabel}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:col-span-2 pt-1.5 border-t border-[#111215]/10">
                      <Radio className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-medium">
                        Platform: <strong>{session.platform}</strong> ({session.mode})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div className="mt-6 pt-4 border-t border-[#111215]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-[#525660]">
                    {isRegistered ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terdaftar • Akses Discord Siap
                      </span>
                    ) : isLoggedIn ? (
                      <span className="text-slate-600">Akses khusus Member NCD</span>
                    ) : (
                      <span className="text-amber-800 flex items-center gap-1 font-medium">
                        <Lock className="w-3 h-3" />
                        Login member untuk mendaftar
                      </span>
                    )}
                  </div>

                  {isRegistered ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={session.discordUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2.5 rounded-none bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer select-none"
                        title="Buka room event di Discord"
                      >
                        <span>Buka Event Discord</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openRegistrationModal(session)}
                      className="px-5 py-3 rounded-none bg-[#111215] text-[#F4F1EB] font-semibold text-xs hover:bg-[#6456EB] active:scale-[0.98] transition-all flex items-center space-x-2 shadow-xs cursor-pointer select-none"
                    >
                      <span>{isLoggedIn ? 'Daftar Kelas Sekarang' : 'Login untuk Mendaftar'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Interactive Modal Registration Form */}
      <AnimatePresence>
        {activeModalClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModalClass(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease }}
              className="relative w-full max-w-xl bg-white border border-[#111215]/20 rounded-none shadow-2xl p-6 sm:p-8 z-10 text-left my-8"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setActiveModalClass(null)}
                className="absolute top-5 right-5 p-2 rounded-none text-[#525660] hover:text-[#111215] hover:bg-[#111215]/5 transition-colors cursor-pointer"
                aria-label="Tutup formulir"
              >
                <X className="w-5 h-5" />
              </button>

              {submitSuccess ? (
                /* Success State */
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-none border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#111215]">
                    Pendaftaran Berhasil
                  </h3>
                  <p className="text-xs sm:text-sm text-[#525660] max-w-md mx-auto leading-relaxed">
                    Anda telah resmi terdaftar pada sesi <strong>{activeModalClass.title}</strong> bersama <strong>{activeModalClass.speakerName}</strong>.
                  </p>
                  <div className="p-4 bg-[#F4F1EB] rounded-none border border-[#111215]/10 text-xs text-[#111215] max-w-md mx-auto text-left space-y-1.5">
                    <div><strong>Jadwal:</strong> {activeModalClass.dateLabel} ({activeModalClass.timeLabel})</div>
                    <div><strong>Platform:</strong> Discord NCD (Room Live Session)</div>
                    <div><strong>Peserta:</strong> {formData.fullName} ({formData.major})</div>
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <a
                      href={activeModalClass.discordUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-none bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <span>Buka Event Discord</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveModalClass(null)}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-none bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-[#252830] transition-colors cursor-pointer"
                    >
                      Selesai &amp; Tutup
                    </button>
                  </div>
                </div>
              ) : (
                /* Form State */
                <>
                  <div className="mb-6 pr-8">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#6456EB] font-bold">
                      {activeModalClass.classNumber} • PENDAFTARAN RESMI
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#111215] leading-snug mt-1">
                      {activeModalClass.title}
                    </h3>
                    <p className="text-xs text-[#525660] mt-1.5">
                      Speaker: <strong>{activeModalClass.speakerName}</strong> | {activeModalClass.dateLabel} ({activeModalClass.timeLabel})
                    </p>
                  </div>

                  {submitError && (
                    <div className="mb-5 p-3.5 rounded-none bg-red-50 border border-red-200 text-[#D83B01] text-xs flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-[#111215] mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-semibold text-[#111215] mb-1">
                          Email Aktif
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#111215] mb-1">
                          Nomor WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phoneWA}
                          onChange={(e) => setFormData({ ...formData, phoneWA: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block font-semibold text-[#111215] mb-1">
                          Universitas / Asal Kampus
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.university}
                          onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-[#111215] mb-1">
                          Program Studi / Jurusan
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.major}
                          onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                        />
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-[#525660] leading-relaxed">
                      <strong>Catatan:</strong> Data diverifikasi secara otomatis menggunakan identitas akun member NCD Anda. Tautan room Discord akan dikirimkan sebelum sesi berlangsung.
                    </div>

                    <div className="pt-4 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setActiveModalClass(null)}
                        className="px-4 py-2.5 rounded-none border border-[#111215]/20 font-medium text-xs text-[#525660] hover:text-[#111215] hover:bg-[#111215]/5 transition-colors cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={registerMutation.isPending}
                        className="px-5 py-2.5 rounded-none bg-[#111215] text-[#F4F1EB] font-semibold text-xs hover:bg-[#6456EB] active:scale-[0.98] transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Mendaftarkan...</span>
                          </>
                        ) : (
                          <>
                            <span>Konfirmasi Pendaftaran</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Tambah Kelas Baru (God Admin & Super Admin) */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease }}
              className="relative w-full max-w-2xl bg-white border border-[#111215]/20 rounded-none shadow-2xl p-6 sm:p-8 z-10 text-left my-8 max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-none text-[#525660] hover:text-[#111215] hover:bg-[#111215]/5 transition-colors cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 pr-8">
                <div className="text-[11px] font-mono uppercase tracking-wider text-[#6456EB] font-bold">
                  ADMINISTRASI SESI BELAJAR • FORMULIR RESMI
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111215] leading-snug mt-1">
                  Tambah Kelas Baru
                </h3>
                <p className="text-xs text-[#525660] mt-1">
                  Publikasikan kelas pembelajaran baru untuk seluruh anggota komunitas NCD.
                </p>
              </div>

              {createError && (
                <div className="mb-5 p-3.5 rounded-none bg-red-50 border border-red-200 text-[#D83B01] text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block font-semibold text-[#111215] mb-1">
                      Nomor Kelas
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.classNumber}
                      onChange={(e) => setCreateFormData({ ...createFormData, classNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#111215] mb-1">
                      Nama Pemateri (Speaker)
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.speakerName}
                      onChange={(e) => setCreateFormData({ ...createFormData, speakerName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#111215] mb-1">
                    Judul Kelas
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#111215] mb-1">
                    Deskripsi Ringkas Materi
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-[#111215] mb-1">
                      Tanggal Pelaksanaan
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.dateLabel}
                      onChange={(e) => setCreateFormData({ ...createFormData, dateLabel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#111215] mb-1">
                      Waktu Sesi
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.timeLabel}
                      onChange={(e) => setCreateFormData({ ...createFormData, timeLabel: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block font-semibold text-[#111215] mb-1">
                      Platform Siaran
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.platform}
                      onChange={(e) => setCreateFormData({ ...createFormData, platform: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#111215] mb-1">
                      Mode Pelaksanaan
                    </label>
                    <input
                      type="text"
                      required
                      value={createFormData.mode}
                      onChange={(e) => setCreateFormData({ ...createFormData, mode: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#111215] mb-1">
                    Tautan Room / Event Discord
                  </label>
                  <input
                    type="url"
                    required
                    value={createFormData.discordUrl}
                    onChange={(e) => setCreateFormData({ ...createFormData, discordUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-none border border-[#111215]/20 bg-[#F4F1EB]/50 focus:bg-white focus:border-[#111215] outline-none transition-all text-xs font-mono"
                  />
                </div>

                {/* Poster Configuration */}
                <div className="pt-2 border-t border-[#111215]/10">
                  <label className="block font-semibold text-[#111215] mb-2">
                    Desain Poster Kelas
                  </label>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Preview box */}
                    <div className="w-24 h-36 bg-[#0A0D14] border border-[#111215]/20 shrink-0 overflow-hidden flex items-center justify-center rounded-none shadow-2xs">
                      {previewPosterUrl ? (
                        <img
                          src={previewPosterUrl}
                          alt="Pratinjau Poster"
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-white/40" />
                      )}
                    </div>

                    {/* Radio Options */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handlePosterChoiceChange('template-fawwaz')}
                          className={`px-3 py-2 text-xs font-medium border rounded-none cursor-pointer transition-all ${
                            createFormData.posterChoice === 'template-fawwaz'
                              ? 'bg-[#111215] text-[#F4F1EB] border-[#111215]'
                              : 'bg-white text-[#111215] border-[#111215]/20 hover:border-[#111215]'
                          }`}
                        >
                          Template Resmi Fawwaz
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePosterChoiceChange('template-fauzan')}
                          className={`px-3 py-2 text-xs font-medium border rounded-none cursor-pointer transition-all ${
                            createFormData.posterChoice === 'template-fauzan'
                              ? 'bg-[#111215] text-[#F4F1EB] border-[#111215]'
                              : 'bg-white text-[#111215] border-[#111215]/20 hover:border-[#111215]'
                          }`}
                        >
                          Template Resmi Fauzan
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePosterChoiceChange('upload')}
                          className={`px-3 py-2 text-xs font-medium border rounded-none cursor-pointer transition-all flex items-center gap-1.5 ${
                            createFormData.posterChoice === 'upload'
                              ? 'bg-[#111215] text-[#F4F1EB] border-[#111215]'
                              : 'bg-white text-[#111215] border-[#111215]/20 hover:border-[#111215]'
                          }`}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Unggah File Sendiri</span>
                        </button>
                      </div>

                      {/* File upload input when choice === 'upload' */}
                      {createFormData.posterChoice === 'upload' && (
                        <div className="mt-2 p-3 bg-[#F4F1EB] border border-[#111215]/15 rounded-none">
                          <label className="block text-[11px] font-semibold text-[#111215] mb-1">
                            Pilih Berkas Gambar (PNG, JPG, WebP - Maksimal 2MB):
                          </label>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            onChange={handleFileChange}
                            className="block w-full text-xs text-[#525660] file:mr-3 file:py-1.5 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-[#111215] file:text-[#F4F1EB] hover:file:bg-[#6456EB] cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#111215]/10 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2.5 rounded-none border border-[#111215]/20 font-medium text-xs text-[#525660] hover:text-[#111215] hover:bg-[#111215]/5 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={createClassMutation.isPending}
                    className="px-5 py-2.5 rounded-none bg-[#111215] text-[#F4F1EB] font-semibold text-xs hover:bg-[#6456EB] active:scale-[0.98] transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {createClassMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan Kelas...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Publikasikan Kelas</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
