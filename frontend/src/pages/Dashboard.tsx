import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  KeyRound,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Copy,
  Check,
  Trash2,
  Receipt,
  X,
  ExternalLink,
  User,
  ShieldCheck,
  FileText,
  AlertCircle,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Award,
  Newspaper,
} from 'lucide-react'
import { api, AccessKey, Transaction, CashSummary, Achievement, Post } from '../services/api'
import { RubberSegment } from '../components/ui/RubberSegment'
import { DashboardRowSkeleton, TokenRowSkeleton } from '../components/Skeletons'
import { AnimatePresence, motion } from 'motion/react'

const AVAILABLE_ROLES = [
  { value: 'GOD_ADMIN', label: 'God Admin (Developer Lead)', desc: 'Akses tanpa batas ke seluruh sistem' },
  { value: 'SUPER_ADMIN', label: 'Super Admin (Chairman)', desc: 'Otoritas operasional & manajemen anggota' },
  { value: 'BENDAHARA_I', label: 'Bendahara I (Maker)', desc: 'Pencatatan draft transaksi kas keluar/masuk' },
  { value: 'BENDAHARA_II', label: 'Bendahara II (Checker)', desc: 'Pemeriksaan nota dan otorisasi verifikasi' },
  { value: 'SEKRETARIS', label: 'Sekretaris I', desc: 'Notulensi rapat, administrasi, dan rilis warta' },
  { value: 'MEMBER', label: 'Member Komunitas', desc: 'Akses internal direktori talenta dan proyek riset' },
]

export function Dashboard() {
  const queryClient = useQueryClient()

  // Local user resolution
  const [localUser, setLocalUser] = useState<{
    id?: string
    full_name?: string
    name?: string
    email?: string
    role?: string
    position?: string
    key?: string
  } | null>(() => {
    try {
      const raw = localStorage.getItem('ncd_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const currentUser = {
    name: localUser?.full_name || localUser?.name || 'Mirza Danisywar Noor Wahyu',
    email: localUser?.email || 'chairman@ncd.dev',
    role: localUser?.role || 'SUPER_ADMIN',
    position: localUser?.position || 'Chairman',
    key: localUser?.key || 'NCD-CHAIRMAN-2026',
  }

  const isGodAdmin = currentUser.role === 'GOD_ADMIN'
  const isChairman =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.position.toLowerCase().includes('chair')

  // Active Tab: 'overview' | 'tokens' | 'approvals' | 'achievements' | 'news' | 'finance' | 'profile'
  const [activeTab, setActiveTab] = useState<
    'overview' | 'tokens' | 'approvals' | 'achievements' | 'news' | 'finance' | 'profile'
  >('overview')

  const canManageContent =
    currentUser.role === 'GOD_ADMIN' || currentUser.role === 'SUPER_ADMIN'

  // New Achievement Form State
  const [achTitle, setAchTitle] = useState('')
  const [achEventName, setAchEventName] = useState('')
  const [achTier, setAchTier] = useState('Nasional')
  const [achRank, setAchRank] = useState('Juara 1 (Medali Emas)')
  const [achAwardDate, setAchAwardDate] = useState('')
  const [achTeamName, setAchTeamName] = useState('')
  const [achMembers, setAchMembers] = useState('')
  const [achProjectTitle, setAchProjectTitle] = useState('')
  const [achDescription, setAchDescription] = useState('')
  const [achCertUrl, setAchCertUrl] = useState('')
  const [achSuccess, setAchSuccess] = useState('')
  const [achError, setAchError] = useState('')

  // New News Post Form State
  const [newsTitle, setNewsTitle] = useState('')
  const [newsCategory, setNewsCategory] = useState('Pengumuman')
  const [newsSummary, setNewsSummary] = useState('')
  const [newsContentMD, setNewsContentMD] = useState('')
  const [newsTags, setNewsTags] = useState('')
  const [newsAuthor, setNewsAuthor] = useState('')
  const [newsIsPinned, setNewsIsPinned] = useState(false)
  const [newsSuccess, setNewsSuccess] = useState('')
  const [newsError, setNewsError] = useState('')

  // Selected receipt modal
  const [activeReceipt, setActiveReceipt] = useState<Transaction | null>(null)

  // Void / Reject Modal State
  const [rejectModalTx, setRejectModalTx] = useState<Transaction | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')

  // Copy status feedback
  const [copiedKey, setCopiedKey] = useState('')

  // New Token Form State (God Admin only)
  const [newRole, setNewRole] = useState('SUPER_ADMIN')
  const [newAssignee, setNewAssignee] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Finance Ledger Filter
  const [txFilter, setTxFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL')

  // Approval Tab Filter
  const [approvalFilter, setApprovalFilter] = useState<
    'ALL' | 'PENDING' | 'VERIFIED' | 'VOID'
  >('PENDING')

  // Token Edit State
  const [editingMyToken, setEditingMyToken] = useState(false)
  const [newMyTokenKey, setNewMyTokenKey] = useState('')
  const [editingTokenItem, setEditingTokenItem] = useState<AccessKey | null>(null)
  const [editingItemKey, setEditingItemKey] = useState('')
  const [tokenUpdateMsg, setTokenUpdateMsg] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Query: Access Keys (Tokens) - Only queried if God Admin
  const { data: tokens = [], isLoading: loadingTokens } = useQuery<AccessKey[]>({
    queryKey: ['accessTokens'],
    queryFn: async () => {
      const res = await api.get('/portal/tokens')
      return res.data
    },
    enabled: isGodAdmin,
    retry: 1,
  })

  // Query: Cash Summary
  const { data: cashSummary } = useQuery<CashSummary>({
    queryKey: ['cashSummary'],
    queryFn: async () => {
      const res = await api.get('/finance/summary')
      return res.data
    },
    retry: 1,
  })

  // Query: Transactions (Pemasukan & Pengeluaran)
  const { data: transactions = [], isLoading: loadingTx } = useQuery<
    Transaction[]
  >({
    queryKey: ['financeTransactions'],
    queryFn: async () => {
      const res = await api.get('/finance/transactions')
      return res.data
    },
    retry: 1,
  })

  // Mutation: Approve (Verify) Transaction
  const approveTxMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/finance/transactions/${id}/verify`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['cashSummary'] })
    },
  })

  // Mutation: Reject / Void Transaction
  const voidTxMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const res = await api.post(`/finance/transactions/${id}/void`, { reason })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['cashSummary'] })
      setRejectModalTx(null)
      setRejectReason('')
      setRejectError('')
    },
    onError: (err: any) => {
      setRejectError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Gagal menolak transaksi.'
      )
    },
  })

  // Mutation: Create Token (God Admin)
  const createTokenMutation = useMutation({
    mutationFn: async (data: {
      role: string
      assignee: string
      position: string
    }) => {
      const res = await api.post('/portal/tokens', data)
      return res.data
    },
    onSuccess: (newKey: AccessKey) => {
      queryClient.invalidateQueries({ queryKey: ['accessTokens'] })
      setFormSuccess(
        `Token ${newKey.key} untuk ${newKey.assignee} berhasil diterbitkan.`
      )
      setNewAssignee('')
      setNewPosition('')
      setFormError('')
      setTimeout(() => setFormSuccess(''), 4000)
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Gagal menerbitkan token. Pastikan hak akses God Admin valid.'
      setFormError(msg)
    },
  })

  // Mutation: Revoke Token (God Admin)
  const revokeTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/portal/tokens/${id}/revoke`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessTokens'] })
    },
  })

  // Mutation: Delete Token (God Admin)
  const deleteTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/portal/tokens/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessTokens'] })
    },
  })

  // Queries for Achievements and News Management (God Admin & Super Admin)
  const { data: achievementsList = [], isLoading: isLoadingAchList } = useQuery<Achievement[]>({
    queryKey: ['portalAchievements'],
    queryFn: async () => {
      const res = await api.get('/public/achievements')
      return res.data
    },
    enabled: canManageContent,
  })

  const { data: newsList = [], isLoading: isLoadingNewsList } = useQuery<Post[]>({
    queryKey: ['portalPosts'],
    queryFn: async () => {
      const res = await api.get('/public/posts')
      return res.data
    },
    enabled: canManageContent,
  })

  // Mutation: Create Achievement
  const createAchievementMutation = useMutation({
    mutationFn: async (payload: Partial<Achievement>) => {
      const res = await api.post('/portal/achievements', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalAchievements'] })
      queryClient.invalidateQueries({ queryKey: ['publicAchievements'] })
      setAchTitle('')
      setAchEventName('')
      setAchAwardDate('')
      setAchTeamName('')
      setAchMembers('')
      setAchProjectTitle('')
      setAchDescription('')
      setAchCertUrl('')
      setAchSuccess('Prestasi baru berhasil ditambahkan!')
      setAchError('')
      setTimeout(() => setAchSuccess(''), 3000)
    },
    onError: (err: any) => {
      setAchError(err?.response?.data?.error || 'Gagal menambahkan prestasi')
    },
  })

  // Mutation: Delete Achievement
  const deleteAchievementMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/portal/achievements/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalAchievements'] })
      queryClient.invalidateQueries({ queryKey: ['publicAchievements'] })
    },
  })

  // Mutation: Create Post
  const createPostMutation = useMutation({
    mutationFn: async (payload: Partial<Post>) => {
      const res = await api.post('/portal/posts', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalPosts'] })
      queryClient.invalidateQueries({ queryKey: ['publicPosts'] })
      setNewsTitle('')
      setNewsSummary('')
      setNewsContentMD('')
      setNewsTags('')
      setNewsIsPinned(false)
      setNewsSuccess('Warta baru berhasil diterbitkan!')
      setNewsError('')
      setTimeout(() => setNewsSuccess(''), 3000)
    },
    onError: (err: any) => {
      setNewsError(err?.response?.data?.error || 'Gagal menerbitkan warta')
    },
  })

  // Mutation: Delete Post
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/portal/posts/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalPosts'] })
      queryClient.invalidateQueries({ queryKey: ['publicPosts'] })
    },
  })

  const handleCreateAchievement = (e: React.FormEvent) => {
    e.preventDefault()
    if (!achTitle.trim()) {
      setAchError('Judul prestasi wajib diisi')
      return
    }
    const membersArr = achMembers
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean)

    createAchievementMutation.mutate({
      title: achTitle.trim(),
      event_name: achEventName.trim() || achTitle.trim(),
      competition: achEventName.trim() || achTitle.trim(),
      tier: achTier,
      rank: achRank.trim() || 'Juara 1',
      date: achAwardDate.trim() || new Date().getFullYear().toString(),
      award_date: achAwardDate.trim() || new Date().getFullYear().toString(),
      team_name: achTeamName.trim(),
      members: membersArr,
      team_members: membersArr,
      project_title: achProjectTitle.trim(),
      description: achDescription.trim(),
      certificate_url: achCertUrl.trim(),
    })
  }

  const handleCreateNews = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsTitle.trim()) {
      setNewsError('Judul warta wajib diisi')
      return
    }
    if (!newsSummary.trim()) {
      setNewsError('Rangkuman warta wajib diisi')
      return
    }
    const tagsArr = newsTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    createPostMutation.mutate({
      title: newsTitle.trim(),
      category: newsCategory,
      summary: newsSummary.trim(),
      content_md: newsContentMD.trim() || newsSummary.trim(),
      tags: tagsArr,
      author_name: newsAuthor.trim() || currentUser.name,
      is_pinned: newsIsPinned,
    })
  }

  // Mutation: Update Token Key
  const updateTokenMutation = useMutation({
    mutationFn: async ({ id, newKey }: { id: string; newKey: string }) => {
      const res = await api.put(`/portal/tokens/${id}`, { new_key: newKey })
      return res.data as { message: string; token: AccessKey }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['accessTokens'] })
      const updatedToken = data.token
      if (updatedToken) {
        if (
          localUser &&
          (localUser.id === updatedToken.id ||
            localUser.key === currentUser.key ||
            editingMyToken)
        ) {
          const updated = { ...localUser, key: updatedToken.key }
          localStorage.setItem('ncd_user', JSON.stringify(updated))
          setLocalUser(updated)
        }
        setTokenUpdateMsg({
          type: 'success',
          text: `Token berhasil diperbarui: ${updatedToken.key}`,
        })
      } else {
        setTokenUpdateMsg({
          type: 'success',
          text: 'Token berhasil diperbarui.',
        })
      }
      setTimeout(() => {
        setEditingMyToken(false)
        setEditingTokenItem(null)
        setTokenUpdateMsg(null)
      }, 1500)
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Gagal memperbarui token.'
      setTokenUpdateMsg({ type: 'error', text: msg })
    },
  })

  const handleUpdateMyToken = (e: React.FormEvent) => {
    e.preventDefault()
    const cleanKey = newMyTokenKey.trim().toUpperCase()
    if (!cleanKey.startsWith('NCD-')) {
      setTokenUpdateMsg({
        type: 'error',
        text: "Token harus diawali dengan 'NCD-'",
      })
      return
    }
    updateTokenMutation.mutate({ id: 'my-token', newKey: cleanKey })
  }

  const handleUpdateTokenItem = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTokenItem) return
    const cleanKey = editingItemKey.trim().toUpperCase()
    if (!cleanKey.startsWith('NCD-')) {
      setTokenUpdateMsg({
        type: 'error',
        text: "Token harus diawali dengan 'NCD-'",
      })
      return
    }
    updateTokenMutation.mutate({ id: editingTokenItem.id, newKey: cleanKey })
  }

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedAssignee = newAssignee.trim()
    if (!trimmedAssignee) {
      setFormError('Nama penerima token wajib diisi.')
      return
    }

    const isDuplicate = tokens.some(
      (t) => t.assignee.trim().toLowerCase() === trimmedAssignee.toLowerCase()
    )
    if (isDuplicate) {
      setFormError(`Token dengan nama "${trimmedAssignee}" sudah terdaftar dalam sistem.`)
      return
    }

    setFormError('')
    createTokenMutation.mutate({
      role: newRole,
      assignee: trimmedAssignee,
      position: newPosition.trim() || newRole,
    })
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(text)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const formatRupiah = (val?: number) => {
    if (typeof val !== 'number') return 'Rp 0'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'INCOME') return tx.type === 'INCOME'
    if (txFilter === 'EXPENSE') return tx.type === 'EXPENSE'
    return true
  })

  const totalIncome =
    cashSummary?.total_income ??
    transactions
      .filter((t) => t.type === 'INCOME' && t.status === 'VERIFIED')
      .reduce((acc, curr) => acc + curr.amount, 0)

  const totalExpense =
    cashSummary?.total_expense ??
    transactions
      .filter((t) => t.type === 'EXPENSE' && t.status === 'VERIFIED')
      .reduce((acc, curr) => acc + curr.amount, 0)

  const currentBalance =
    cashSummary?.current_balance ?? totalIncome - totalExpense

  // Competition Transactions Identification (per organizational minutes)
  const isCompetitionTx = (t: Transaction) => {
    const combined = `${t.category_name} ${t.description}`.toLowerCase()
    return (
      combined.includes('lomba') ||
      combined.includes('kompetisi') ||
      combined.includes('competition') ||
      combined.includes('delegasi') ||
      combined.includes('hackathon') ||
      combined.includes('ctf') ||
      combined.includes('olimpiade')
    )
  }

  // All competition transactions
  const competitionTransactions = transactions.filter(isCompetitionTx)
  const pendingCompetitionTransactions = competitionTransactions.filter(
    (t) => t.status === 'DRAFT_PENDING'
  )
  const pendingCompetitionCount = pendingCompetitionTransactions.length

  const filteredCompetitionTx = competitionTransactions.filter((tx) => {
    if (approvalFilter === 'PENDING') return tx.status === 'DRAFT_PENDING'
    if (approvalFilter === 'VERIFIED') return tx.status === 'VERIFIED'
    if (approvalFilter === 'VOID') return tx.status === 'VOID'
    return true
  })

  // Dynamic Navigation Tabs
  const navTabs = [
    {
      id: 'overview' as const,
      shortLabel: 'Ringkasan',
      label: 'Ringkasan Utama',
      icon: ShieldCheck,
      badge: 0,
    },
    ...(isGodAdmin
      ? [
          {
            id: 'tokens' as const,
            shortLabel: 'Akses Token',
            label: 'Manajemen Token & Role',
            icon: KeyRound,
            badge: 0,
          },
        ]
      : []),
    ...(isChairman
      ? [
          {
            id: 'approvals' as const,
            shortLabel:
              pendingCompetitionCount > 0
                ? `Lomba (${pendingCompetitionCount})`
                : 'Persetujuan',
            label:
              pendingCompetitionCount > 0
                ? `Persetujuan Lomba (${pendingCompetitionCount})`
                : 'Persetujuan Lomba',
            icon: CheckCircle2,
            badge: pendingCompetitionCount,
          },
        ]
      : []),
    ...(canManageContent
      ? [
          {
            id: 'achievements' as const,
            shortLabel: 'Prestasi',
            label: 'Kelola Prestasi',
            icon: Award,
            badge: 0,
          },
          {
            id: 'news' as const,
            shortLabel: 'Warta',
            label: 'Kelola Warta',
            icon: Newspaper,
            badge: 0,
          },
        ]
      : []),
    {
      id: 'finance' as const,
      shortLabel: 'Arus Kas',
      label: 'Arus Kas & Bukti Nota',
      icon: Wallet,
      badge: 0,
    },
    {
      id: 'profile' as const,
      shortLabel: 'Profil',
      label: isGodAdmin
        ? 'Profil God Admin'
        : isChairman
        ? 'Profil Chairman'
        : 'Profil Pengurus',
      icon: User,
      badge: 0,
    },
  ]

  const userInitials =
    currentUser.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || (isGodAdmin ? 'GA' : 'CH')

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 md:py-12 text-left">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-[#111215]/8 p-4 sm:p-6 md:p-7 shadow-2xs mb-5 sm:mb-6">
        <div className="flex items-start space-x-2.5 sm:space-x-3.5 min-w-0">
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#111215] text-[#F4F1EB] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
            {userInitials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-[#111215]">
                Dasbor Otoritas {currentUser.name}
              </h1>
              <span className="px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase bg-[#111215] text-[#F4F1EB] border border-[#111215] shrink-0">
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#525660] mt-0.5">
              {currentUser.position}
            </p>
          </div>
        </div>

        {/* Master / Executive Key Metadata Row */}
        <div className="mt-3.5 pt-3 border-t border-[#111215]/8 flex flex-wrap items-center justify-between gap-2 text-xs text-[#525660]">
          <div className="flex items-center space-x-1.5 min-w-0">
            <span className="text-[#7E8492] text-[11px] shrink-0">
              {isGodAdmin ? 'Master Key:' : 'Kunci Akses Eksekutif:'}
            </span>
            <code className="font-mono text-[11px] sm:text-xs bg-[#F4F1EB] px-2 py-0.5 rounded text-[#111215] font-semibold whitespace-nowrap truncate max-w-[210px] sm:max-w-none">
              {currentUser.key}
            </code>
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded font-medium shrink-0">
            {isGodAdmin ? 'Root Active' : 'Mandat Eksekutif Aktif'}
          </span>
        </div>

        {/* Tab Navigation: React Bits RubberSegment */}
        <div className="mt-4 pt-3.5 border-t border-[#111215]/8 w-full overflow-hidden">
          <RubberSegment
            items={navTabs.map((tab) => {
              const Icon = tab.icon
              return {
                value: tab.id,
                title: tab.label,
                label: (
                  <span className="hidden sm:inline-flex items-center space-x-1.5 min-w-0">
                    <span className="truncate">{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-600 text-white shrink-0">
                        {tab.badge}
                      </span>
                    )}
                  </span>
                ),
                icon: (
                  <span className="relative inline-flex items-center justify-center">
                    <Icon className="w-4 h-4 shrink-0" />
                    {tab.badge > 0 && (
                      <span className="sm:hidden absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
                    )}
                  </span>
                ),
              }
            })}
            value={activeTab}
            onChange={(val) => setActiveTab(val as typeof activeTab)}
            trackColor="#F4F1EB"
            thumbColor="#111215"
            textColor="#525660"
            activeTextColor="#F4F1EB"
            size="lg"
            radius={14}
            inset={3}
            equalSlots
            stretch={75}
            squash={2}
            speed={1.1}
            glide={50}
            draggable
            className="w-full"
            aria-label="Navigasi Menu Dasbor"
          />
        </div>
      </div>

      {/* CHAIRMAN ACTION BANNER: PENDING COMPETITION APPROVALS */}
      {isChairman && pendingCompetitionCount > 0 && activeTab === 'overview' && (
        <div className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200 text-[#111215] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-amber-950">
                Persetujuan Otorisasi Diperlukan ({pendingCompetitionCount} Pengajuan)
              </div>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Terdapat pengajuan kas delegasi lomba yang memerlukan persetujuan Ketua & Wakil Ketua sesuai notulensi organisasi.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('approvals')}
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-amber-900 text-white hover:bg-amber-950 text-xs font-medium transition-colors shrink-0 cursor-pointer"
          >
            <span>Tinjau Sekarang</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB: OVERVIEW METRICS */}
      {(activeTab === 'overview' || activeTab === 'finance') && (
        <div className="space-y-5 sm:space-y-6 mb-6 sm:mb-8">
          {/* Metrics Row: 2-Cols on Mobile, 4-Cols on Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Saldo Bersih */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7E8492] font-medium mb-1.5">
                <span className="truncate pr-1">Saldo Kas</span>
                <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#111215] shrink-0" />
              </div>
              <div className="text-base sm:text-2xl font-semibold text-[#111215] tracking-tight truncate">
                {formatRupiah(currentBalance)}
              </div>
              <div className="mt-2 pt-2 border-t border-[#111215]/6 text-[10px] sm:text-[11px] text-[#7E8492] truncate">
                Kas aktif terverifikasi
              </div>
            </div>

            {/* Total Pemasukan */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7E8492] font-medium mb-1.5">
                <span className="truncate pr-1">Pemasukan</span>
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              </div>
              <div className="text-base sm:text-2xl font-semibold text-emerald-700 tracking-tight truncate">
                +{formatRupiah(totalIncome)}
              </div>
              <div className="mt-2 pt-2 border-t border-[#111215]/6 text-[10px] sm:text-[11px] text-[#7E8492] truncate">
                Hadiah, hibah & saldo kas
              </div>
            </div>

            {/* Total Pengeluaran */}
            <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7E8492] font-medium mb-1.5">
                <span className="truncate pr-1">Pengeluaran</span>
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-600 shrink-0" />
              </div>
              <div className="text-base sm:text-2xl font-semibold text-rose-700 tracking-tight truncate">
                -{formatRupiah(totalExpense)}
              </div>
              <div className="mt-2 pt-2 border-t border-[#111215]/6 text-[10px] sm:text-[11px] text-[#7E8492] truncate">
                Operasional & delegasi lomba
              </div>
            </div>

            {/* Metric 4: Role-dependent */}
            {isGodAdmin ? (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7E8492] font-medium mb-1.5">
                  <span className="truncate pr-1">Token Akses</span>
                  <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6456EB] shrink-0" />
                </div>
                <div className="text-base sm:text-2xl font-semibold text-[#111215] tracking-tight truncate">
                  {tokens.filter((t) => t.is_active).length}{' '}
                  <span className="text-xs font-normal text-[#7E8492]">
                    / {tokens.length}
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#111215]/6 text-[10px] sm:text-[11px] text-[#7E8492] truncate">
                  Token aktif di sistem
                </div>
              </div>
            ) : (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7E8492] font-medium mb-1.5">
                  <span className="truncate pr-1">Persetujuan Lomba</span>
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                </div>
                <div className="text-base sm:text-2xl font-semibold text-[#111215] tracking-tight truncate">
                  {pendingCompetitionCount}{' '}
                  <span className="text-xs font-normal text-[#7E8492]">
                    Menunggu
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#111215]/6 text-[10px] sm:text-[11px] text-[#7E8492] truncate">
                  Otorisasi Ketua & Wakil Ketua
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: APPROVALS (CHAIRMAN ROLE - PERSATUAN DANA LOMBA SESUAI NOTULENSI) */}
      {isChairman && activeTab === 'approvals' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#111215]" />
                  <h2 className="text-lg font-semibold tracking-tight text-[#111215]">
                    Otorisasi & Persetujuan Dana Delegasi Lomba
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1 leading-relaxed">
                  Berdasarkan notulensi kepengurusan: Seluruh pengajuan kas untuk keperluan lomba / kompetisi diajukan oleh Bendahara dengan kewajiban persetujuan Ketua (Chairman) & Wakil Ketua.
                </p>
              </div>

              {/* Status Filter: React Bits RubberSegment */}
              <div className="w-full sm:w-auto shrink-0 overflow-hidden">
                <RubberSegment
                  items={[
                    { value: 'PENDING', label: `Menunggu (${pendingCompetitionCount})` },
                    { value: 'ALL', label: 'Semua' },
                    { value: 'VERIFIED', label: 'Disetujui' },
                    { value: 'VOID', label: 'Ditolak' },
                  ]}
                  value={approvalFilter}
                  onChange={(mode) => setApprovalFilter(mode as typeof approvalFilter)}
                  trackColor="#F4F1EB"
                  thumbColor="#111215"
                  textColor="#525660"
                  activeTextColor="#F4F1EB"
                  size="sm"
                  radius={10}
                  inset={2}
                  equalSlots
                  stretch={50}
                  speed={1.2}
                  className="w-full sm:w-auto"
                  aria-label="Filter Persetujuan Lomba"
                />
              </div>
            </div>

            {/* Approval Table / Mobile Cards */}
            <div className="border border-[#111215]/8 rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 bg-[#F4F1EB] px-4 py-2.5 text-[11px] font-semibold text-[#525660] border-b border-[#111215]/8">
                <div className="col-span-3">NO. TRANSAKSI & TANGGAL</div>
                <div className="col-span-4">KEPERLUAN LOMBA & PIC</div>
                <div className="col-span-2">NOMINAL KAS</div>
                <div className="col-span-1">STATUS</div>
                <div className="col-span-2 text-right">OTORISASI</div>
              </div>

              {loadingTx ? (
                <div className="divide-y divide-[#111215]/6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <DashboardRowSkeleton key={i} />
                  ))}
                </div>
              ) : filteredCompetitionTx.length === 0 ? (
                <div className="p-10 text-center text-xs text-[#7E8492] space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 mb-1.5 opacity-80" />
                  <div className="font-medium text-[#111215]">
                    {approvalFilter === 'PENDING'
                      ? 'Tidak ada pengajuan lomba yang menunggu persetujuan.'
                      : 'Belum ada data pengeluaran lomba pada filter ini.'}
                  </div>
                  <div className="text-[11px]">
                    Seluruh permohonan delegasi kompetisi telah ditinjau sesuai amanat notulensi.
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#111215]/6">
                  {filteredCompetitionTx.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 sm:px-4 sm:py-3.5 transition-colors hover:bg-[#F4F1EB]/40"
                    >
                      {/* Mobile View (< sm) */}
                      <div className="sm:hidden space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-semibold text-[#111215] block">
                              {tx.transaction_number}
                            </span>
                            <span className="text-[11px] text-[#7E8492]">
                              {tx.transaction_date} • {tx.category_name}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-mono text-xs font-semibold text-rose-700 block">
                              -{formatRupiah(tx.amount)}
                            </span>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                                tx.status === 'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : tx.status === 'DRAFT_PENDING'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {tx.status === 'VERIFIED'
                                ? 'Disetujui Sah'
                                : tx.status === 'DRAFT_PENDING'
                                ? 'Menunggu Persetujuan'
                                : 'Ditolak'}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-[#111215] font-medium leading-relaxed">
                          {tx.description}
                        </div>

                        <div className="text-[11px] text-[#7E8492] flex items-center justify-between">
                          <span>PIC / Delegasi: <strong>{tx.person_in_charge}</strong></span>
                          <button
                            onClick={() => setActiveReceipt(tx)}
                            className="inline-flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium text-[#111215] bg-[#F4F1EB] hover:bg-[#111215]/10 border border-[#111215]/8"
                          >
                            <Receipt className="w-3 h-3" />
                            <span>Nota</span>
                          </button>
                        </div>

                        {/* Mobile Actions */}
                        {tx.status === 'DRAFT_PENDING' ? (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#111215]/6">
                            <button
                              onClick={() => setRejectModalTx(tx)}
                              className="w-full py-2 min-h-[40px] rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Tolak</span>
                            </button>
                            <button
                              onClick={() => approveTxMutation.mutate(tx.id)}
                              disabled={approveTxMutation.isPending}
                              className="w-full py-2 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Setujui</span>
                            </button>
                          </div>
                        ) : tx.status === 'VERIFIED' ? (
                          <div className="pt-1.5 border-t border-[#111215]/6 text-[10px] text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                            Disetujui oleh: <strong>{tx.verifier_name || 'Chairman'}</strong> {tx.verified_at ? `pada ${tx.verified_at}` : ''}
                          </div>
                        ) : (
                          <div className="pt-1.5 border-t border-[#111215]/6 text-[10px] text-rose-800 bg-rose-50/60 p-2 rounded-lg">
                            Ditolak: {tx.void_reason || 'Tidak disetujui'}
                          </div>
                        )}
                      </div>

                      {/* Desktop View (>= sm) */}
                      <div className="hidden sm:grid grid-cols-12 gap-0 items-center text-xs">
                        {/* Number & Date */}
                        <div className="col-span-3 min-w-0 pr-2">
                          <div className="font-mono text-xs font-semibold text-[#111215] truncate">
                            {tx.transaction_number}
                          </div>
                          <div className="text-[11px] text-[#7E8492]">
                            {tx.transaction_date}
                          </div>
                        </div>

                        {/* Description & PIC */}
                        <div className="col-span-4 min-w-0 pr-3">
                          <div className="font-medium text-[#111215] truncate">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-[#7E8492] truncate flex items-center space-x-2">
                            <span>{tx.category_name}</span>
                            <span>•</span>
                            <span>PIC: <strong>{tx.person_in_charge}</strong></span>
                            <span>•</span>
                            <button
                              onClick={() => setActiveReceipt(tx)}
                              className="text-[#111215] underline hover:text-[#6456EB] cursor-pointer inline-flex items-center space-x-0.5"
                            >
                              <span>Nota</span>
                            </button>
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="col-span-2 font-mono font-semibold text-rose-700">
                          -{formatRupiah(tx.amount)}
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                              tx.status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : tx.status === 'DRAFT_PENDING'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {tx.status === 'VERIFIED'
                              ? 'Sah'
                              : tx.status === 'DRAFT_PENDING'
                              ? 'Draft'
                              : 'Void'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end space-x-1.5">
                          {tx.status === 'DRAFT_PENDING' ? (
                            <>
                              <button
                                onClick={() => setRejectModalTx(tx)}
                                className="px-2.5 py-1.5 min-h-[36px] rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors cursor-pointer"
                                title="Tolak pengajuan lomba"
                              >
                                Tolak
                              </button>
                              <button
                                onClick={() => approveTxMutation.mutate(tx.id)}
                                disabled={approveTxMutation.isPending}
                                className="px-3 py-1.5 min-h-[36px] rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 flex items-center space-x-1"
                                title="Setujui pengeluaran lomba"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Setujui</span>
                              </button>
                            </>
                          ) : tx.status === 'VERIFIED' ? (
                            <span className="text-[11px] text-emerald-700 font-medium truncate max-w-[140px]" title={tx.verifier_name}>
                              Disetujui Chairman
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-700 font-medium truncate max-w-[140px]" title={tx.void_reason}>
                              Ditolak
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: TOKENS & ROLE GOVERNANCE (GOD ADMIN ONLY) */}
      {isGodAdmin && activeTab === 'tokens' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-[#111215]" />
                  <h2 className="text-lg font-semibold tracking-tight text-[#111215]">
                    Penerbitan Kunci Akses & Pengaturan Role
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1">
                  God Admin dapat menerbitkan token baru untuk role manapun. Token ini digunakan langsung pada form login portal member.
                </p>
              </div>
            </div>

            {/* Token Generator Form */}
            <form
              onSubmit={handleCreateToken}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs mb-6"
            >
              <div>
                <label className="block font-medium mb-1.5 text-[#111215]">
                  Role Tujuan *
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white text-xs outline-none"
                >
                  {AVAILABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1.5 text-[#111215]">
                  Nama Penerima (Assignee) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Mirza Danisywar"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-medium mb-1.5 text-[#111215]">
                  Posisi / Jabatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Chairman Komunitas"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="w-full px-3 py-2.5 min-h-[44px] rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white text-xs outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={createTokenMutation.isPending}
                  className="w-full py-2.5 min-h-[44px] rounded-xl bg-[#111215] text-[#F4F1EB] font-medium hover:bg-[#252830] transition-all flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {createTokenMutation.isPending
                      ? 'Menerbitkan...'
                      : 'Terbitkan Token'}
                  </span>
                </button>
              </div>
            </form>

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center space-x-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-[#D83B01] text-xs font-medium border border-red-200 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-[#D83B01] shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Token Table / Mobile Cards */}
            <div className="border border-[#111215]/8 rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 bg-[#F4F1EB] px-4 py-2.5 text-[11px] font-semibold text-[#525660] border-b border-[#111215]/8">
                <div className="col-span-4">KUNCI AKSES / TOKEN</div>
                <div className="col-span-3">PENERIMA & JABATAN</div>
                <div className="col-span-2">ROLE</div>
                <div className="col-span-1">STATUS</div>
                <div className="col-span-2 text-right">TINDAKAN</div>
              </div>

              {loadingTokens ? (
                <div className="divide-y divide-[#111215]/6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <TokenRowSkeleton key={i} />
                  ))}
                </div>
              ) : tokens.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7E8492]">
                  Belum ada token yang dibuat.
                </div>
              ) : (
                <div className="divide-y divide-[#111215]/6">
                  {tokens.map((tok) => (
                    <div
                      key={tok.id}
                      className="p-3.5 sm:px-4 sm:py-3 transition-colors hover:bg-[#F4F1EB]/40"
                    >
                      {/* Mobile View (< sm) */}
                      <div className="sm:hidden space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-xs text-[#111215] truncate">
                              {tok.assignee}
                            </div>
                            <div className="text-[11px] text-[#7E8492] truncate">
                              {tok.position}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1.5 shrink-0">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium border border-[#111215]/10 bg-[#F4F1EB] text-[#525660]">
                              {tok.role}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                                tok.is_active
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {tok.is_active ? 'Aktif' : 'Dicabut'}
                            </span>
                          </div>
                        </div>

                        {/* Token Key Box */}
                        <div className="flex items-center justify-between bg-[#F4F1EB]/80 px-2.5 py-1.5 rounded-lg border border-[#111215]/6">
                          <code className="font-mono text-xs font-semibold text-[#111215] truncate">
                            {tok.key}
                          </code>
                          <button
                            onClick={() => handleCopy(tok.key)}
                            className="p-1 rounded text-[#7E8492] hover:text-[#111215] transition-colors shrink-0"
                            title="Salin token"
                          >
                            {copiedKey === tok.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Action buttons (44px target) */}
                        <div className="flex items-center justify-end space-x-1.5 pt-1 border-t border-[#111215]/6">
                          <button
                            onClick={() => {
                              setEditingTokenItem(tok)
                              setEditingItemKey(tok.key)
                              setTokenUpdateMsg(null)
                            }}
                            className="px-2.5 py-1.5 min-h-[40px] rounded-lg bg-[#F4F1EB] hover:bg-[#111215]/10 text-xs text-[#111215] font-medium border border-[#111215]/8 flex items-center space-x-1 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 text-[#525660]" />
                            <span>Ubah</span>
                          </button>

                          <button
                            onClick={() => revokeTokenMutation.mutate(tok.id)}
                            className={`px-3 py-1.5 min-h-[40px] rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              tok.is_active
                                ? 'bg-[#F4F1EB] text-[#525660] hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border-transparent'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {tok.is_active ? 'Cabut' : 'Aktifkan'}
                          </button>

                          {tok.key !== 'NCD-GOD-MASTER-2026' && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Hapus token ${tok.key} permanen?`
                                  )
                                ) {
                                  deleteTokenMutation.mutate(tok.id)
                                }
                              }}
                              className="p-2 min-h-[40px] min-w-[40px] rounded-lg hover:bg-red-50 text-[#7E8492] hover:text-[#D83B01] border border-transparent hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                              title="Hapus token"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Desktop View (>= sm) */}
                      <div className="hidden sm:grid grid-cols-12 gap-0 items-center text-xs">
                        {/* Token Key + Copy */}
                        <div className="col-span-4 flex items-center space-x-2 min-w-0 pr-2">
                          <code className="font-mono text-xs font-semibold text-[#111215] bg-[#F4F1EB] px-2 py-1 rounded truncate">
                            {tok.key}
                          </code>
                          <button
                            onClick={() => handleCopy(tok.key)}
                            className="p-1.5 rounded-lg hover:bg-[#111215]/8 text-[#7E8492] hover:text-[#111215] transition-colors shrink-0"
                            title="Salin token"
                          >
                            {copiedKey === tok.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Penerima */}
                        <div className="col-span-3 min-w-0 pr-2">
                          <div className="font-medium text-[#111215] truncate">
                            {tok.assignee}
                          </div>
                          <div className="text-[11px] text-[#7E8492] truncate">
                            {tok.position}
                          </div>
                        </div>

                        {/* Role */}
                        <div className="col-span-2">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border border-[#111215]/10 bg-white text-[#525660]">
                            {tok.role}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                              tok.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {tok.is_active ? 'Aktif' : 'Dicabut'}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => {
                              setEditingTokenItem(tok)
                              setEditingItemKey(tok.key)
                              setTokenUpdateMsg(null)
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#111215]/8 text-[#7E8492] hover:text-[#111215] transition-colors cursor-pointer"
                            title="Ubah kode token"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => revokeTokenMutation.mutate(tok.id)}
                            className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                              tok.is_active
                                ? 'bg-[#F4F1EB] text-[#525660] hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border-transparent'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            }`}
                          >
                            {tok.is_active ? 'Cabut' : 'Aktifkan'}
                          </button>

                          {tok.key !== 'NCD-GOD-MASTER-2026' && (
                            <button
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Hapus token ${tok.key} permanen?`
                                  )
                                ) {
                                  deleteTokenMutation.mutate(tok.id)
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-[#7E8492] hover:text-[#D83B01] transition-colors cursor-pointer"
                              title="Hapus token"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: KELOLA PRESTASI (GOD ADMIN & SUPER ADMIN) */}
      {canManageContent && activeTab === 'achievements' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-none border border-[#111215]/8 p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <Award className="w-4 h-4 text-[#111215]" />
                  <h2 className="text-lg font-semibold tracking-tight text-[#111215]">
                    Manajemen Hall of Fame & Prestasi
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1">
                  Otoritas eksklusif GOD-ADMIN & SUPER ADMIN untuk menerbitkan atau menghapus rekam jejak kejuaraan pada rute publik /achievements.
                </p>
              </div>
              <span className="self-start sm:self-auto px-2 py-0.5 rounded-none text-[10px] font-semibold bg-[#111215] text-[#F4F1EB]">
                {achievementsList.length} Prestasi Terdaftar
              </span>
            </div>

            {/* Notification messages */}
            {achSuccess && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-none flex items-center justify-between">
                <span>{achSuccess}</span>
                <button type="button" onClick={() => setAchSuccess('')} className="p-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {achError && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-none flex items-center justify-between">
                <span>{achError}</span>
                <button type="button" onClick={() => setAchError('')} className="p-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Form Tambah Prestasi */}
            <form onSubmit={handleCreateAchievement} className="space-y-4 mb-8 bg-[#F4F1EB]/40 p-4 sm:p-6 border border-[#111215]/10 rounded-none">
              <h3 className="text-sm font-semibold text-[#111215] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#6456EB]" />
                <span>Tambah Rekam Jejak Prestasi Baru</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Judul Prestasi / Divisi <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={achTitle}
                    onChange={(e) => setAchTitle(e.target.value)}
                    placeholder="e.g. Juara 1 Divisi Piranti Lunak"
                    required
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Nama Kompetisi / Event <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={achEventName}
                    onChange={(e) => setAchEventName(e.target.value)}
                    placeholder="e.g. GEMASTIK XVII 2024"
                    required
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Tingkat Kejuaraan (Tier)
                  </label>
                  <select
                    value={achTier}
                    onChange={(e) => setAchTier(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  >
                    <option value="Nasional">Nasional</option>
                    <option value="Internasional">Internasional</option>
                    <option value="Regional / Kampus">Regional / Kampus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Peringkat / Medali
                  </label>
                  <input
                    type="text"
                    value={achRank}
                    onChange={(e) => setAchRank(e.target.value)}
                    placeholder="e.g. Juara 1 (Medali Emas)"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Bulan & Tahun Perolehan
                  </label>
                  <input
                    type="text"
                    value={achAwardDate}
                    onChange={(e) => setAchAwardDate(e.target.value)}
                    placeholder="e.g. September 2024"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Nama Tim Delegasi
                  </label>
                  <input
                    type="text"
                    value={achTeamName}
                    onChange={(e) => setAchTeamName(e.target.value)}
                    placeholder="e.g. NCD Alpha Core"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Anggota Tim (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={achMembers}
                    onChange={(e) => setAchMembers(e.target.value)}
                    placeholder="e.g. Mirza Danisywar, Rianszzz, Rafly Syahputra"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Judul Karya / Proyek (Opsional)
                  </label>
                  <input
                    type="text"
                    value={achProjectTitle}
                    onChange={(e) => setAchProjectTitle(e.target.value)}
                    placeholder="e.g. OpenKas: Realtime Public Ledger"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Tautan Sertifikat / Bukti (Opsional)
                  </label>
                  <input
                    type="url"
                    value={achCertUrl}
                    onChange={(e) => setAchCertUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Deskripsi Ringkas Pencapaian
                  </label>
                  <textarea
                    rows={2}
                    value={achDescription}
                    onChange={(e) => setAchDescription(e.target.value)}
                    placeholder="Penjelasan ringkas kontribusi teknis dan prestasi..."
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={createAchievementMutation.isPending}
                  className="px-5 py-2.5 bg-[#111215] text-[#F4F1EB] hover:bg-[#6456EB] transition-colors rounded-none text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {createAchievementMutation.isPending ? 'Menerbitkan...' : 'Terbitkan Prestasi'}
                </button>
              </div>
            </form>

            {/* List Prestasi */}
            <div>
              <h3 className="text-sm font-semibold text-[#111215] mb-3">
                Daftar Prestasi ({achievementsList.length})
              </h3>
              {isLoadingAchList ? (
                <div className="space-y-3">
                  <DashboardRowSkeleton />
                  <DashboardRowSkeleton />
                </div>
              ) : achievementsList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#111215]/15 rounded-none bg-[#F4F1EB]/30">
                  <p className="text-xs font-semibold text-[#111215]">Belum ada prestasi terdaftar</p>
                  <p className="text-[11px] text-[#525660] mt-1">
                    Gunakan formulir di atas untuk menerbitkan rekam jejak prestasi kejuaraan resmi.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {achievementsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-[#111215]/10 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-[#6456EB]/10 text-[#6456EB] rounded-none">
                            {item.tier}
                          </span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#111215]/6 text-[#111215] rounded-none">
                            {item.rank}
                          </span>
                          <span className="text-[11px] text-[#525660]">
                            {item.award_date || item.date}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#111215]">{item.title}</h4>
                        <p className="text-xs text-[#525660]">
                          {item.event_name || item.competition}
                          {item.team_name ? ` · Tim ${item.team_name}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {item.certificate_url && (
                          <a
                            href={item.certificate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 border border-[#111215]/15 text-[#525660] hover:text-[#111215] rounded-none text-xs flex items-center gap-1"
                            title="Buka sertifikat"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus prestasi "${item.title}"?`)) {
                              deleteAchievementMutation.mutate(item.id)
                            }
                          }}
                          disabled={deleteAchievementMutation.isPending}
                          className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-none text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: KELOLA WARTA & BERITA (GOD ADMIN & SUPER ADMIN) */}
      {canManageContent && activeTab === 'news' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-none border border-[#111215]/8 p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-4 h-4 text-[#111215]" />
                  <h2 className="text-lg font-semibold tracking-tight text-[#111215]">
                    Manajemen Publikasi Warta & Berita
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1">
                  Otoritas eksklusif GOD-ADMIN & SUPER ADMIN untuk menerbitkan atau menghapus artikel pada rute publik /news.
                </p>
              </div>
              <span className="self-start sm:self-auto px-2 py-0.5 rounded-none text-[10px] font-semibold bg-[#111215] text-[#F4F1EB]">
                {newsList.length} Warta Diterbitkan
              </span>
            </div>

            {/* Notification messages */}
            {newsSuccess && (
              <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-none flex items-center justify-between">
                <span>{newsSuccess}</span>
                <button type="button" onClick={() => setNewsSuccess('')} className="p-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            {newsError && (
              <div className="mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-none flex items-center justify-between">
                <span>{newsError}</span>
                <button type="button" onClick={() => setNewsError('')} className="p-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Form Tambah Warta */}
            <form onSubmit={handleCreateNews} className="space-y-4 mb-8 bg-[#F4F1EB]/40 p-4 sm:p-6 border border-[#111215]/10 rounded-none">
              <h3 className="text-sm font-semibold text-[#111215] flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-[#6456EB]" />
                <span>Terbitkan Artikel Warta Baru</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Judul Warta / Berita <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="e.g. Pembukaan Pendaftaran Rekrutmen Calon Anggota Batch 2026"
                    required
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Kategori Publikasi
                  </label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Rilis Produk">Rilis Produk</option>
                    <option value="Riset & Edukasi">Riset & Edukasi</option>
                    <option value="Kegiatan Komunitas">Kegiatan Komunitas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Nama Penulis
                  </label>
                  <input
                    type="text"
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    placeholder={`e.g. ${currentUser.name}`}
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Tagar / Topik (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={newsTags}
                    onChange={(e) => setNewsTags(e.target.value)}
                    placeholder="e.g. Rekrutmen, Onboarding, Batch 2026"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#111215]">
                    <input
                      type="checkbox"
                      checked={newsIsPinned}
                      onChange={(e) => setNewsIsPinned(e.target.checked)}
                      className="rounded-none border-[#111215]/20 text-[#111215] focus:ring-0 cursor-pointer"
                    />
                    <span>Sematkan warta ini pada sorotan paling atas (Pinned Article)</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Rangkuman Singkat (Tampil pada kartu tinjauan) <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={newsSummary}
                    onChange={(e) => setNewsSummary(e.target.value)}
                    placeholder="Rangkuman artikel dalam 1-2 kalimat..."
                    required
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Konten Lengkap (Mendukung format Markdown)
                  </label>
                  <textarea
                    rows={6}
                    value={newsContentMD}
                    onChange={(e) => setNewsContentMD(e.target.value)}
                    placeholder="### Judul Bab&#10;&#10;Tuliskan isi warta atau siaran pengumuman lengkap..."
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] font-mono focus:outline-none focus:border-[#6456EB]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="px-5 py-2.5 bg-[#111215] text-[#F4F1EB] hover:bg-[#6456EB] transition-colors rounded-none text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  {createPostMutation.isPending ? 'Menerbitkan...' : 'Terbitkan Warta'}
                </button>
              </div>
            </form>

            {/* List Warta */}
            <div>
              <h3 className="text-sm font-semibold text-[#111215] mb-3">
                Daftar Warta Diterbitkan ({newsList.length})
              </h3>
              {isLoadingNewsList ? (
                <div className="space-y-3">
                  <DashboardRowSkeleton />
                  <DashboardRowSkeleton />
                </div>
              ) : newsList.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-[#111215]/15 rounded-none bg-[#F4F1EB]/30">
                  <p className="text-xs font-semibold text-[#111215]">Belum ada warta diterbitkan</p>
                  <p className="text-[11px] text-[#525660] mt-1">
                    Gunakan formulir di atas untuk menerbitkan artikel warta atau rilis resmi NCD.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {newsList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 bg-white border border-[#111215]/10 rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-[#111215]/6 text-[#111215] rounded-none">
                            {item.category}
                          </span>
                          {item.is_pinned && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#6456EB]/10 text-[#6456EB] rounded-none">
                              Disorot
                            </span>
                          )}
                          <span className="text-[11px] text-[#525660]">
                            {item.author_name}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#111215]">{item.title}</h4>
                        <p className="text-xs text-[#525660] line-clamp-1">{item.summary}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Hapus warta "${item.title}"?`)) {
                              deletePostMutation.mutate(item.id)
                            }
                          }}
                          disabled={deletePostMutation.isPending}
                          className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-none text-xs font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ARUS KEUANGAN & BUKTI NOTA (SEE-ALL AUDIT FOR GOD ADMIN & CHAIRMAN) */}
      {(activeTab === 'finance' || activeTab === 'overview') && (
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-[#111215]" />
                  <h2 className="text-lg font-semibold tracking-tight text-[#111215]">
                    Arus Kas & Pemeriksaan Bukti Nota
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1">
                  {isChairman
                    ? 'Hak pengawasan penuh (See-All): Chairman memiliki akses transparansi terhadap seluruh mutasi kas, saldo riil, dan lampiran nota fisik.'
                    : 'God Admin memiliki hak audit penuh untuk melihat seluruh catatan debet, kredit, dan foto nota fisik.'}
                </p>
              </div>

              {/* Filter: React Bits RubberSegment */}
              <div className="w-full sm:w-auto shrink-0 overflow-hidden">
                <RubberSegment
                  items={[
                    { value: 'ALL', label: 'Semua' },
                    { value: 'INCOME', label: 'Pemasukan' },
                    { value: 'EXPENSE', label: 'Pengeluaran' },
                  ]}
                  value={txFilter}
                  onChange={(mode) => setTxFilter(mode as typeof txFilter)}
                  trackColor="#F4F1EB"
                  thumbColor="#111215"
                  textColor="#525660"
                  activeTextColor="#F4F1EB"
                  size="sm"
                  radius={10}
                  inset={2}
                  equalSlots
                  stretch={50}
                  speed={1.2}
                  className="w-full sm:w-auto"
                  aria-label="Filter Aliran Kas"
                />
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="border border-[#111215]/8 rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 bg-[#F4F1EB] px-4 py-2.5 text-[11px] font-semibold text-[#525660] border-b border-[#111215]/8">
                <div className="col-span-3">NO. TRANSAKSI & TANGGAL</div>
                <div className="col-span-4">DESKRIPSI & KATEGORI</div>
                <div className="col-span-2">NOMINAL</div>
                <div className="col-span-1">STATUS</div>
                <div className="col-span-2 text-right">BUKTI NOTA</div>
              </div>

              {loadingTx ? (
                <div className="divide-y divide-[#111215]/6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <DashboardRowSkeleton key={i} />
                  ))}
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7E8492]">
                  Tidak ada transaksi kas untuk filter ini.
                </div>
              ) : (
                <div className="divide-y divide-[#111215]/6">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 sm:px-4 sm:py-3 transition-colors hover:bg-[#F4F1EB]/40"
                    >
                      {/* Mobile View (< sm) */}
                      <div className="sm:hidden space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-mono text-xs font-semibold text-[#111215] block">
                              {tx.transaction_number}
                            </span>
                            <span className="text-[11px] text-[#7E8492]">
                              {tx.transaction_date}
                            </span>
                          </div>
                          <div className="text-right">
                            <span
                              className={`font-mono text-xs font-semibold block ${
                                tx.type === 'INCOME'
                                  ? 'text-emerald-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {tx.type === 'INCOME' ? '+' : '-'}
                              {formatRupiah(tx.amount)}
                            </span>
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                                tx.status === 'VERIFIED'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : tx.status === 'DRAFT_PENDING'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-red-50 text-red-700 border-red-200'
                              }`}
                            >
                              {tx.status === 'VERIFIED'
                                ? 'Sah'
                                : tx.status === 'DRAFT_PENDING'
                                ? 'Draft'
                                : 'Void'}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-[#111215] font-medium leading-relaxed">
                          {tx.description}
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-[#111215]/6 text-[11px] text-[#7E8492]">
                          <span className="truncate pr-2">
                            {tx.category_name} • PIC: {tx.person_in_charge}
                          </span>
                          <button
                            onClick={() => setActiveReceipt(tx)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-[#F4F1EB] hover:bg-[#111215] text-[#111215] hover:text-[#F4F1EB] border border-[#111215]/8 transition-colors text-xs font-medium cursor-pointer shrink-0"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Bukti Nota</span>
                          </button>
                        </div>
                      </div>

                      {/* Desktop View (>= sm) */}
                      <div className="hidden sm:grid grid-cols-12 gap-0 items-center text-xs">
                        {/* Number & Date */}
                        <div className="col-span-3 min-w-0 pr-2">
                          <div className="font-mono text-xs font-semibold text-[#111215] truncate">
                            {tx.transaction_number}
                          </div>
                          <div className="text-[11px] text-[#7E8492]">
                            {tx.transaction_date}
                          </div>
                        </div>

                        {/* Description & Category */}
                        <div className="col-span-4 min-w-0 pr-3">
                          <div className="font-medium text-[#111215] truncate">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-[#7E8492] truncate">
                            {tx.category_name} • PIC: {tx.person_in_charge}
                          </div>
                        </div>

                        {/* Amount */}
                        <div className="col-span-2 font-mono font-semibold">
                          <span
                            className={
                              tx.type === 'INCOME'
                                ? 'text-emerald-700'
                                : 'text-rose-700'
                            }
                          >
                            {tx.type === 'INCOME' ? '+' : '-'}
                            {formatRupiah(tx.amount)}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                              tx.status === 'VERIFIED'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : tx.status === 'DRAFT_PENDING'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {tx.status === 'VERIFIED'
                              ? 'Sah'
                              : tx.status === 'DRAFT_PENDING'
                              ? 'Draft'
                              : 'Void'}
                          </span>
                        </div>

                        {/* Receipt Action Button */}
                        <div className="col-span-2 text-right">
                          <button
                            onClick={() => setActiveReceipt(tx)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-[#F4F1EB] hover:bg-[#111215] text-[#111215] hover:text-[#F4F1EB] border border-[#111215]/8 transition-colors text-xs font-medium cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Lihat Bukti Nota</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: PROFILE INFORMATION */}
      {(activeTab === 'profile' || activeTab === 'overview') && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-5 sm:p-7 shadow-2xs">
            <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-[#111215]/8">
              <User className="w-4 h-4 text-[#111215]" />
              <h2 className="text-lg font-semibold tracking-tight text-[#111215]">
                {isGodAdmin
                  ? 'Informasi Profil God Admin'
                  : isChairman
                  ? 'Informasi Profil Chairman (Super Admin)'
                  : 'Informasi Profil Pengurus'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block mb-1">
                    Nama Lengkap
                  </label>
                  <div className="text-sm font-semibold text-[#111215] p-3 rounded-xl bg-[#F4F1EB]">
                    {currentUser.name}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block mb-1">
                    Role & Tingkat Akses
                  </label>
                  <div className="text-sm font-semibold text-[#111215] p-3 rounded-xl bg-[#F4F1EB] flex items-center justify-between">
                    <span>
                      {currentUser.role}{' '}
                      {isGodAdmin
                        ? '(Otoritas Sistem Penuh)'
                        : isChairman
                        ? '(Pimpinan Eksekutif Komunitas)'
                        : ''}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {isGodAdmin ? 'Root Active' : 'Executive Active'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block mb-1">
                    Jabatan Operasional
                  </label>
                  <div className="text-sm text-[#111215] p-3 rounded-xl bg-[#F4F1EB]">
                    {currentUser.position}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block">
                      Kunci Akses Terverifikasi
                    </label>
                    {!editingMyToken && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMyToken(true)
                          setNewMyTokenKey(currentUser.key)
                          setTokenUpdateMsg(null)
                        }}
                        className="inline-flex items-center space-x-1 text-[11px] text-[#111215] font-medium hover:underline cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Ganti Token</span>
                      </button>
                    )}
                  </div>

                  {!editingMyToken ? (
                    <div className="text-sm font-mono font-semibold text-[#111215] p-3 rounded-xl bg-[#F4F1EB] flex items-center justify-between">
                      <span>{currentUser.key}</span>
                      <button
                        onClick={() => handleCopy(currentUser.key)}
                        className="p-1 rounded hover:bg-white text-[#7E8492] hover:text-[#111215] cursor-pointer"
                        title="Salin kunci akses"
                      >
                        {copiedKey === currentUser.key ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleUpdateMyToken}
                      className="p-3.5 rounded-xl border border-[#111215]/15 bg-[#F4F1EB]/50 space-y-2.5"
                    >
                      <div className="text-[11px] text-[#525660]">
                        Kode token baru (wajib diawali{' '}
                        <span className="font-mono font-semibold text-[#111215]">
                          NCD-
                        </span>
                        ):
                      </div>
                      <input
                        type="text"
                        value={newMyTokenKey}
                        onChange={(e) =>
                          setNewMyTokenKey(e.target.value.toUpperCase())
                        }
                        placeholder="NCD-..."
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#111215]/20 font-mono text-xs text-[#111215] focus:outline-none focus:border-[#111215]"
                        autoFocus
                      />
                      <div className="flex items-center justify-end space-x-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMyToken(false)
                            setTokenUpdateMsg(null)
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs text-[#525660] hover:bg-[#111215]/5 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={updateTokenMutation.isPending}
                          className="px-3 py-1.5 rounded-lg bg-[#111215] text-[#F4F1EB] text-xs font-medium hover:bg-[#252830] transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {updateTokenMutation.isPending
                            ? 'Menyimpan...'
                            : 'Simpan Kunci'}
                        </button>
                      </div>
                    </form>
                  )}

                  {tokenUpdateMsg && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                        tokenUpdateMsg.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{tokenUpdateMsg.text}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block mb-1">
                    {isGodAdmin
                      ? 'Hak Otoritas Khusus (God Admin Clearance)'
                      : isChairman
                      ? 'Hak Otoritas Khusus (Chairman Clearance)'
                      : 'Kewenangan Pengurus'}
                  </label>
                  <div className="p-3 rounded-xl bg-[#F4F1EB] space-y-1.5 text-[11px] text-[#525660]">
                    {isChairman ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
                          <span>
                            <strong>Otorisasi Delegasi Lomba:</strong> Persetujuan
                            mutlak pencairan dana lomba bersama Wakil Ketua (Notulensi).
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
                          <span>
                            <strong>Financial See-All Clearance:</strong> Hak
                            pengawasan penuh atas neraca, debet/kredit, dan bukti nota fisik.
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
                          <span>
                            <strong>Executive Veto & Void:</strong> Wewenang
                            menolak atau membatalkan pengajuan transaksi yang tidak sesuai regulasi.
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
                          <span>
                            <strong>Role Governance:</strong> Menerbitkan &
                            mencabut token role apapun
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
                          <span>
                            <strong>Financial Audit:</strong> Memeriksa seluruh
                            transaksi kas dan bukti nota sah
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
                          <span>
                            <strong>Void Master:</strong> Membatalkan transaksi
                            bermasalah tanpa restriksi
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block mb-1">
                    Sesi Keamanan
                  </label>
                  <div className="text-xs text-[#525660] p-3 rounded-xl bg-[#F4F1EB]">
                    Terautentikasi melalui Token Key JWT 24-jam terproteksi HTTP-Only.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BUKTI NOTA VIEWER */}
      <AnimatePresence>
        {activeReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#111215]/60 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setActiveReceipt(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl border border-[#111215]/10 max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#111215]/8 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-[#111215]" />
                  <h3 className="font-semibold text-sm text-[#111215]">
                    Bukti Nota: {activeReceipt.transaction_number}
                  </h3>
                </div>
                <p className="text-[11px] text-[#7E8492] mt-0.5">
                  {activeReceipt.transaction_date} • {activeReceipt.category_name}
                </p>
              </div>

              <button
                onClick={() => setActiveReceipt(null)}
                className="w-8 h-8 rounded-lg hover:bg-[#F4F1EB] text-[#7E8492] hover:text-[#111215] flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content: Photo + Details */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Receipt Image */}
              <div className="rounded-xl border border-[#111215]/8 overflow-hidden bg-[#F4F1EB] relative">
                {activeReceipt.receipt_url ? (
                  <img
                    src={activeReceipt.receipt_url}
                    alt={`Bukti nota ${activeReceipt.transaction_number}`}
                    className="w-full max-h-72 object-contain mx-auto"
                    loading="lazy"
                  />
                ) : (
                  <div className="p-12 text-center text-[#7E8492]">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-[#7E8492]" />
                    <p>Lampiran foto fisik tidak tersedia</p>
                  </div>
                )}
              </div>

              {/* Transaction Metadata */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F4F1EB] text-xs">
                <div>
                  <span className="text-[10px] text-[#7E8492] uppercase block">
                    Nominal Kas
                  </span>
                  <span
                    className={`font-mono font-semibold text-sm ${
                      activeReceipt.type === 'INCOME'
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {activeReceipt.type === 'INCOME' ? '+' : '-'}
                    {formatRupiah(activeReceipt.amount)}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7E8492] uppercase block">
                    Jenis Aliran
                  </span>
                  <span className="font-medium text-[#111215]">
                    {activeReceipt.type === 'INCOME'
                      ? 'Pemasukan Dana'
                      : 'Pengeluaran Dana'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7E8492] uppercase block">
                    Penanggung Jawab (PIC)
                  </span>
                  <span className="font-medium text-[#111215]">
                    {activeReceipt.person_in_charge}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7E8492] uppercase block">
                    Status Verifikasi
                  </span>
                  <span className="font-medium text-emerald-700">
                    {activeReceipt.status === 'VERIFIED'
                      ? 'Terverifikasi Sah'
                      : activeReceipt.status === 'DRAFT_PENDING'
                      ? 'Draft Menunggu'
                      : 'Dibatalkan / Void'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block mb-1">
                  Keterangan Nota
                </span>
                <p className="p-3 rounded-xl bg-[#F4F1EB] text-[#111215] leading-relaxed">
                  {activeReceipt.description}
                </p>
              </div>

              {/* Maker / Checker Audit Info */}
              <div className="p-3 rounded-xl border border-[#111215]/8 space-y-1 text-[11px] text-[#525660]">
                <div>
                  <strong>Maker (Pencatat):</strong>{' '}
                  {activeReceipt.maker_name || 'Bendahara I'}
                </div>
                {activeReceipt.verifier_name && (
                  <div>
                    <strong>Persetujuan / Verifikator:</strong>{' '}
                    {activeReceipt.verifier_name} (
                    {activeReceipt.verified_at
                      ? new Date(activeReceipt.verified_at).toLocaleDateString(
                          'id-ID'
                        )
                      : 'Terverifikasi'}
                    )
                  </div>
                )}
                {activeReceipt.void_reason && (
                  <div className="text-rose-700">
                    <strong>Alasan Ditolak / Void:</strong> {activeReceipt.void_reason}{' '}
                    {activeReceipt.void_by_name ? `(${activeReceipt.void_by_name})` : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#111215]/8 bg-[#F4F1EB]/50 flex items-center justify-between">
              {activeReceipt.receipt_url && (
                <a
                  href={activeReceipt.receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-[#111215] hover:underline inline-flex items-center space-x-1"
                >
                  <span>Buka Gambar Asli</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-2 min-h-[38px] rounded-xl bg-[#111215] text-[#F4F1EB] text-xs font-medium cursor-pointer hover:bg-[#252830] transition-colors ml-auto"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* MODAL: TOLAK / VOID TRANSAKSI PENGAJUAN LOMBA */}
      <AnimatePresence>
        {rejectModalTx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#111215]/60 flex items-center justify-center p-4 sm:p-6"
            onClick={() => {
              setRejectModalTx(null)
              setRejectReason('')
              setRejectError('')
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl border border-[#111215]/10 max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between pb-3 border-b border-[#111215]/8">
              <div>
                <h3 className="font-semibold text-sm text-rose-800 flex items-center space-x-1.5">
                  <XCircle className="w-4 h-4 text-rose-700" />
                  <span>Tolak Pengajuan Dana Lomba</span>
                </h3>
                <p className="text-xs text-[#7E8492] mt-0.5">
                  {rejectModalTx.transaction_number} • -{formatRupiah(rejectModalTx.amount)}
                </p>
              </div>
              <button
                onClick={() => {
                  setRejectModalTx(null)
                  setRejectReason('')
                  setRejectError('')
                }}
                className="w-8 h-8 rounded-lg hover:bg-[#F4F1EB] text-[#7E8492] hover:text-[#111215] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#525660] space-y-2">
              <p>
                Anda akan menolak pengeluaran untuk <strong>{rejectModalTx.description}</strong> (PIC: {rejectModalTx.person_in_charge}).
              </p>
              <div>
                <label className="text-[11px] font-medium text-[#111215] block mb-1.5">
                  Alasan Penolakan (Wajib disertakan untuk akuntabilitas):
                </label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Proposal delegasi belum lengkap atau melebihi alokasi kas lomba periode ini..."
                  className="w-full p-2.5 rounded-xl bg-[#F4F1EB] border border-[#111215]/10 text-xs text-[#111215] focus:outline-none focus:border-[#111215]"
                />
              </div>

              {rejectError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                  {rejectError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#111215]/8">
              <button
                type="button"
                onClick={() => {
                  setRejectModalTx(null)
                  setRejectReason('')
                  setRejectError('')
                }}
                className="px-4 py-2 min-h-[38px] rounded-xl border border-[#111215]/10 text-xs text-[#525660] hover:bg-[#F4F1EB] cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || voidTxMutation.isPending}
                onClick={() => {
                  if (!rejectReason.trim()) return
                  voidTxMutation.mutate({
                    id: rejectModalTx.id,
                    reason: rejectReason.trim(),
                  })
                }}
                className="px-4 py-2 min-h-[38px] rounded-xl bg-rose-700 text-white text-xs font-medium hover:bg-rose-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {voidTxMutation.isPending ? 'Memproses...' : 'Konfirmasi Tolak'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* MODAL: EDIT TOKEN KEY */}
      <AnimatePresence>
        {editingTokenItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 bg-[#111215]/60 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setEditingTokenItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl border border-[#111215]/10 max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between pb-3 border-b border-[#111215]/8">
              <div>
                <h3 className="font-semibold text-sm text-[#111215]">
                  Ubah Kode Token Akses
                </h3>
                <p className="text-xs text-[#7E8492] mt-0.5">
                  Untuk {editingTokenItem.assignee} ({editingTokenItem.role})
                </p>
              </div>
              <button
                onClick={() => setEditingTokenItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-[#F4F1EB] text-[#7E8492] hover:text-[#111215] flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTokenItem} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-[#7E8492] uppercase tracking-wider block mb-1">
                  Kode Token Baru (Wajib awalan NCD-)
                </label>
                <input
                  type="text"
                  value={editingItemKey}
                  onChange={(e) =>
                    setEditingItemKey(e.target.value.toUpperCase())
                  }
                  placeholder="NCD-..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F4F1EB] border border-[#111215]/10 font-mono text-xs text-[#111215] focus:outline-none focus:border-[#111215]"
                  autoFocus
                />
                <span className="text-[10px] text-[#7E8492] mt-1 block">
                  Format: Huruf kapital, angka, minus (-), dan underscore (_).
                </span>
              </div>

              {tokenUpdateMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs flex items-center space-x-2 ${
                    tokenUpdateMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{tokenUpdateMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTokenItem(null)}
                  className="px-4 py-2 min-h-[38px] rounded-xl border border-[#111215]/10 text-xs text-[#525660] hover:bg-[#F4F1EB] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateTokenMutation.isPending}
                  className="px-4 py-2 min-h-[38px] rounded-xl bg-[#111215] text-[#F4F1EB] text-xs font-medium hover:bg-[#252830] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {updateTokenMutation.isPending
                    ? 'Menyimpan...'
                    : 'Perbarui Token'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  )
}

export default Dashboard
