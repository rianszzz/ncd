import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  LayoutDashboard,
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
  FileText,
  AlertCircle,
  Pencil,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Award,
  Newspaper,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Users,
  GraduationCap,
  Sparkles,
  Compass,
  BookOpen,
  Target,
  ChevronRight,
  ChevronLeft,
  Search,
  Download,
  CheckSquare,
} from 'lucide-react'
import {
  api,
  AccessKey,
  Transaction,
  CashSummary,
  Achievement,
  Post,
  ApplicationItem,
  MemberProfile,
  OnboardingTrackerItem,
  OnboardingTrackerResponse,
  OrganizationDocument,
  getMemberProfile,
  submitMemberOnboarding,
  getMemberOnboardingTracker,
} from '../services/api'
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
  const navigate = useNavigate()
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

  // Fail-closed security redirect: must possess both JWT token and stored user object
  useEffect(() => {
    const token = localStorage.getItem('ncd_jwt')
    if (!token || !localUser) {
      navigate('/login', { replace: true })
    }
  }, [localUser, navigate])

  const currentUser = {
    id: localUser?.id || '',
    name: localUser?.full_name || localUser?.name || 'Member NCD',
    email: localUser?.email || '',
    role: localUser?.role || 'MEMBER',
    position: localUser?.position || 'Anggota',
    key: localUser?.key || '',
  }

  const isGodAdmin = currentUser.role === 'GOD_ADMIN'
  const isChairman =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.position.toLowerCase().includes('chair')
  const isPengurus = currentUser.role !== 'MEMBER'
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN'
  const isSekretaris = currentUser.role === 'SEKRETARIS'
  const isBendahara1 = currentUser.role === 'BENDAHARA_I'
  const isBendahara2 = currentUser.role === 'BENDAHARA_II'
  const isBendahara = isBendahara1 || isBendahara2
  const canManageCash = isBendahara || isGodAdmin || isSuperAdmin
  const canManageNews = isGodAdmin || isSuperAdmin || isSekretaris
  const canManageDocs = isGodAdmin || isSuperAdmin || isSekretaris
  const canVerifyApplications = isGodAdmin || isSuperAdmin || isSekretaris

  // Active Tab: 'overview' | 'tokens' | 'approvals' | 'achievements' | 'news' | 'documents' | 'finance' | 'profile' | 'recruitment' | 'member-onboarding' | 'onboarding'
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'tokens'
    | 'approvals'
    | 'achievements'
    | 'news'
    | 'documents'
    | 'finance'
    | 'profile'
    | 'recruitment'
    | 'member-onboarding'
    | 'onboarding'
  >('overview')

  // Member Onboarding State (Role: MEMBER)
  const [onboardingStep, setOnboardingStep] = useState<1 | 2 | 3 | 4>(1)
  const [onboardingForm, setOnboardingForm] = useState({
    major: '',
    cohort_year: '2024',
    campus_domicile: '',
    interests: '',
    target_skills: '',
    hobbies: '',
    specific_focus: '',
    topics_to_learn: '',
    expectations: [] as string[],
    expectation_note: '',
    interest_fields: [] as string[],
    other_interest: '',
  })
  const [isEditingOnboarding, setIsEditingOnboarding] = useState(false)
  const [onboardingSuccessToast, setOnboardingSuccessToast] = useState(false)

  // Member Onboarding Tracker State (Role: Pengurus / Super Admin / God Admin)
  const [trackerStatusFilter, setTrackerStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL')
  const [trackerSearchQuery, setTrackerSearchQuery] = useState('')
  const [selectedTrackerMember, setSelectedTrackerMember] = useState<OnboardingTrackerItem | null>(null)

  // Application / Recruitment State
  const [selectedAppFilter, setSelectedAppFilter] = useState<'ALL' | 'NEW' | 'ACCEPTED' | 'REJECTED'>('ALL')
  const [votingDiscussion, setVotingDiscussion] = useState<{ [appId: string]: string }>({})
  const [appFeedback, setAppFeedback] = useState<{ [appId: string]: string }>({})
  const [decisionModal, setDecisionModal] = useState<{
    app: ApplicationItem
    action: 'ACCEPTED' | 'REJECTED'
  } | null>(null)
  const [deleteModal, setDeleteModal] = useState<{
    type: 'single' | 'date'
    id?: string
    name?: string
    dateLabel?: string
    dateKey?: string
    count?: number
    ids?: string[]
  } | null>(null)

  // Verification Modal State (Sekretaris Verifikator)
  const [verifyModal, setVerifyModal] = useState<{
    app: ApplicationItem
    status: 'LENGKAP' | 'PERLU_REVISI' | 'TIDAK_LENGKAP'
    note: string
  } | null>(null)

  // Document & Notulensi Form State (Sekretaris, Super Admin, God Admin)
  const [docTitle, setDocTitle] = useState('')
  const [docDate, setDocDate] = useState('')
  const [docCategory, setDocCategory] = useState<'NOTULENSI' | 'SOP' | 'SURAT_KEPUTUSAN' | 'PANDUAN' | 'ARSIP'>('NOTULENSI')
  const [docSummary, setDocSummary] = useState('')
  const [docContent, setDocContent] = useState('')
  const [docFileLink, setDocFileLink] = useState('')
  const [docSuccess, setDocSuccess] = useState('')
  const [docError, setDocError] = useState('')
  const [selectedDocView, setSelectedDocView] = useState<OrganizationDocument | null>(null)
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('ALL')

  const canManageContent =
    currentUser.role === 'GOD_ADMIN' || currentUser.role === 'SUPER_ADMIN'

  // New Achievement Form State (Simplified)
  const [achTitle, setAchTitle] = useState('')
  const [achEventName, setAchEventName] = useState('')
  const [achTier, setAchTier] = useState('Nasional')
  const [achAwardDate, setAchAwardDate] = useState('')
  const [achTeamName, setAchTeamName] = useState('')
  const [achDescription, setAchDescription] = useState('')
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

  // Finance Entry & Edit State (Bendahara, Super Admin, God Admin)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
  const [txCategory, setTxCategory] = useState('Operasional')
  const [txCustomCategory, setTxCustomCategory] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txDate, setTxDate] = useState('')
  const [txPIC, setTxPIC] = useState('')
  const [txDescription, setTxDescription] = useState('')
  const [txReceiptUrl, setTxReceiptUrl] = useState('')
  const [txFormError, setTxFormError] = useState('')
  const [txStatusFilter, setTxStatusFilter] = useState<'ALL' | 'VERIFIED' | 'DRAFT_PENDING' | 'VOID'>('ALL')

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

  // Mutation: Create Transaction Draft (Bendahara, Super Admin, God Admin)
  const createTransactionMutation = useMutation({
    mutationFn: async (payload: {
      type: 'INCOME' | 'EXPENSE'
      category_name: string
      amount: number
      description: string
      person_in_charge: string
      receipt_url: string
      transaction_date?: string
    }) => {
      const res = await api.post('/finance/transactions', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['cashSummary'] })
      setIsTxModalOpen(false)
      resetTxForm()
    },
    onError: (err: any) => {
      setTxFormError(err?.response?.data || err?.response?.data?.message || 'Gagal menyimpan transaksi')
    },
  })

  // Mutation: Update Transaction (Edit Draft or Revise Void)
  const updateTransactionMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: {
        type: 'INCOME' | 'EXPENSE'
        category_name: string
        amount: number
        description: string
        person_in_charge: string
        receipt_url: string
        transaction_date?: string
      }
    }) => {
      const res = await api.put(`/finance/transactions/${id}`, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['cashSummary'] })
      setIsTxModalOpen(false)
      setEditingTransaction(null)
      resetTxForm()
    },
    onError: (err: any) => {
      setTxFormError(err?.response?.data || err?.response?.data?.message || 'Gagal memperbarui transaksi')
    },
  })

  // Mutation: Delete Transaction Draft
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/finance/transactions/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financeTransactions'] })
      queryClient.invalidateQueries({ queryKey: ['cashSummary'] })
    },
    onError: (err: any) => {
      alert(err?.response?.data?.error || err?.response?.data || 'Gagal menghapus draft transaksi')
    },
  })

  const resetTxForm = () => {
    setTxType('EXPENSE')
    setTxCategory('Operasional')
    setTxCustomCategory('')
    setTxAmount('')
    setTxDate('')
    setTxPIC('')
    setTxDescription('')
    setTxReceiptUrl('')
    setTxFormError('')
  }

  const openCreateTransaction = () => {
    setEditingTransaction(null)
    resetTxForm()
    setTxDate(new Date().toISOString().split('T')[0])
    setTxPIC(currentUser.name)
    setIsTxModalOpen(true)
  }

  const openEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx)
    setTxType(tx.type)
    setTxCategory(tx.category_name)
    setTxCustomCategory('')
    setTxAmount(tx.amount.toString())
    setTxDate(tx.transaction_date)
    setTxPIC(tx.person_in_charge)
    setTxDescription(tx.description)
    setTxReceiptUrl(tx.receipt_url)
    setTxFormError('')
    setIsTxModalOpen(true)
  }

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file foto nota maksimal 5MB')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => {
      setTxReceiptUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(txAmount)
    if (!amt || amt <= 0) {
      setTxFormError('Nominal transaksi harus lebih besar dari 0')
      return
    }
    if (!txDescription.trim()) {
      setTxFormError('Keterangan transaksi wajib diisi')
      return
    }
    if (!txReceiptUrl.trim()) {
      setTxFormError('Bukti foto nota wajib dilampirkan (unggah foto atau tautan URL)')
      return
    }

    const category = txCategory === 'Lainnya' ? (txCustomCategory.trim() || 'Lainnya') : txCategory

    const payload = {
      type: txType,
      category_name: category,
      amount: amt,
      description: txDescription.trim(),
      person_in_charge: txPIC.trim() || currentUser.name,
      receipt_url: txReceiptUrl.trim(),
      transaction_date: txDate || new Date().toISOString().split('T')[0],
    }

    if (editingTransaction) {
      updateTransactionMutation.mutate({
        id: editingTransaction.id,
        payload,
      })
    } else {
      createTransactionMutation.mutate(payload)
    }
  }

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
    enabled: canManageNews,
  })

  // Queries & Mutations for Member Recruitment & Voting (All Pengurus except Member)
  const { data: rawApps = [], isLoading: isLoadingApps } = useQuery<ApplicationItem[]>({
    queryKey: ['portalApplications'],
    queryFn: async () => {
      const res = await api.get('/portal/applications')
      return Array.isArray(res.data) ? res.data : []
    },
    enabled: isPengurus,
  })

  const applicationsList = Array.isArray(rawApps) ? rawApps : []

  const pendingAppsCount = applicationsList.filter((a) => a.status === 'NEW').length

  // Member Profile & Onboarding Query (Role MEMBER)
  const { data: memberProfile } = useQuery<MemberProfile>({
    queryKey: ['memberProfile'],
    queryFn: getMemberProfile,
    enabled: !isPengurus,
  })

  // Member Onboarding Tracker Query (Khusus Pengurus)
  const {
    data: onboardingTracker,
    isLoading: isOnboardingTrackerLoading,
  } = useQuery<OnboardingTrackerResponse>({
    queryKey: ['memberOnboardingTracker'],
    queryFn: getMemberOnboardingTracker,
    enabled: isPengurus,
  })

  const pendingOnboardingCount = onboardingTracker?.pending_count || 0

  useEffect(() => {
    if (memberProfile) {
      setOnboardingForm({
        major: memberProfile.major || '',
        cohort_year: memberProfile.cohort_year || '2024',
        campus_domicile: memberProfile.campus_domicile || '',
        interests: memberProfile.interests || '',
        target_skills: memberProfile.target_skills || '',
        hobbies: memberProfile.hobbies || '',
        specific_focus: memberProfile.specific_focus || '',
        topics_to_learn: memberProfile.topics_to_learn || '',
        expectations: memberProfile.expectations || [],
        expectation_note: memberProfile.expectation_note || '',
        interest_fields: memberProfile.interest_fields || [],
        other_interest: memberProfile.other_interest || '',
      })
    }
  }, [memberProfile])

  const submitOnboardingMutation = useMutation({
    mutationFn: submitMemberOnboarding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberProfile'] })
      queryClient.invalidateQueries({ queryKey: ['memberOnboardingTracker'] })
      setIsEditingOnboarding(false)
      setOnboardingSuccessToast(true)
      setTimeout(() => setOnboardingSuccessToast(false), 4000)
    },
  })

  const groupedApplications = React.useMemo(() => {
    const filtered = applicationsList
      .filter((a) => {
        if (selectedAppFilter === 'NEW') return a.status === 'NEW'
        if (selectedAppFilter === 'ACCEPTED') return a.status === 'ACCEPTED'
        if (selectedAppFilter === 'REJECTED') return a.status === 'REJECTED'
        return true
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    const groups: { [dateStr: string]: ApplicationItem[] } = {}
    for (const app of filtered) {
      const dateKey = new Date(app.created_at).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      if (!groups[dateKey]) groups[dateKey] = []
      groups[dateKey].push(app)
    }
    return groups
  }, [applicationsList, selectedAppFilter])

  const voteApplicationMutation = useMutation({
    mutationFn: async ({
      id,
      decision,
      note,
    }: {
      id: string
      decision: 'ACC' | 'TIDAK_ACC'
      note?: string
    }) => {
      const res = await api.post(`/portal/applications/${id}/vote`, { decision, note })
      return res.data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['portalApplications'] })
      setAppFeedback((prev) => ({
        ...prev,
        [vars.id]: `Voting ${vars.decision === 'ACC' ? 'ACC' : 'Tidak ACC'} tersimpan!`,
      }))
      setTimeout(() => {
        setAppFeedback((prev) => {
          const next = { ...prev }
          delete next[vars.id]
          return next
        })
      }, 3000)
    },
    onError: (err: any, vars) => {
      const msg = err.response?.data?.message || err.response?.data || 'Gagal menyimpan voting'
      setAppFeedback((prev) => ({
        ...prev,
        [vars.id]: `Error: ${msg}`,
      }))
    },
  })

  const decideApplicationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) => {
      const res = await api.post(`/portal/applications/${id}/decision`, { status })
      return res.data
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['portalApplications'] })
      setAppFeedback((prev) => ({
        ...prev,
        [vars.id]: `Keputusan ${vars.status === 'ACCEPTED' ? 'DITERIMA' : 'DITOLAK'} berhasil ditetapkan!`,
      }))
    },
    onError: (err: any, vars) => {
      const msg = err.response?.data?.message || err.response?.data || 'Gagal menetapkan keputusan'
      setAppFeedback((prev) => ({
        ...prev,
        [vars.id]: `Error: ${msg}`,
      }))
    },
  })

  // Mutation: Delete Single Application (SUPER_ADMIN only)
  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/portal/applications/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalApplications'] })
      setDeleteModal(null)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Gagal menghapus berkas'
      alert(msg)
    },
  })

  // Mutation: Delete Applications by Date / Batch (SUPER_ADMIN only)
  const deleteApplicationsByDateMutation = useMutation({
    mutationFn: async ({ date, ids }: { date: string; ids?: string[] }) => {
      const res = await api.delete(`/portal/applications/by-date?date=${encodeURIComponent(date)}`, {
        data: { date, ids },
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalApplications'] })
      setDeleteModal(null)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Gagal menghapus berkas tanggal tersebut'
      alert(msg)
    },
  })

  // Mutation: Verify Application dossier (SEKRETARIS, SUPER_ADMIN, GOD_ADMIN)
  const verifyApplicationMutation = useMutation({
    mutationFn: async ({
      id,
      verification_status,
      verification_note,
    }: {
      id: string
      verification_status: string
      verification_note: string
    }) => {
      const res = await api.post(`/portal/applications/${id}/verify`, {
        verification_status,
        verification_note,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalApplications'] })
      setVerifyModal(null)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.response?.data || 'Gagal memverifikasi berkas'
      alert(msg)
    },
  })

  // Query: Documents & Meeting Minutes (Sekretaris, Super Admin, God Admin)
  const { data: documents = [], isLoading: loadingDocuments } = useQuery<OrganizationDocument[]>({
    queryKey: ['portalDocuments'],
    queryFn: async () => {
      const res = await api.get('/portal/documents')
      return res.data
    },
    enabled: canManageDocs,
  })

  // Mutation: Create Document / Meeting Minutes
  const createDocMutation = useMutation({
    mutationFn: async (data: Partial<OrganizationDocument>) => {
      const res = await api.post('/portal/documents', data)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalDocuments'] })
      setDocTitle('')
      setDocDate('')
      setDocSummary('')
      setDocContent('')
      setDocFileLink('')
      setDocSuccess('Dokumen / notulensi rapat berhasil disimpan dan diarsipkan.')
      setDocError('')
      setTimeout(() => setDocSuccess(''), 4000)
    },
    onError: (err: any) => {
      setDocError(err.response?.data?.error || 'Gagal menyimpan dokumen.')
    },
  })

  // Mutation: Delete Document
  const deleteDocMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/portal/documents/${id}`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portalDocuments'] })
    },
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
      setAchDescription('')
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
      setAchError('Prestasi / Peringkat wajib diisi')
      return
    }

    createAchievementMutation.mutate({
      title: achTitle.trim(),
      event_name: achEventName.trim() || achTitle.trim(),
      competition: achEventName.trim() || achTitle.trim(),
      tier: achTier,
      rank: achTitle.trim(),
      date: achAwardDate.trim() || new Date().getFullYear().toString(),
      award_date: achAwardDate.trim() || new Date().getFullYear().toString(),
      team_name: achTeamName.trim(),
      members: achTeamName.trim() ? [achTeamName.trim()] : [],
      team_members: achTeamName.trim() ? [achTeamName.trim()] : [],
      description: achDescription.trim(),
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

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault()
    if (!docTitle.trim()) {
      setDocError('Judul dokumen / notulensi wajib diisi')
      return
    }
    createDocMutation.mutate({
      title: docTitle.trim(),
      date: docDate || new Date().toISOString().split('T')[0],
      category: docCategory,
      summary: docSummary.trim(),
      content_md: docContent.trim(),
      file_link: docFileLink.trim(),
    })
  }

  const handleExportMembersCSV = () => {
    if (!onboardingTracker?.members || onboardingTracker.members.length === 0) {
      alert('Tidak ada data anggota untuk diekspor.')
      return
    }
    const headers = [
      'Nama Lengkap',
      'Email',
      'Token Akses',
      'Status Onboarding',
      'Jurusan',
      'Angkatan',
      'Kampus',
      'Minat',
      'Target Skill',
      'Hobi',
      'Fokus Spesifik',
      'Topik Dipelajari',
      'Bidang Minat',
      'Tanggal Selesai Onboarding',
    ]
    const rows = onboardingTracker.members.map((item: OnboardingTrackerItem) => [
      `"${(item.full_name || '').replace(/"/g, '""')}"`,
      `"${(item.email || '').replace(/"/g, '""')}"`,
      `"${(item.token_key || '').replace(/"/g, '""')}"`,
      item.is_onboarded ? 'SELESAI' : 'BELUM_SELESAI',
      `"${(item.profile?.major || '').replace(/"/g, '""')}"`,
      `"${(item.profile?.cohort_year || '').replace(/"/g, '""')}"`,
      `"${(item.profile?.campus_domicile || '').replace(/"/g, '""')}"`,
      `"${(item.profile?.interests || '').replace(/"/g, '""')}"`,
      `"${(item.profile?.target_skills || '').replace(/"/g, '""')}"`,
      `"${(item.profile?.hobbies || '').replace(/"/g, '""')}"`,
      `"${(item.profile?.specific_focus || '').replace(/"/g, '""')}"`,
      `"${(item.profile?.topics_to_learn || '').replace(/"/g, '""')}"`,
      `"${((item.profile?.interest_fields || []).join(', ')).replace(/"/g, '""')}"`,
      item.completed_at ? `"${new Date(item.completed_at).toLocaleString('id-ID')}"` : '""',
    ])
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `data_anggota_ncd_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  const pendingTransactions = transactions.filter((tx) => tx.status === 'DRAFT_PENDING')
  const voidTransactions = transactions.filter((tx) => tx.status === 'VOID')
  const verifiedTransactions = transactions.filter((tx) => tx.status === 'VERIFIED')

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'INCOME' && tx.type !== 'INCOME') return false
    if (txFilter === 'EXPENSE' && tx.type !== 'EXPENSE') return false
    if (txStatusFilter !== 'ALL' && tx.status !== txStatusFilter) return false
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
      shortLabel: isPengurus ? 'Ringkasan' : 'Dasbor Member',
      label: isPengurus ? 'Ringkasan Utama' : 'Dasbor & Profil Anggota Komunitas',
      icon: LayoutDashboard,
      badge: 0,
    },
    ...(isPengurus
      ? [
          {
            id: 'recruitment' as const,
            shortLabel:
              pendingAppsCount > 0 ? `Rekrutmen (${pendingAppsCount})` : 'Rekrutmen',
            label: 'Musyawarah Rekrutmen & Voting Calon Anggota',
            icon: UserCheck,
            badge: pendingAppsCount,
          },
          {
            id: 'member-onboarding' as const,
            shortLabel:
              pendingOnboardingCount > 0
                ? `Onboarding (${pendingOnboardingCount})`
                : 'Onboarding',
            label: 'Pelacakan Status Onboarding Member Komunitas',
            icon: Users,
            badge: pendingOnboardingCount,
          },
        ]
      : [
          {
            id: 'onboarding' as const,
            shortLabel: memberProfile?.is_onboarded ? 'Edit Onboarding' : 'Form Onboarding',
            label: 'Alur Formulir Onboarding Anggota Komunitas',
            icon: Sparkles,
            badge: memberProfile?.is_onboarded ? 0 : 1,
          },
        ]),
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
        ]
      : []),
    ...(canManageNews
      ? [
          {
            id: 'news' as const,
            shortLabel: 'Warta',
            label: 'Kelola Warta',
            icon: Newspaper,
            badge: 0,
          },
        ]
      : []),
    ...(canManageDocs
      ? [
          {
            id: 'documents' as const,
            shortLabel: 'Dokumen',
            label: 'Notulensi & Dokumen Organisasi',
            icon: FileText,
            badge: 0,
          },
        ]
      : []),
    {
      id: 'finance' as const,
      shortLabel:
        voidTransactions.length > 0
          ? `Kas (${voidTransactions.length} Rev)`
          : pendingTransactions.length > 0
          ? `Kas (${pendingTransactions.length})`
          : 'Arus Kas',
      label: 'Arus Kas & Bukti Nota',
      icon: Wallet,
      badge: voidTransactions.length > 0 ? voidTransactions.length : pendingTransactions.length,
    },
    {
      id: 'profile' as const,
      shortLabel: 'Profil',
      label: isGodAdmin
        ? 'Profil God Admin'
        : isChairman
        ? 'Profil Chairman'
        : isPengurus
        ? 'Profil Pengurus'
        : 'Profil Anggota',
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

  // Keyboard navigation for WAI-ARIA tablists (Arrow keys, Home, End)
  const handleTabKeyDown = (e: React.KeyboardEvent, index: number, isMobileTab: boolean) => {
    let nextIndex = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      nextIndex = (index + 1) % navTabs.length
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      nextIndex = (index - 1 + navTabs.length) % navTabs.length
    } else if (e.key === 'Home') {
      e.preventDefault()
      nextIndex = 0
    } else if (e.key === 'End') {
      e.preventDefault()
      nextIndex = navTabs.length - 1
    }

    if (nextIndex >= 0) {
      const nextTab = navTabs[nextIndex]
      setActiveTab(nextTab.id as typeof activeTab)
      const targetId = isMobileTab
        ? `dashboard-mobile-tab-${nextTab.id}`
        : `dashboard-desktop-tab-${nextTab.id}`
      document.getElementById(targetId)?.focus()
    }
  }

  // Close active modals on Escape key press
  useEffect(() => {
    if (
      !editingTokenItem &&
      !selectedTrackerMember &&
      !decisionModal &&
      !deleteModal &&
      !verifyModal &&
      !selectedDocView &&
      !isTxModalOpen
    )
      return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingTokenItem(null)
        setSelectedTrackerMember(null)
        setDecisionModal(null)
        setDeleteModal(null)
        setVerifyModal(null)
        setSelectedDocView(null)
        setIsTxModalOpen(false)
        setEditingTransaction(null)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    editingTokenItem,
    selectedTrackerMember,
    decisionModal,
    deleteModal,
    verifyModal,
    selectedDocView,
    isTxModalOpen,
  ])

  // Prevent background page jitter/scroll when any modal is open
  useEffect(() => {
    if (
      editingTokenItem ||
      selectedTrackerMember ||
      decisionModal ||
      deleteModal ||
      verifyModal ||
      selectedDocView ||
      isTxModalOpen
    ) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [
    editingTokenItem,
    selectedTrackerMember,
    decisionModal,
    deleteModal,
    verifyModal,
    selectedDocView,
    isTxModalOpen,
  ])

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 pt-5 pb-28 sm:py-8 md:py-12 text-left">
      {/* Top Header Card */}
      <div className="bg-white border border-[#111215]/15 p-4 sm:p-6 md:p-7 shadow-2xs mb-5 sm:mb-6">
        <div className="flex items-start space-x-2.5 sm:space-x-3.5 min-w-0">
          <span className="w-9 h-9 sm:w-10 sm:h-10 bg-[#111215] text-[#F4F1EB] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 border border-black/20">
            {userInitials}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold tracking-tight text-[#111215]">
                {isPengurus ? `Dasbor Otoritas ${currentUser.name}` : `Dasbor Member ${currentUser.name}`}
              </h1>
              <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase bg-[#111215] text-[#F4F1EB] border border-[#111215] shrink-0">
                {currentUser.role === 'MEMBER' ? 'KOMUNITAS MEMBER' : currentUser.role}
              </span>
              {!isPengurus && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase border shrink-0 ${
                    memberProfile?.is_onboarded
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  {memberProfile?.is_onboarded ? 'Onboarding Selesai' : 'Onboarding Menunggu'}
                </span>
              )}
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
              {isGodAdmin ? 'Master Key:' : isPengurus ? 'Kunci Akses Eksekutif:' : 'Kunci Akses Member:'}
            </span>
            <code className="font-mono text-[11px] sm:text-xs bg-[#F4F1EB] px-2 py-0.5 border border-[#111215]/20 text-[#111215] font-semibold whitespace-nowrap truncate max-w-[210px] sm:max-w-none">
              {currentUser.key}
            </code>
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 font-medium shrink-0">
            {isGodAdmin ? 'Root Active' : isPengurus ? 'Mandat Eksekutif Aktif' : 'Status Anggota Aktif'}
          </span>
        </div>

        {/* Desktop Tab Navigation (Header Card - Visible only on Desktop) */}
        <div className="hidden sm:block mt-4 pt-3.5 border-t border-[#111215]/8 w-full">
          <nav
            role="tablist"
            aria-label="Navigasi Menu Dasbor"
            className="relative flex items-stretch w-full bg-[#F4F1EB] border border-[#111215]/20 p-1 select-none"
          >
            {navTabs.map((tab, idx) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`dashboard-desktop-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`dashboard-panel-${tab.id}`}
                  aria-label={tab.label}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  onKeyDown={(e) => handleTabKeyDown(e, idx, false)}
                  className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-semibold tracking-wide transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-[#111215] ${
                    isActive ? 'text-[#F4F1EB]' : 'text-[#525660] hover:text-[#111215]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dashboardActiveTabThumbDesktop"
                      className="absolute inset-0 bg-[#111215] z-0"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center justify-center">
                    <Icon className="w-4 h-4 shrink-0" />
                  </span>
                  <span className="relative z-10 truncate text-[11px] uppercase tracking-wider font-bold">
                    {tab.shortLabel}
                  </span>
                  {tab.badge > 0 && (
                    <span className="relative z-10 inline-flex px-1.5 py-0.2 text-[10px] font-mono font-bold leading-none bg-rose-600 text-white border border-black/20 shrink-0">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
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

      {/* Toast Notifikasi Sukses Onboarding */}
      {onboardingSuccessToast && (
        <div className="mb-5 sm:mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          <div className="text-xs font-semibold">
            Profil Onboarding Anda berhasil disimpan! Data keanggotaan Anda kini aktif di komunitas NCD.
          </div>
        </div>
      )}

      {/* VIEW ROLE MEMBER: ONBOARDING FLOW & DASHBOARD */}
      {!isPengurus && (activeTab === 'overview' || activeTab === 'onboarding') && (
        <div className="space-y-6 mb-8">
          {(!memberProfile?.is_onboarded || isEditingOnboarding || activeTab === 'onboarding') ? (
            /* WIZARD BERTAHAP ONBOARDING (LANGKAH 1 - 4) */
            <div className="bg-white border border-[#111215]/15 p-5 sm:p-7 shadow-2xs">
              {/* Header Wizard */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
                <div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-5 h-5 text-[#111215]" />
                    <h2 className="text-lg font-bold tracking-tight text-[#111215]">
                      Alur Orientasi & Onboarding Anggota Komunitas
                    </h2>
                  </div>
                  <p className="text-xs text-[#525660] mt-1 leading-relaxed">
                    Lengkapi 4 tahapan orientasi untuk membuka akses ke repositori internal, kolaborasi proyek, dan direktori talenta NCD.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-[#F4F1EB] border border-[#111215]/15 text-[#111215]">
                    Langkah {onboardingStep} dari 4
                  </span>
                  {memberProfile?.is_onboarded && isEditingOnboarding && (
                    <button
                      type="button"
                      onClick={() => setIsEditingOnboarding(false)}
                      className="px-2.5 py-1 text-xs font-medium text-[#525660] hover:text-[#111215] border border-[#111215]/15 hover:bg-[#F4F1EB] transition-colors"
                    >
                      Batal Ubah
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Steps Header */}
              <div className="mb-8">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[
                    { step: 1, label: '1. Detail Pribadi' },
                    { step: 2, label: '2. Perkenalan Diri' },
                    { step: 3, label: '3. Ekspektasi di NCD' },
                    { step: 4, label: '4. Bidang Minat' },
                  ].map((s) => (
                    <button
                      key={s.step}
                      type="button"
                      onClick={() => setOnboardingStep(s.step as 1 | 2 | 3 | 4)}
                      className={`text-left text-xs font-semibold pb-1.5 transition-colors border-b-2 ${
                        onboardingStep === s.step
                          ? 'border-[#111215] text-[#111215]'
                          : onboardingStep > s.step
                          ? 'border-emerald-600 text-emerald-800'
                          : 'border-[#111215]/10 text-[#7E8492]'
                      }`}
                    >
                      <span className="hidden sm:inline">{s.label}</span>
                      <span className="sm:hidden">Tahap {s.step}</span>
                    </button>
                  ))}
                </div>
                <div className="w-full bg-[#111215]/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#111215] h-full transition-all duration-300"
                    style={{ width: `${onboardingStep * 25}%` }}
                  />
                </div>
              </div>

              {/* STEP 1: Personal Details */}
              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        disabled
                        value={currentUser.name}
                        className="w-full px-3 py-2 bg-[#F4F1EB] border border-[#111215]/15 text-[#111215] font-medium cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                        Program Studi / Jurusan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Teknik Informatika / Sistem Informasi"
                        value={onboardingForm.major}
                        onChange={(e) => setOnboardingForm((prev) => ({ ...prev, major: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                        Angkatan / Tahun Masuk <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={onboardingForm.cohort_year}
                        onChange={(e) => setOnboardingForm((prev) => ({ ...prev, cohort_year: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215]"
                      >
                        <option value="2026">2026 (Angkatan Terbaru)</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="Alumni">Alumni / Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                        Asal Kampus / Domisili Institusi <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Institut Teknologi Sepuluh Nopember (ITS)"
                        value={onboardingForm.campus_domicile}
                        onChange={(e) => setOnboardingForm((prev) => ({ ...prev, campus_domicile: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                        Minat & Bidang Fokus Dasar
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Fullstack Web Development, Machine Learning, UI/UX"
                        value={onboardingForm.interests}
                        onChange={(e) => setOnboardingForm((prev) => ({ ...prev, interests: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                        Keterampilan yang Ingin Dikembangkan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Golang, React, Docker, Figma, PyTorch"
                        value={onboardingForm.target_skills}
                        onChange={(e) => setOnboardingForm((prev) => ({ ...prev, target_skills: e.target.value }))}
                        className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215]"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-black transition-colors"
                    >
                      <span>Lanjut ke Langkah 2: Perkenalan Diri</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Self Introduction */}
              {onboardingStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                      Hobi & Aktivitas di Luar Perkuliahan
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Membaca jurnal riset, catur, bermain gitar, fotografi"
                      value={onboardingForm.hobbies}
                      onChange={(e) => setOnboardingForm((prev) => ({ ...prev, hobbies: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                      Ketertarikan Spesifik / Topik Favorit
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Ceritakan hal spesifik yang menarik minat Anda, misal: arsitektur microservices, model bahasa besar (LLM), perancangan sistem desain web, dll."
                      value={onboardingForm.specific_focus}
                      onChange={(e) => setOnboardingForm((prev) => ({ ...prev, specific_focus: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                      Topik yang Diharapkan untuk Dipelajari di NCD
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Topik atau materi apa yang paling ingin Anda pelajari atau diskusikan bersama komunitas NCD?"
                      value={onboardingForm.topics_to_learn}
                      onChange={(e) => setOnboardingForm((prev) => ({ ...prev, topics_to_learn: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215] resize-none"
                    />
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 border border-[#111215]/20 text-[#525660] hover:text-[#111215] text-xs font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Kembali ke Langkah 1</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-black transition-colors"
                    >
                      <span>Lanjut ke Langkah 3: Ekspektasi</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Expectations */}
              {onboardingStep === 3 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-2">
                      Ekspektasi & Sasaran Bergabung di NCD (Pilih yang relevan)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        {
                          id: 'Mencari partner belajar / riset',
                          desc: 'Menemukan teman diskusi, peer review, dan riset bersama',
                        },
                        {
                          id: 'Pengalaman lomba & kompetisi nasional',
                          desc: 'Membentuk tim kompetitif untuk Gemastik, Hackathon, dll.',
                        },
                        {
                          id: 'Membangun koneksi jejaring lintas bidang',
                          desc: 'Terhubung dengan mahasiswa dan praktisi multi-disiplin',
                        },
                        {
                          id: 'Kolaborasi proyek nyata (real-world projects)',
                          desc: 'Mengerjakan software nyata, open source, dan deployment produksi',
                        },
                      ].map((opt) => {
                        const isSelected = onboardingForm.expectations.includes(opt.id)
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => {
                              setOnboardingForm((prev) => ({
                                ...prev,
                                expectations: isSelected
                                  ? prev.expectations.filter((x) => x !== opt.id)
                                  : [...prev.expectations, opt.id],
                              }))
                            }}
                            className={`p-3.5 border text-left transition-all flex items-start space-x-2.5 ${
                              isSelected
                                ? 'border-[#111215] bg-[#111215] text-[#F4F1EB]'
                                : 'border-[#111215]/15 bg-white text-[#111215] hover:border-[#111215]/40'
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-xs border mt-0.5 flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-white bg-white text-[#111215]'
                                  : 'border-[#111215]/30 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <div>
                              <div className="font-semibold text-xs">{opt.id}</div>
                              <div
                                className={`text-[11px] mt-0.5 ${
                                  isSelected ? 'text-[#F4F1EB]/80' : 'text-[#7E8492]'
                                }`}
                              >
                                {opt.desc}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1.5">
                      Catatan Tambahan / Harapan Pribadi
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan harapan spesifik atau proyek impian yang ingin Anda wujudkan bersama NCD..."
                      value={onboardingForm.expectation_note}
                      onChange={(e) => setOnboardingForm((prev) => ({ ...prev, expectation_note: e.target.value }))}
                      className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215] resize-none"
                    />
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(2)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 border border-[#111215]/20 text-[#525660] hover:text-[#111215] text-xs font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Kembali ke Langkah 2</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(4)}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-black transition-colors"
                    >
                      <span>Lanjut ke Langkah 4: Bidang Minat</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Interests and Fields & Final Submission */}
              {onboardingStep === 4 && (
                <div className="space-y-6 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-2">
                      Bidang Minat & Spesialisasi (Pilih yang diminati)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        'Pemrograman / Software Engineering',
                        'Artificial Intelligence & Data',
                        'UI/UX & Digital Product Design',
                        'Bisnis, Startup & Manajemen',
                        'Riset Akademik & Publikasi',
                        'Cybersecurity & Cloud',
                        'Bidang Lainnya',
                      ].map((field) => {
                        const isSelected = onboardingForm.interest_fields.includes(field)
                        return (
                          <button
                            key={field}
                            type="button"
                            onClick={() => {
                              setOnboardingForm((prev) => ({
                                ...prev,
                                interest_fields: isSelected
                                  ? prev.interest_fields.filter((x) => x !== field)
                                  : [...prev.interest_fields, field],
                              }))
                            }}
                            className={`p-3 border text-left transition-all flex items-center space-x-2 ${
                              isSelected
                                ? 'border-[#111215] bg-[#111215] text-[#F4F1EB]'
                                : 'border-[#111215]/15 bg-white text-[#111215] hover:border-[#111215]/40'
                            }`}
                          >
                            <div
                              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-white bg-white text-[#111215]'
                                  : 'border-[#111215]/30 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="font-semibold text-xs truncate">{field}</span>
                          </button>
                        )
                      })}
                    </div>

                    {onboardingForm.interest_fields.includes('Bidang Lainnya') && (
                      <div className="mt-3">
                        <label className="block text-[11px] font-semibold text-[#111215] uppercase tracking-wider mb-1">
                          Tuliskan Bidang Lainnya
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Game Development, Embedded IoT, dll."
                          value={onboardingForm.other_interest}
                          onChange={(e) => setOnboardingForm((prev) => ({ ...prev, other_interest: e.target.value }))}
                          className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-hidden text-[#111215]"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ringkasan Konfirmasi Sebelum Simpan */}
                  <div className="p-4 bg-[#F4F1EB] border border-[#111215]/15 space-y-2">
                    <div className="font-semibold text-xs text-[#111215] flex items-center space-x-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Pemeriksaan Akhir Profil Onboarding</span>
                    </div>
                    <p className="text-[11px] text-[#525660] leading-relaxed">
                      Data Anda akan tersimpan pada sistem keanggotaan NCD dan dapat dipantau oleh dewan pengurus untuk memfasilitasi kebutuhan mentoring dan kolaborasi tim.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#111215]/10 text-[11px]">
                      <div>
                        <span className="text-[#7E8492] block">Jurusan:</span>
                        <span className="font-semibold text-[#111215] truncate block">
                          {onboardingForm.major || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7E8492] block">Angkatan:</span>
                        <span className="font-semibold text-[#111215] truncate block">
                          {onboardingForm.cohort_year}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7E8492] block">Ekspektasi Dipilih:</span>
                        <span className="font-semibold text-[#111215] block">
                          {onboardingForm.expectations.length} tujuan
                        </span>
                      </div>
                      <div>
                        <span className="text-[#7E8492] block">Bidang Minat:</span>
                        <span className="font-semibold text-[#111215] block">
                          {onboardingForm.interest_fields.length} bidang
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="inline-flex items-center space-x-1.5 px-4 py-2 border border-[#111215]/20 text-[#525660] hover:text-[#111215] text-xs font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Kembali ke Langkah 3</span>
                    </button>
                    <button
                      type="button"
                      disabled={submitOnboardingMutation.isPending}
                      onClick={() => {
                        submitOnboardingMutation.mutate(onboardingForm)
                      }}
                      className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#111215] text-[#F4F1EB] text-xs font-bold tracking-wide hover:bg-black transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        {submitOnboardingMutation.isPending
                          ? 'Menyimpan Profil...'
                          : 'Simpan & Selesaikan Onboarding'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* TAMPILAN PROFIL RESMI MEMBER SETELAH ONBOARDING SELESAI */
            <>
              <div className="bg-white border border-[#111215]/15 p-5 sm:p-7 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#111215]/8">
                  <div className="flex items-start space-x-3.5">
                    <div className="w-12 h-12 bg-emerald-700 text-[#F4F1EB] flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-black/10">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap">
                        <h2 className="text-lg font-bold tracking-tight text-[#111215]">
                          Profil Anggota Komunitas Terverifikasi
                        </h2>
                        <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Onboarding Selesai
                        </span>
                      </div>
                      <p className="text-xs text-[#525660] mt-1 leading-relaxed">
                        Selamat datang, <strong className="text-[#111215]">{currentUser.name}</strong>! Profil Anda telah tercatat secara resmi. Anda dapat memperbarui informasi kapan saja.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingOnboarding(true)
                      setOnboardingStep(1)
                    }}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 border border-[#111215]/20 bg-[#F4F1EB] hover:bg-white text-[#111215] text-xs font-semibold transition-all shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Perbarui Data Onboarding</span>
                  </button>
                </div>

                {/* 4 Cards Grid of Member Responses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 text-xs">
                  {/* 1. Detail Pribadi & Studi */}
                  <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-2">
                      <User className="w-4 h-4 text-[#111215]" />
                      <span>1. Detail Pribadi & Studi</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-[#7E8492] block">Program Studi:</span>
                        <span className="font-semibold text-[#111215]">{memberProfile?.major || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[#7E8492] block">Angkatan:</span>
                        <span className="font-semibold text-[#111215]">{memberProfile?.cohort_year || '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#7E8492] block">Asal Kampus / Domisili:</span>
                        <span className="font-semibold text-[#111215]">{memberProfile?.campus_domicile || '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#7E8492] block">Minat Dasar:</span>
                        <span className="font-medium text-[#111215]">{memberProfile?.interests || '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[#7E8492] block">Target Keterampilan:</span>
                        <span className="font-medium text-[#111215]">{memberProfile?.target_skills || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Perkenalan Diri */}
                  <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-2">
                      <Sparkles className="w-4 h-4 text-[#111215]" />
                      <span>2. Perkenalan Diri</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <span className="text-[#7E8492] block">Hobi & Aktivitas:</span>
                        <span className="font-medium text-[#111215]">{memberProfile?.hobbies || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[#7E8492] block">Fokus / Ketertarikan Spesifik:</span>
                        <span className="font-medium text-[#111215]">{memberProfile?.specific_focus || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[#7E8492] block">Topik yang Ingin Dipelajari di NCD:</span>
                        <span className="font-medium text-[#111215]">{memberProfile?.topics_to_learn || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Ekspektasi Bergabung di NCD */}
                  <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-2">
                      <Target className="w-4 h-4 text-[#111215]" />
                      <span>3. Ekspektasi Bergabung di NCD</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex flex-wrap gap-1.5">
                        {memberProfile?.expectations && memberProfile.expectations.length > 0 ? (
                          memberProfile.expectations.map((exp) => (
                            <span
                              key={exp}
                              className="px-2 py-0.5 bg-white border border-[#111215]/20 font-semibold text-[#111215]"
                            >
                              ✓ {exp}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#7E8492] italic">Belum ada ekspektasi dipilih</span>
                        )}
                      </div>
                      {memberProfile?.expectation_note && (
                        <div className="mt-2 pt-2 border-t border-[#111215]/8">
                          <span className="text-[#7E8492] block">Catatan Tambahan:</span>
                          <p className="font-medium text-[#111215] italic">"{memberProfile.expectation_note}"</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Bidang Minat & Spesialisasi */}
                  <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-2">
                      <Compass className="w-4 h-4 text-[#111215]" />
                      <span>4. Bidang Minat & Spesialisasi</span>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div className="flex flex-wrap gap-1.5">
                        {memberProfile?.interest_fields && memberProfile.interest_fields.length > 0 ? (
                          memberProfile.interest_fields.map((fld) => (
                            <span
                              key={fld}
                              className="px-2 py-0.5 bg-[#111215] text-[#F4F1EB] font-semibold"
                            >
                              {fld}
                            </span>
                          ))
                        ) : (
                          <span className="text-[#7E8492] italic">Belum ada bidang dipilih</span>
                        )}
                      </div>
                      {memberProfile?.other_interest && (
                        <div className="mt-2 pt-2 border-t border-[#111215]/8">
                          <span className="text-[#7E8492] block">Bidang Lainnya:</span>
                          <span className="font-semibold text-[#111215]">{memberProfile.other_interest}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Panduan Adaptasi & Langkah Awal Anggota NCD */}
              <div className="bg-white border border-[#111215]/15 p-5 sm:p-7 shadow-2xs">
                <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-[#111215]/8">
                  <BookOpen className="w-4 h-4 text-[#111215]" />
                  <h3 className="text-base font-bold text-[#111215]">
                    Panduan Adaptasi & Langkah Awal Anggota NCD
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 border border-[#111215]/10 bg-[#F4F1EB]/50">
                    <div className="font-bold text-[#111215] mb-1">1. Komunikasi & Diskusi</div>
                    <p className="text-[#525660] text-[11px] leading-relaxed">
                      Bergabunglah pada channel Discord dan forum diskusi komunitas internal untuk perkenalan dengan sesama anggota.
                    </p>
                  </div>
                  <div className="p-3.5 border border-[#111215]/10 bg-[#F4F1EB]/50">
                    <div className="font-bold text-[#111215] mb-1">2. Eksplorasi Proyek</div>
                    <p className="text-[#525660] text-[11px] leading-relaxed">
                      Kunjungi tab Proyek & Riset untuk melihat repositori kode aktif dan ajukan kontribusi pertama Anda.
                    </p>
                  </div>
                  <div className="p-3.5 border border-[#111215]/10 bg-[#F4F1EB]/50">
                    <div className="font-bold text-[#111215] mb-1">3. Kompetisi & Sesi Belajar</div>
                    <p className="text-[#525660] text-[11px] leading-relaxed">
                      Ikuti mentoring mingguan dan bergabunglah dengan tim kontingen lomba NCD untuk persiapan kompetisi mendatang.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB: OVERVIEW METRICS */}
      {((isPengurus && activeTab === 'overview') || activeTab === 'finance') && (
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
            ) : isSekretaris ? (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7E8492] font-medium mb-1.5">
                  <span className="truncate pr-1">Arsip Dokumen</span>
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6456EB] shrink-0" />
                </div>
                <div className="text-base sm:text-2xl font-semibold text-[#111215] tracking-tight truncate">
                  {documents.length}{' '}
                  <span className="text-xs font-normal text-[#7E8492]">
                    Berkas
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#111215]/6 text-[10px] sm:text-[11px] text-[#7E8492] truncate">
                  Notulensi & dokumen resmi
                </div>
              </div>
            ) : isBendahara ? (
              <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#7E8492] font-medium mb-1.5">
                  <span className="truncate pr-1">Draft & Antrean Kas</span>
                  <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6456EB] shrink-0" />
                </div>
                <div className="text-base sm:text-2xl font-semibold text-[#111215] tracking-tight truncate">
                  {pendingTransactions.length}{' '}
                  <span className="text-xs font-normal text-[#7E8492]">
                    Draft Menunggu
                  </span>
                </div>
                <div className="mt-2 pt-2 border-t border-[#111215]/6 text-[10px] sm:text-[11px] text-[#7E8492] truncate">
                  {voidTransactions.length > 0 ? (
                    <span className="text-rose-700 font-semibold">{voidTransactions.length} Ditolak (Perlu Revisi)</span>
                  ) : (
                    'Semua mutasi terpantau'
                  )}
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

              {/* Status Filter: Brutalist Spring Segmented */}
              <div
                role="group"
                aria-label="Filter Persetujuan Lomba"
                className="relative flex items-center bg-[#F4F1EB] border border-[#111215]/20 p-0.5 w-full sm:w-auto overflow-hidden select-none"
              >
                {[
                  { value: 'PENDING' as const, label: `Menunggu (${pendingCompetitionCount})` },
                  { value: 'ALL' as const, label: 'Semua' },
                  { value: 'VERIFIED' as const, label: 'Disetujui' },
                  { value: 'VOID' as const, label: 'Ditolak' },
                ].map((item) => {
                  const isActive = approvalFilter === item.value
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setApprovalFilter(item.value)}
                      className={`relative flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-[#111215] ${
                        isActive ? 'text-[#F4F1EB]' : 'text-[#525660] hover:text-[#111215]'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="approvalFilterThumb"
                          className="absolute inset-0 bg-[#111215] z-0"
                          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                    </button>
                  )
                })}
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

      {/* TAB: REKRUTMEN & VOTING CALON ANGGOTA (SEMUA PENGURUS KECUALI MEMBER) */}
      {isPengurus && activeTab === 'recruitment' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white border border-[#111215]/15 p-5 sm:p-7 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-5 h-5 text-[#111215]" />
                  <h2 className="text-lg font-bold tracking-tight text-[#111215]">
                    Musyawarah Seleksi & Voting Calon Anggota
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1 leading-relaxed">
                  Semua pengurus berhak memberikan voting (ACC / Tidak ACC) dan menuliskan catatan diskusi musyawarah.
                  Keputusan akhir penerimaan tetap menjadi wewenang mutlak SUPERADMIN.
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'ALL', label: `Semua (${applicationsList.length})` },
                  { key: 'NEW', label: `Menunggu (${applicationsList.filter((a) => a.status === 'NEW').length})` },
                  { key: 'ACCEPTED', label: `Diterima (${applicationsList.filter((a) => a.status === 'ACCEPTED').length})` },
                  { key: 'REJECTED', label: `Ditolak (${applicationsList.filter((a) => a.status === 'REJECTED').length})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setSelectedAppFilter(f.key as any)}
                    className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-all border ${
                      selectedAppFilter === f.key
                        ? 'bg-[#111215] text-[#F4F1EB] border-[#111215]'
                        : 'bg-[#F4F1EB] text-[#525660] border-[#111215]/10 hover:border-[#111215]/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Applications */}
            {isLoadingApps ? (
              <div className="space-y-4 py-8">
                <DashboardRowSkeleton />
                <DashboardRowSkeleton />
              </div>
            ) : applicationsList.length === 0 ? (
              <div className="text-center py-12 text-[#525660]">
                <UserCheck className="w-10 h-10 mx-auto text-[#7E8492] mb-3 opacity-40" />
                <p className="text-sm font-semibold">Belum ada pendaftar baru</p>
                <p className="text-xs text-[#7E8492] mt-1">
                  Pendaftaran yang masuk melalui rute /join akan tampil di sini.
                </p>
              </div>
            ) : Object.keys(groupedApplications).length === 0 ? (
              <div className="text-center py-12 text-[#525660]">
                <p className="text-sm font-semibold">Tidak ada pendaftar untuk filter ini</p>
                <p className="text-xs text-[#7E8492] mt-1">
                  Silakan pilih filter status pendaftaran lainnya di atas.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(groupedApplications).map(([dateLabel, appsInGroup]) => (
                  <div key={dateLabel} className="space-y-4">
                    {/* Date Header Separator */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-[#111215] text-[#F4F1EB] px-3 py-1 font-mono text-xs font-semibold tracking-wide">
                        <Clock className="w-3.5 h-3.5 text-[#F4F1EB]/70" />
                        <span>{dateLabel}</span>
                      </div>
                      <span className="text-[11px] font-mono text-[#7E8492]">
                        {appsInGroup.length} Berkas
                      </span>
                      <div className="grow h-px bg-[#111215]/15" />
                      {isSuperAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            const sampleDate = appsInGroup[0]?.created_at
                              ? new Date(appsInGroup[0].created_at).toISOString().slice(0, 10)
                              : ''
                            setDeleteModal({
                              type: 'date',
                              dateLabel,
                              dateKey: sampleDate,
                              count: appsInGroup.length,
                              ids: appsInGroup.map((a) => a.id),
                            })
                          }}
                          className="px-2.5 py-1 text-[11px] font-mono font-semibold text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-700 border border-rose-200 hover:border-rose-700 transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                          title={`Hapus semua berkas tanggal ${dateLabel}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus Tanggal Ini</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {appsInGroup.map((app) => {
                        const myVote = app.votes?.find((v) => v.user_id === currentUser.id)
                        const accVotes = app.votes?.filter((v) => v.decision === 'ACC') || []
                        const rejectVotes = app.votes?.filter((v) => v.decision === 'TIDAK_ACC') || []
                        const feedback = appFeedback[app.id]

                        return (
                          <div
                            key={app.id}
                            className="border border-[#111215]/20 bg-white p-5 sm:p-6 shadow-xs transition-all hover:border-[#111215]/40"
                          >
                            {/* Header & Status Row */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-4 border-b border-[#111215]/10">
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h3 className="text-base sm:text-lg font-bold text-[#111215]">
                                    {app.full_name}
                                  </h3>
                                  <span
                                    className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                      app.status === 'ACCEPTED'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : app.status === 'REJECTED'
                                        ? 'bg-rose-50 text-rose-800 border-rose-300'
                                        : 'bg-amber-50 text-amber-900 border-amber-300'
                                    }`}
                                  >
                                    {app.status === 'ACCEPTED'
                                      ? 'DITERIMA'
                                      : app.status === 'REJECTED'
                                      ? 'DITOLAK'
                                      : 'MENUNGGU VOTING'}
                                  </span>

                                  {/* Sekretaris Verification Badge */}
                                  {app.verification_status && (
                                    <span
                                      className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border ${
                                        app.verification_status === 'LENGKAP'
                                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                          : app.verification_status === 'PERLU_REVISI'
                                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                                          : 'bg-rose-100 text-rose-900 border-rose-300'
                                      }`}
                                    >
                                      {app.verification_status === 'LENGKAP'
                                        ? '✓ Berkas Lengkap'
                                        : app.verification_status === 'PERLU_REVISI'
                                        ? '⚠ Perlu Revisi'
                                        : '✕ Tidak Lengkap'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#525660] mt-1">
                                  {app.major} • Angkatan <strong className="text-[#111215]">{app.generation}</strong> • Kampus <strong className="text-[#111215]">{app.campus_domicile}</strong>
                                </p>
                              </div>

                              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                                <span className="text-[11px] font-mono text-[#7E8492]">
                                  Pukul {new Date(app.created_at).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })} WIB
                                </span>
                                {canVerifyApplications && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setVerifyModal({
                                        app,
                                        status: (app.verification_status as any) || 'LENGKAP',
                                        note: app.verification_note || '',
                                      })
                                    }
                                    className="px-2.5 py-1 text-[11px] font-semibold border border-[#111215]/20 bg-white hover:bg-[#111215] hover:text-[#F4F1EB] transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Verifikasi Kelengkapan Berkas Pendaftaran"
                                  >
                                    <CheckSquare className="w-3.5 h-3.5 text-[#6456EB]" />
                                    <span>{app.verification_status ? 'Perbarui Verifikasi' : 'Verifikasi Berkas'}</span>
                                  </button>
                                )}
                                {isSuperAdmin && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setDeleteModal({
                                        type: 'single',
                                        id: app.id,
                                        name: app.full_name,
                                      })
                                    }
                                    className="p-1 text-[#7E8492] hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                    title={`Hapus berkas ${app.full_name}`}
                                    aria-label={`Hapus berkas ${app.full_name}`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>

                        {/* Structured Two-Column Overview */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 py-4 border-b border-[#111215]/10">
                          {/* Col 1: Contact & Logistics Details */}
                          <div className="lg:col-span-5 bg-[#F4F1EB]/40 border border-[#111215]/10 p-3.5 space-y-3 text-xs">
                            <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#7E8492] pb-1 border-b border-[#111215]/8">
                              Data Kontak & Asal Kampus
                            </span>

                            <div>
                              <span className="block text-[10px] uppercase font-mono tracking-wider text-[#7E8492]">
                                Email
                              </span>
                              <a
                                href={`mailto:${app.email}`}
                                className="font-mono text-xs font-semibold text-[#111215] hover:text-[#6456EB] break-all block selection:bg-[#6456EB]/20 mt-0.5"
                              >
                                {app.email}
                              </a>
                            </div>

                            <div>
                              <span className="block text-[10px] uppercase font-mono tracking-wider text-[#7E8492]">
                                WhatsApp
                              </span>
                              <a
                                href={`https://wa.me/${app.phone_whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 font-semibold text-[#111215] hover:text-[#107C41] transition-colors mt-0.5"
                              >
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                                {app.phone_whatsapp}
                              </a>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#111215]/8">
                              <div>
                                <span className="block text-[10px] uppercase font-mono tracking-wider text-[#7E8492]">
                                  Domisili Kampus
                                </span>
                                <span className="font-semibold text-[#111215] mt-0.5 block">{app.campus_domicile}</span>
                              </div>
                              <div>
                                <span className="block text-[10px] uppercase font-mono tracking-wider text-[#7E8492]">
                                  Tahu NCD Dari
                                </span>
                                <span className="font-semibold text-[#111215] mt-0.5 block">{app.referral_source || '-'}</span>
                              </div>
                            </div>

                            {app.portfolio_links && (
                              <div className="pt-2 border-t border-[#111215]/8">
                                <span className="block text-[10px] uppercase font-mono tracking-wider text-[#7E8492] mb-1">
                                  Portofolio / Tautan
                                </span>
                                <a
                                  href={app.portfolio_links.startsWith('http') ? app.portfolio_links : `https://${app.portfolio_links}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#6456EB] hover:underline break-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                  <span>{app.portfolio_links}</span>
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Col 2: Skills & Motivation */}
                          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5 p-3.5 bg-white border border-[#111215]/10">
                            <div>
                              <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-2">
                                Minat Divisi & Keahlian Teknis
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {app.skills_interest ? (
                                  app.skills_interest
                                    .split(/[,;\n]+/)
                                    .map((s) => s.trim())
                                    .filter(Boolean)
                                    .map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2.5 py-1 text-xs font-mono font-medium bg-[#111215]/5 border border-[#111215]/15 text-[#111215]"
                                      >
                                        {skill}
                                      </span>
                                    ))
                                ) : (
                                  <span className="text-xs text-[#7E8492] italic">-</span>
                                )}
                              </div>
                            </div>

                            <div className="grow flex flex-col justify-end pt-3 border-t border-[#111215]/8">
                              <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-1.5">
                                Motivasi Bergabung
                              </span>
                              <blockquote className="bg-[#F4F1EB]/40 border-l-2 border-[#111215] p-3 text-xs text-[#111215]/90 italic leading-relaxed">
                                "{app.motivation}"
                              </blockquote>
                            </div>
                          </div>
                        </div>

                        {/* Status Verifikasi Administrasi (Sekretariat) */}
                        {app.verification_status ? (
                          <div
                            className={`p-3.5 border my-3.5 text-xs ${
                              app.verification_status === 'LENGKAP'
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                                : app.verification_status === 'PERLU_REVISI'
                                ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                                : 'bg-rose-50/70 border-rose-300 text-rose-950'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-current/15">
                              <div className="flex items-center gap-2">
                                <CheckSquare className="w-4 h-4 shrink-0" />
                                <span className="font-bold tracking-tight">
                                  Verifikasi Berkas Administrasi:{' '}
                                  {app.verification_status === 'LENGKAP'
                                    ? 'Lengkap & Memenuhi Syarat'
                                    : app.verification_status === 'PERLU_REVISI'
                                    ? 'Perlu Revisi / Tambahan Berkas'
                                    : 'Tidak Lengkap / Gugur Administrasi'}
                                </span>
                              </div>
                              <div className="text-[10px] font-mono opacity-80">
                                Verifikator: <strong>{app.verified_by || 'Sekretaris'}</strong>
                                {app.verified_at &&
                                  ` • ${new Date(app.verified_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}`}
                              </div>
                            </div>
                            {app.verification_note && (
                              <p className="mt-2 text-[11px] leading-relaxed italic opacity-95">
                                "{app.verification_note}"
                              </p>
                            )}
                          </div>
                        ) : (
                          canVerifyApplications && (
                            <div className="p-3 my-3 bg-[#F4F1EB]/60 border border-dashed border-[#111215]/20 flex items-center justify-between gap-2 text-xs">
                              <span className="text-[#525660] text-[11px]">
                                Berkas ini belum diverifikasi oleh Sekretariat.
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setVerifyModal({
                                    app,
                                    status: 'LENGKAP',
                                    note: '',
                                  })
                                }
                                className="px-2.5 py-1 text-[11px] font-bold text-[#111215] bg-white border border-[#111215]/30 hover:border-[#111215] transition-colors cursor-pointer"
                              >
                                Verifikasi Sekarang
                              </button>
                            </div>
                          )
                        )}

                        {/* Voting Tally & Discussion History */}
                        <div className="mt-4 pt-3.5 border-t border-[#111215]/10">
                          {isSuperAdmin ? (
                            <>
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#111215]/10">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#111215]">
                                    Hasil Voting:
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <ThumbsUp className="w-3 h-3" /> {accVotes.length} ACC
                                  </span>
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200">
                                    <ThumbsDown className="w-3 h-3" /> {rejectVotes.length} Tidak ACC
                                  </span>
                                </div>

                                {myVote && (
                                  <span className="text-[11px] text-[#525660] font-mono shrink-0">
                                    Suara Anda:{' '}
                                    <strong className={myVote.decision === 'ACC' ? 'text-emerald-700' : 'text-rose-700'}>
                                      {myVote.decision === 'ACC' ? 'ACC' : 'Tidak ACC'}
                                    </strong>
                                  </span>
                                )}
                              </div>

                              {/* Existing Discussions / Votes List (Hanya Terlihat Oleh Super Admin) */}
                              {app.votes && app.votes.length > 0 ? (
                                <div className="divide-y divide-[#111215]/8 my-2">
                                  {app.votes.map((v) => (
                                    <div key={v.id || v.user_id} className="py-2 first:pt-1 last:pb-1 text-xs">
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="font-bold text-[#111215] truncate">{v.user_name}</span>
                                          <span className="text-[9px] font-mono uppercase bg-[#111215]/8 px-1.5 py-0.5 text-[#525660] shrink-0">
                                            {v.user_role}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                          <span
                                            className={`font-semibold text-[11px] px-1.5 py-0.5 border ${
                                              v.decision === 'ACC'
                                                ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                                                : 'text-rose-800 bg-rose-50 border-rose-200'
                                            }`}
                                          >
                                            {v.decision === 'ACC' ? '✓ ACC' : '✕ Tidak ACC'}
                                          </span>
                                          <span className="text-[10px] font-mono text-[#7E8492] hidden sm:inline">
                                            {new Date(v.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                          </span>
                                        </div>
                                      </div>
                                      {v.note && (
                                        <p className="text-[11px] text-[#525660] italic mt-1 pl-2 border-l border-[#111215]/20 leading-relaxed">
                                          "{v.note}"
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-[#7E8492] italic my-2">
                                  Belum ada pengurus yang memberikan voting.
                                </p>
                              )}
                            </>
                          ) : (
                            /* Selain Super Admin: Voting pengurus adalah Rahasia */
                            <div className="p-3 my-2.5 bg-[#F4F1EB]/30 border border-[#111215]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="text-[#525660]">
                                <strong className="text-[#111215]">Musyawarah Rahasia:</strong> Rincian nama & pilihan voting pengurus bersifat rahasia dan hanya dapat diakses oleh <strong>SUPERADMIN</strong>.
                              </div>
                              {myVote && (
                                <span className="text-[11px] font-mono text-[#525660] shrink-0">
                                  Suara Anda:{' '}
                                  <strong className={myVote.decision === 'ACC' ? 'text-emerald-700' : 'text-rose-700'}>
                                    {myVote.decision === 'ACC' ? 'ACC' : 'Tidak ACC'}
                                  </strong>
                                </span>
                              )}
                            </div>
                          )}

                          {/* Voting Input & Buttons for Current Pengurus */}
                          {app.status === 'NEW' ? (
                            <div className="mt-3.5 p-3 bg-white border border-[#111215]/15">
                              <label className="block text-[11px] font-bold text-[#111215] mb-1.5">
                                Musyawarah / Catatan Diskusi Pengurus (Opsional):
                              </label>
                              <input
                                type="text"
                                placeholder="Tulis alasan, catatan wawancara, atau pertimbangan diskusi..."
                                value={votingDiscussion[app.id] ?? (myVote?.note || '')}
                                onChange={(e) =>
                                  setVotingDiscussion({ ...votingDiscussion, [app.id]: e.target.value })
                                }
                                className="w-full px-3 py-2 text-xs rounded-none bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white outline-none transition-all placeholder:text-[#7E8492] mb-2.5"
                              />

                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={voteApplicationMutation.isPending}
                                    onClick={() =>
                                      voteApplicationMutation.mutate({
                                        id: app.id,
                                        decision: 'ACC',
                                        note: votingDiscussion[app.id] ?? myVote?.note ?? '',
                                      })
                                    }
                                    className="px-3.5 py-2 text-xs font-bold bg-[#111215] text-[#F4F1EB] hover:bg-[#252830] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>{myVote?.decision === 'ACC' ? 'Perbarui Vote: ACC' : 'Beri Vote: ACC'}</span>
                                  </button>
                                  <button
                                    type="button"
                                    disabled={voteApplicationMutation.isPending}
                                    onClick={() =>
                                      voteApplicationMutation.mutate({
                                        id: app.id,
                                        decision: 'TIDAK_ACC',
                                        note: votingDiscussion[app.id] ?? myVote?.note ?? '',
                                      })
                                    }
                                    className="px-3.5 py-2 text-xs font-bold bg-transparent text-[#111215] border border-[#111215]/30 hover:border-[#111215] hover:bg-rose-50 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                  >
                                    <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                                    <span>{myVote?.decision === 'TIDAK_ACC' ? 'Perbarui Vote: Tidak ACC' : 'Beri Vote: Tidak ACC'}</span>
                                  </button>
                                </div>

                                {feedback && (
                                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                                    {feedback}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2.5 py-2 px-2.5 bg-[#F4F1EB]/60 border-l-2 border-[#111215]/40 text-[11px] font-mono text-[#525660]">
                              Musyawarah dan voting pengurus telah ditutup karena keputusan akhir telah ditetapkan.
                            </div>
                          )}

                          {/* SUPERADMIN FINAL DECISION SECTION */}
                          {isSuperAdmin ? (
                            app.status === 'ACCEPTED' || app.status === 'REJECTED' ? (
                              /* Status Konkrit & Terkunci */
                              <div className="mt-3.5 p-3.5 bg-[#F4F1EB]/50 border border-[#111215]/20">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#111215]">
                                    Keputusan Akhir Terkunci
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 text-xs font-mono font-bold uppercase tracking-wider border shrink-0 inline-flex items-center ${
                                      app.status === 'ACCEPTED'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                        : 'bg-rose-50 text-rose-800 border-rose-300'
                                    }`}
                                  >
                                    {app.status === 'ACCEPTED' ? 'DITERIMA' : 'DITOLAK'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-[#525660] mt-1.5 leading-relaxed">
                                  Keputusan ditetapkan secara konkrit oleh{' '}
                                  <strong className="text-[#111215]">{app.final_decision_by}</strong>
                                  {app.final_decision_at
                                    ? ` • ${new Date(app.final_decision_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })} WIB`
                                    : ''}
                                  . Berkas ini sudah final dan tidak dapat diubah kembali.
                                </p>
                              </div>
                            ) : (
                              /* Status Masih Baru / Menunggu Keputusan */
                              <div className="mt-4 p-3.5 bg-[#111215]/4 border border-[#111215]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#111215] flex items-center gap-1.5">
                                    Otoritas Keputusan Akhir Super Admin
                                  </span>
                                  <p className="text-[11px] text-[#525660] mt-0.5">
                                    Tentukan keputusan penerimaan akhir setelah meninjau suara pengurus. Perhatian: Keputusan bersifat permanen setelah ditetapkan.
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    disabled={decideApplicationMutation.isPending}
                                    onClick={() => setDecisionModal({ app, action: 'ACCEPTED' })}
                                    className="px-3.5 py-2 text-xs font-bold bg-[#107C41] text-white hover:bg-[#0b5c30] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40"
                                  >
                                    Terima Anggota
                                  </button>
                                  <button
                                    type="button"
                                    disabled={decideApplicationMutation.isPending}
                                    onClick={() => setDecisionModal({ app, action: 'REJECTED' })}
                                    className="px-3.5 py-2 text-xs font-bold bg-[#D83B01] text-white hover:bg-[#b03001] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-40"
                                  >
                                    Tolak Berkas
                                  </button>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="mt-3 text-[11px] text-[#7E8492] font-mono italic">
                              * Wewenang keputusan akhir penerimaan mutlak berada pada SUPERADMIN. Role lain (termasuk God Admin) hanya berhak memberikan voting dan catatan diskusi.
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: MEMBER ONBOARDING TRACKER (KHUSUS PENGURUS) */}
      {isPengurus && activeTab === 'member-onboarding' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white border border-[#111215]/15 p-5 sm:p-7 shadow-2xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-[#111215]" />
                  <h2 className="text-lg font-bold tracking-tight text-[#111215]">
                    Pelacakan Status Onboarding Anggota Komunitas
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1 leading-relaxed">
                  Pantau proses pengisian profil dan masa orientasi member baru NCD secara terstruktur dan terpandu.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportMembersCSV}
                className="px-3.5 py-2 text-xs font-semibold bg-[#111215] text-[#F4F1EB] hover:bg-black transition-colors flex items-center gap-2 self-start sm:self-auto shrink-0 cursor-pointer"
                title="Unduh seluruh data direktori anggota dalam format CSV"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Ekspor Data Anggota (.CSV)</span>
              </button>
            </div>

            {/* Metrics Row (4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="p-3.5 sm:p-4 bg-[#F4F1EB] border border-[#111215]/10">
                <span className="text-[11px] text-[#7E8492] font-semibold block uppercase">Total Member</span>
                <span className="text-xl sm:text-2xl font-bold text-[#111215] mt-1 block">
                  {onboardingTracker?.total_members || 0}
                </span>
                <span className="text-[10px] text-[#525660] mt-0.5 block">Anggota terdaftar</span>
              </div>

              <div className="p-3.5 sm:p-4 bg-emerald-50/70 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block uppercase">Selesai Onboarding</span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-900 mt-1 block">
                  {onboardingTracker?.completed_count || 0}
                </span>
                <span className="text-[10px] text-emerald-700 mt-0.5 block">Profil lengkap</span>
              </div>

              <div className="p-3.5 sm:p-4 bg-amber-50/70 border border-amber-200">
                <span className="text-[11px] text-amber-800 font-semibold block uppercase">Belum Selesai</span>
                <span className="text-xl sm:text-2xl font-bold text-amber-900 mt-1 block">
                  {onboardingTracker?.pending_count || 0}
                </span>
                <span className="text-[10px] text-amber-700 mt-0.5 block">Menunggu pengisian</span>
              </div>

              <div className="p-3.5 sm:p-4 bg-[#F4F1EB] border border-[#111215]/10">
                <span className="text-[11px] text-[#7E8492] font-semibold block uppercase">Tingkat Kelulusan</span>
                <span className="text-xl sm:text-2xl font-bold text-[#111215] mt-1 block">
                  {Math.round(onboardingTracker?.completion_rate || 0)}%
                </span>
                <div className="w-full bg-[#111215]/10 h-1.5 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${onboardingTracker?.completion_rate || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter Toolbar & Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'ALL', label: `Semua (${onboardingTracker?.total_members || 0})` },
                  { key: 'COMPLETED', label: `Selesai (${onboardingTracker?.completed_count || 0})` },
                  { key: 'PENDING', label: `Belum Selesai (${onboardingTracker?.pending_count || 0})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setTrackerStatusFilter(f.key as any)}
                    className={`px-3 py-1.5 text-xs font-semibold tracking-wide transition-all border ${
                      trackerStatusFilter === f.key
                        ? 'bg-[#111215] text-[#F4F1EB] border-[#111215]'
                        : 'bg-[#F4F1EB] text-[#525660] border-[#111215]/10 hover:border-[#111215]/30'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#7E8492] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama, email, kampus..."
                  value={trackerSearchQuery}
                  onChange={(e) => setTrackerSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F4F1EB] border border-[#111215]/15 focus:border-[#111215] focus:outline-hidden text-xs text-[#111215]"
                />
              </div>
            </div>

            {/* List of Members */}
            {isOnboardingTrackerLoading ? (
              <div className="space-y-3 py-8">
                <DashboardRowSkeleton />
                <DashboardRowSkeleton />
              </div>
            ) : !onboardingTracker?.members || onboardingTracker.members.length === 0 ? (
              <div className="text-center py-12 text-[#525660]">
                <Users className="w-10 h-10 mx-auto text-[#7E8492] mb-3 opacity-40" />
                <p className="text-sm font-semibold">Belum ada anggota komunitas terdaftar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {onboardingTracker.members
                  .filter((m) => {
                    if (trackerStatusFilter === 'COMPLETED') return m.is_onboarded
                    if (trackerStatusFilter === 'PENDING') return !m.is_onboarded
                    return true
                  })
                  .filter((m) => {
                    if (!trackerSearchQuery.trim()) return true
                    const q = trackerSearchQuery.toLowerCase()
                    return (
                      m.full_name.toLowerCase().includes(q) ||
                      m.email.toLowerCase().includes(q) ||
                      (m.profile?.major && m.profile.major.toLowerCase().includes(q)) ||
                      (m.profile?.campus_domicile && m.profile.campus_domicile.toLowerCase().includes(q))
                    )
                  })
                  .map((member) => (
                    <div
                      key={member.user_id}
                      className="p-4 border border-[#111215]/15 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#111215]/40 transition-colors"
                    >
                      <div className="flex items-start space-x-3 min-w-0">
                        <div className="w-10 h-10 bg-[#111215] text-[#F4F1EB] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {member.full_name
                            .split(' ')
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((n) => n[0].toUpperCase())
                            .join('') || 'MB'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap">
                            <h4 className="font-bold text-sm text-[#111215] truncate">
                              {member.full_name}
                            </h4>
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase border shrink-0 ${
                                member.is_onboarded
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                  : 'bg-amber-50 text-amber-900 border-amber-300'
                              }`}
                            >
                              {member.is_onboarded ? 'Selesai' : 'Belum Selesai'}
                            </span>
                          </div>

                          <div className="text-xs text-[#525660] flex items-center space-x-2 mt-0.5 flex-wrap">
                            <span>{member.email}</span>
                            {member.token_key && (
                              <code className="text-[10px] font-mono bg-[#F4F1EB] px-1.5 py-0.2 border border-[#111215]/10">
                                {member.token_key}
                              </code>
                            )}
                          </div>

                          {member.profile?.major && (
                            <div className="mt-1.5 flex items-center space-x-2 text-[11px] text-[#7E8492] flex-wrap">
                              <span>{member.profile.major}</span>
                              {member.profile.cohort_year && <span>• Angkatan {member.profile.cohort_year}</span>}
                              {member.profile.campus_domicile && <span>• {member.profile.campus_domicile}</span>}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                        {member.is_onboarded ? (
                          <button
                            type="button"
                            onClick={() => setSelectedTrackerMember(member)}
                            className="px-3.5 py-2 bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-black transition-colors"
                          >
                            Lihat Isian Onboarding
                          </button>
                        ) : (
                          <span className="text-xs text-[#7E8492] italic px-2">
                            Menunggu pengisian
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
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
                    Prestasi / Peringkat <span className="text-rose-600">*</span>
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
                    Tahun / Periode
                  </label>
                  <input
                    type="text"
                    value={achAwardDate}
                    onChange={(e) => setAchAwardDate(e.target.value)}
                    placeholder="e.g. 2024"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Peraih / Tim Delegasi
                  </label>
                  <input
                    type="text"
                    value={achTeamName}
                    onChange={(e) => setAchTeamName(e.target.value)}
                    placeholder="e.g. NCD Alpha Core (Mirza, Rianszzz, Rafly)"
                    className="w-full p-2.5 bg-white border border-[#111215]/15 rounded-none text-xs text-[#111215] focus:outline-none focus:border-[#6456EB]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-[#525660] mb-1">
                    Deskripsi Ringkas (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={achDescription}
                    onChange={(e) => setAchDescription(e.target.value)}
                    placeholder="Penjelasan ringkas prestasi atau inovasi yang dikembangkan..."
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
                          {item.rank && item.rank !== item.title && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#111215]/6 text-[#111215] rounded-none">
                              {item.rank}
                            </span>
                          )}
                          <span className="text-[11px] text-[#525660]">
                            {item.award_date || item.date}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#111215]">{item.title}</h4>
                        <p className="text-xs text-[#525660]">
                          {item.event_name || item.competition}
                          {item.team_name ? ` · ${item.team_name}` : ''}
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

      {/* TAB: KELOLA WARTA & BERITA (GOD ADMIN, SUPER ADMIN, & SEKRETARIS) */}
      {canManageNews && activeTab === 'news' && (
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
                  Otoritas publikasi GOD-ADMIN, SUPER ADMIN, & SEKRETARIS untuk menerbitkan atau menghapus artikel pada rute publik /news.
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

      {/* TAB: NOTULENSI & DOKUMEN RESMI ORGANISASI (SEKRETARIS, SUPER ADMIN, GOD ADMIN) */}
      {canManageDocs && activeTab === 'documents' && (
        <div className="space-y-6 mb-8">
          <div className="bg-white border border-[#111215]/15 p-5 sm:p-7 shadow-2xs">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[#111215]" />
                  <h2 className="text-lg font-bold tracking-tight text-[#111215]">
                    Notulensi Rapat & Dokumen Resmi Organisasi
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1">
                  Arsip terpusat notulensi rapat pleno/divisi, standar operasional prosedur (SOP), surat keputusan, dan pedoman resmi NCD.
                </p>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3.5 bg-[#F4F1EB] border border-[#111215]/10">
                <span className="text-[11px] text-[#7E8492] font-semibold block uppercase">Total Dokumen</span>
                <span className="text-xl font-bold text-[#111215] mt-1 block">
                  {documents.length}
                </span>
                <span className="text-[10px] text-[#525660] mt-0.5 block">Dokumen & arsip aktif</span>
              </div>
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200">
                <span className="text-[11px] text-indigo-800 font-semibold block uppercase">Notulensi Rapat</span>
                <span className="text-xl font-bold text-indigo-950 mt-1 block">
                  {documents.filter((d) => d.category === 'NOTULENSI').length}
                </span>
                <span className="text-[10px] text-indigo-700 mt-0.5 block">Risalah pertemuan resmi</span>
              </div>
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 col-span-2 sm:col-span-1">
                <span className="text-[11px] text-emerald-800 font-semibold block uppercase">SOP & Ketetapan</span>
                <span className="text-xl font-bold text-emerald-950 mt-1 block">
                  {documents.filter((d) => d.category !== 'NOTULENSI').length}
                </span>
                <span className="text-[10px] text-emerald-700 mt-0.5 block">Kebijakan & SK legal</span>
              </div>
            </div>

            {/* Form: Tambah Dokumen / Notulensi Baru */}
            <form onSubmit={handleCreateDocument} className="p-4 sm:p-5 bg-[#F4F1EB]/50 border border-[#111215]/15 mb-6 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#111215]/10">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111215] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#6456EB]" />
                  <span>Arsipkan Dokumen / Notulensi Rapat Baru</span>
                </span>
                <span className="text-[10px] font-mono text-[#7E8492]">Sekretariat NCD</span>
              </div>

              {docSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs">
                  {docSuccess}
                </div>
              )}
              {docError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-900 text-xs">
                  {docError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                <div className="sm:col-span-6">
                  <label className="block text-[11px] font-bold text-[#111215] mb-1">
                    Judul Dokumen / Rapat *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Notulensi Rapat Pleno I Rekrutmen 2026"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-[#111215] mb-1">
                    Kategori Dokumen *
                  </label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] outline-none"
                  >
                    <option value="NOTULENSI">Notulensi Rapat</option>
                    <option value="SOP">SOP & Kebijakan</option>
                    <option value="SURAT_KEPUTUSAN">Surat Keputusan (SK)</option>
                    <option value="PANDUAN">Buku Panduan</option>
                    <option value="ARSIP">Arsip Umum</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-[#111215] mb-1">
                    Tanggal Terbit / Rapat *
                  </label>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] outline-none"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-bold text-[#111215] mb-1">
                    Ringkasan Singkat / Hasil Keputusan Pokok
                  </label>
                  <input
                    type="text"
                    placeholder="Rangkuman 1-2 kalimat mengenai agenda atau ketetapan utama..."
                    value={docSummary}
                    onChange={(e) => setDocSummary(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] outline-none"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-bold text-[#111215] mb-1">
                    Tautan Berkas Cloud / Drive / PDF (Opsional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={docFileLink}
                    onChange={(e) => setDocFileLink(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] outline-none font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-12">
                  <label className="block text-[11px] font-bold text-[#111215] mb-1">
                    Catatan Notulensi / Isi Lengkap Dokumen
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Tuliskan butir-butir pembahasan rapat, peserta hadir, daftar keputusan, atau teks SOP..."
                    value={docContent}
                    onChange={(e) => setDocContent(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#111215]/20 focus:border-[#111215] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={createDocMutation.isPending}
                  className="px-4 py-2 bg-[#111215] text-[#F4F1EB] text-xs font-bold hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {createDocMutation.isPending ? 'Menyimpan...' : 'Simpan & Arsipkan Dokumen'}
                </button>
              </div>
            </form>

            {/* Filter & List Dokumen */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                  Daftar Arsip & Notulensi ({documents.length})
                </span>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { key: 'ALL', label: 'Semua' },
                    { key: 'NOTULENSI', label: 'Notulensi' },
                    { key: 'SOP', label: 'SOP' },
                    { key: 'SURAT_KEPUTUSAN', label: 'SK' },
                    { key: 'PANDUAN', label: 'Panduan' },
                    { key: 'ARSIP', label: 'Arsip Lain' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setDocCategoryFilter(f.key)}
                      className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                        docCategoryFilter === f.key
                          ? 'bg-[#111215] text-[#F4F1EB] border-[#111215]'
                          : 'bg-white text-[#525660] border-[#111215]/15 hover:border-[#111215]/40'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {loadingDocuments ? (
                <div className="p-8 text-center text-xs text-[#7E8492]">
                  Memuat arsip dokumen...
                </div>
              ) : documents.filter((d) => docCategoryFilter === 'ALL' || d.category === docCategoryFilter).length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7E8492] border border-dashed border-[#111215]/20 bg-[#F4F1EB]/30">
                  Belum ada dokumen yang diarsipkan dalam kategori ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {documents
                    .filter((d) => docCategoryFilter === 'ALL' || d.category === docCategoryFilter)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-white border border-[#111215]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#111215]/30 transition-colors"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 border ${
                                item.category === 'NOTULENSI'
                                  ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                  : item.category === 'SOP'
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : item.category === 'SURAT_KEPUTUSAN'
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-300'
                              }`}
                            >
                              {item.category}
                            </span>
                            <span className="text-[11px] font-mono text-[#7E8492]">
                              {new Date(item.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                            <span className="text-[11px] text-[#525660]">
                              • Oleh: <strong className="text-[#111215]">{item.author}</strong>
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-[#111215]">{item.title}</h4>

                          {item.summary && (
                            <p className="text-xs text-[#525660] line-clamp-2 leading-relaxed">
                              {item.summary}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => setSelectedDocView(item)}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#111215] text-[#F4F1EB] hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Baca Dokumen</span>
                          </button>

                          {item.file_link && (
                            <a
                              href={item.file_link}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 text-[#525660] hover:text-[#111215] border border-[#111215]/20 hover:border-[#111215] transition-colors"
                              title="Buka Tautan Lampiran Eksternal"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Hapus dokumen "${item.title}"?`)) {
                                deleteDocMutation.mutate(item.id)
                              }
                            }}
                            disabled={deleteDocMutation.isPending}
                            className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                            title="Hapus dokumen"
                          >
                            <Trash2 className="w-4 h-4" />
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
      {(activeTab === 'finance' || (isPengurus && activeTab === 'overview')) && (
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
                  {isBendahara
                    ? 'Pencatatan kas masuk & keluar, unggah bukti nota fisik, serta pantau verifikasi dan alasan penolakan draft kas.'
                    : isChairman
                    ? 'Hak pengawasan penuh (See-All): Chairman memiliki akses transparansi terhadap seluruh mutasi kas, saldo riil, dan lampiran nota fisik.'
                    : 'Akses audit penuh untuk melihat seluruh catatan debet, kredit, dan foto nota fisik.'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {canManageCash && (
                  <button
                    type="button"
                    onClick={openCreateTransaction}
                    className="px-3.5 py-1.5 text-xs font-bold bg-[#111215] text-[#F4F1EB] hover:bg-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-emerald-400" />
                    <span>Catat Mutasi Kas</span>
                  </button>
                )}

                {/* Filter: Brutalist Spring Segmented (Tipe Aliran) */}
                <div
                  role="group"
                  aria-label="Filter Aliran Kas"
                  className="relative flex items-center bg-[#F4F1EB] border border-[#111215]/20 p-0.5 overflow-hidden select-none"
                >
                  {[
                    { value: 'ALL' as const, label: 'Semua' },
                    { value: 'INCOME' as const, label: 'Pemasukan' },
                    { value: 'EXPENSE' as const, label: 'Pengeluaran' },
                  ].map((item) => {
                    const isActive = txFilter === item.value
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setTxFilter(item.value)}
                        className={`relative flex-1 sm:flex-initial px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-[#111215] ${
                          isActive ? 'text-[#F4F1EB]' : 'text-[#525660] hover:text-[#111215]'
                        }`}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="txFilterThumb"
                            className="absolute inset-0 bg-[#111215] z-0"
                            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                          />
                        )}
                        <span className="relative z-10">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ALERT BANNER: DAFTAR TRANSAKSI DITOLAK / PERLU REVISI */}
            {voidTransactions.length > 0 && (
              <div className="mb-6 p-4 sm:p-5 bg-rose-50 border border-rose-300 text-rose-950 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-rose-200">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                    <span className="font-bold text-xs sm:text-sm">
                      Perhatian Bendahara: Terdapat {voidTransactions.length} Transaksi Ditolak (Perlu Revisi)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-rose-200 text-rose-900">
                    Perlu Tindakan
                  </span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  Pemeriksa (Checker/Chairman) menolak draft transaksi berikut. Silakan baca alasan penolakan, perbaiki data atau nota terkait, lalu ajukan ulang.
                </p>

                <div className="space-y-2 mt-2">
                  {voidTransactions.map((vTx) => (
                    <div
                      key={vTx.id}
                      className="p-3 bg-white border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[#111215]">
                            {vTx.transaction_number}
                          </span>
                          <span className="text-[11px] text-[#7E8492]">
                            {vTx.transaction_date} • {vTx.category_name}
                          </span>
                          <span className="font-mono font-semibold text-rose-700">
                            {formatRupiah(vTx.amount)}
                          </span>
                        </div>
                        <p className="text-xs text-[#525660] font-medium truncate">
                          "{vTx.description}"
                        </p>
                        {vTx.void_reason && (
                          <div className="p-2 bg-rose-50/80 border-l-2 border-rose-600 text-[11px] text-rose-900 leading-relaxed">
                            <strong>Alasan Penolakan:</strong> {vTx.void_reason}{' '}
                            {vTx.void_by_name && (
                              <span className="opacity-75 font-mono text-[10px]">({vTx.void_by_name})</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => setActiveReceipt(vTx)}
                          className="px-2.5 py-1.5 text-xs bg-[#F4F1EB] hover:bg-[#111215] hover:text-[#F4F1EB] border border-[#111215]/20 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Nota</span>
                        </button>
                        {canManageCash && (
                          <button
                            type="button"
                            onClick={() => openEditTransaction(vTx)}
                            className="px-3 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Perbaiki & Ajukan Ulang</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#111215]">
                Daftar Mutasi Kas ({filteredTransactions.length})
              </span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { key: 'ALL', label: `Semua (${transactions.length})` },
                  { key: 'VERIFIED', label: `Sah (${verifiedTransactions.length})` },
                  { key: 'DRAFT_PENDING', label: `Menunggu (${pendingTransactions.length})` },
                  { key: 'VOID', label: `Ditolak (${voidTransactions.length})` },
                ].map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setTxStatusFilter(f.key as any)}
                    className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                      txStatusFilter === f.key
                        ? 'bg-[#111215] text-[#F4F1EB] border-[#111215]'
                        : 'bg-[#F4F1EB] text-[#525660] border-[#111215]/15 hover:border-[#111215]/40'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Transaction Ledger Table */}
            <div className="border border-[#111215]/8 rounded-xl overflow-hidden">
              <div className="hidden sm:grid grid-cols-12 bg-[#F4F1EB] px-4 py-2.5 text-[11px] font-semibold text-[#525660] border-b border-[#111215]/8">
                <div className="col-span-3">NO. TRANSAKSI & TANGGAL</div>
                <div className="col-span-3">DESKRIPSI & KATEGORI</div>
                <div className="col-span-2">NOMINAL</div>
                <div className="col-span-1">STATUS</div>
                <div className="col-span-3 text-right">AKSI & BUKTI NOTA</div>
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

                        {tx.status === 'VOID' && tx.void_reason && (
                          <div className="p-2 bg-rose-50 border-l-2 border-rose-600 text-[11px] text-rose-900 leading-snug">
                            <strong>Alasan Ditolak:</strong> {tx.void_reason}{' '}
                            {tx.void_by_name && <span className="text-[10px] opacity-75">({tx.void_by_name})</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1.5 border-t border-[#111215]/6 text-[11px] text-[#7E8492] flex-wrap gap-2">
                          <span className="truncate pr-2">
                            {tx.category_name} • PIC: {tx.person_in_charge}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {canManageCash && (tx.status === 'DRAFT_PENDING' || tx.status === 'VOID') && (
                              <button
                                type="button"
                                onClick={() => openEditTransaction(tx)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#111215]/20 hover:border-[#111215] text-[#111215] text-xs font-semibold cursor-pointer"
                              >
                                <Pencil className="w-3.5 h-3.5 text-[#6456EB]" />
                                <span>{tx.status === 'VOID' ? 'Perbaiki' : 'Edit'}</span>
                              </button>
                            )}
                            <button
                              onClick={() => setActiveReceipt(tx)}
                              className="inline-flex items-center space-x-1 px-2.5 py-1.5 min-h-[38px] rounded-lg bg-[#F4F1EB] hover:bg-[#111215] text-[#111215] hover:text-[#F4F1EB] border border-[#111215]/8 transition-colors text-xs font-medium cursor-pointer shrink-0"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              <span>Bukti Nota</span>
                            </button>
                            {canManageCash && (tx.status === 'DRAFT_PENDING' || tx.status === 'VOID') && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Hapus draft transaksi ${tx.transaction_number}?`)) {
                                    deleteTransactionMutation.mutate(tx.id)
                                  }
                                }}
                                className="p-2 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                                title="Hapus draft"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
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
                        <div className="col-span-3 min-w-0 pr-3">
                          <div className="font-medium text-[#111215] truncate">
                            {tx.description}
                          </div>
                          <div className="text-[11px] text-[#7E8492] truncate">
                            {tx.category_name} • PIC: {tx.person_in_charge}
                          </div>
                          {tx.status === 'VOID' && tx.void_reason && (
                            <div className="mt-1 text-[10px] text-rose-800 italic truncate" title={tx.void_reason}>
                              Ditolak: {tx.void_reason}
                            </div>
                          )}
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

                        {/* Action Buttons */}
                        <div className="col-span-3 text-right flex items-center justify-end gap-1.5 flex-wrap">
                          {canManageCash && (tx.status === 'DRAFT_PENDING' || tx.status === 'VOID') && (
                            <button
                              type="button"
                              onClick={() => openEditTransaction(tx)}
                              className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#111215] text-[#111215] hover:text-[#F4F1EB] border border-[#111215]/15 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              title="Edit draft / perbaiki transaksi"
                            >
                              <Pencil className="w-3 h-3 text-[#6456EB]" />
                              <span>{tx.status === 'VOID' ? 'Perbaiki' : 'Edit'}</span>
                            </button>
                          )}

                          {(isBendahara2 || isSuperAdmin || isGodAdmin) && tx.status === 'DRAFT_PENDING' && (
                            <>
                              <button
                                type="button"
                                onClick={() => approveTxMutation.mutate(tx.id)}
                                disabled={approveTxMutation.isPending}
                                className="px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                                title="Verifikasi & Sahkan Transaksi"
                              >
                                Sah
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectModalTx(tx)}
                                className="px-2 py-1.5 rounded-lg bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-300 text-xs font-bold transition-colors cursor-pointer"
                                title="Tolak & Beri Alasan"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setActiveReceipt(tx)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 min-h-[36px] rounded-lg bg-[#F4F1EB] hover:bg-[#111215] text-[#111215] hover:text-[#F4F1EB] border border-[#111215]/8 transition-colors text-xs font-medium cursor-pointer"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Nota</span>
                          </button>

                          {canManageCash && (tx.status === 'DRAFT_PENDING' || tx.status === 'VOID') && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Hapus draft transaksi ${tx.transaction_number}?`)) {
                                  deleteTransactionMutation.mutate(tx.id)
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                              title="Hapus draft"
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

      {/* TAB: PROFILE INFORMATION */}
      {(activeTab === 'profile' || (isPengurus && activeTab === 'overview')) && (
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
              className="bg-white border border-[#111215]/20 max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
            <div className="flex items-center justify-between pb-3 border-b border-[#111215]/8">
              <div>
                <h3 className="font-semibold text-sm text-[#111215]">
                  Ubah Kode Token Akses
                </h3>
                <p className="text-xs text-[#525660] mt-0.5">
                  Untuk {editingTokenItem.assignee} ({editingTokenItem.role})
                </p>
              </div>
              <button
                onClick={() => setEditingTokenItem(null)}
                className="w-8 h-8 border border-transparent hover:border-[#111215]/20 hover:bg-[#F4F1EB] text-[#525660] hover:text-[#111215] flex items-center justify-center transition-colors cursor-pointer"
                title="Tutup dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTokenItem} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-[#525660] uppercase tracking-wider block mb-1">
                  Kode Token Baru (Wajib awalan NCD-)
                </label>
                <input
                  type="text"
                  value={editingItemKey}
                  onChange={(e) =>
                    setEditingItemKey(e.target.value.toUpperCase())
                  }
                  placeholder="NCD-..."
                  className="w-full px-3 py-2.5 bg-[#F4F1EB] border border-[#111215]/20 font-mono text-xs text-[#111215] focus:outline-none focus:border-[#111215]"
                  autoFocus
                />
                <span className="text-[10px] text-[#525660] mt-1 block">
                  Format: Huruf kapital, angka, minus (-), dan underscore (_).
                </span>
              </div>

              {tokenUpdateMsg && (
                <div
                  className={`p-2.5 text-xs flex items-center space-x-2 border ${
                    tokenUpdateMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
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
                  className="px-4 py-2 min-h-[38px] border border-[#111215]/20 text-xs text-[#525660] hover:bg-[#F4F1EB] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updateTokenMutation.isPending}
                  className="px-4 py-2 min-h-[38px] bg-[#111215] text-[#F4F1EB] text-xs font-medium hover:bg-[#252830] transition-colors cursor-pointer disabled:opacity-50 border border-black"
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

    {/* MODAL KONFIRMASI KEPUTUSAN SUPER ADMIN (TERIMA? / TOLAK?) DENGAN ANIMASI MOTION GRAPHIC */}
    <AnimatePresence>
      {decisionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => !decideApplicationMutation.isPending && setDecisionModal(null)}
            className="fixed inset-0 bg-black/60"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white border border-[#111215]/20 shadow-2xl p-6 sm:p-7 max-w-sm w-full z-10 text-center"
          >
            {/* Animated Motion Graphic Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 14, stiffness: 280, delay: 0.05 }}
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-4 ${
                decisionModal.action === 'ACCEPTED'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {decisionModal.action === 'ACCEPTED' ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <XCircle className="w-7 h-7" />
              )}
            </motion.div>

            {/* Title */}
            <h3 className="text-xl font-bold text-[#111215] tracking-tight">
              {decisionModal.action === 'ACCEPTED' ? 'Terima?' : 'Tolak?'}
            </h3>

            {/* Context Details */}
            <p className="text-xs text-[#525660] mt-2 mb-6 leading-relaxed">
              {decisionModal.action === 'ACCEPTED' ? (
                <>
                  Konfirmasi penerimaan calon anggota{' '}
                  <strong className="text-[#111215]">{decisionModal.app.full_name}</strong> sebagai anggota resmi komunitas NCD.
                </>
              ) : (
                <>
                  Konfirmasi penolakan berkas pendaftaran calon anggota{' '}
                  <strong className="text-[#111215]">{decisionModal.app.full_name}</strong>.
                </>
              )}
            </p>

            {/* Action Buttons: "Ya" & "Tidak" */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={decideApplicationMutation.isPending}
                onClick={() => setDecisionModal(null)}
                className="px-4 py-2.5 text-xs font-bold bg-[#F4F1EB] text-[#111215] border border-[#111215]/20 hover:bg-[#E8E4DC] active:scale-[0.98] transition-all cursor-pointer"
              >
                Tidak
              </button>
              <button
                type="button"
                disabled={decideApplicationMutation.isPending}
                onClick={() => {
                  decideApplicationMutation.mutate(
                    { id: decisionModal.app.id, status: decisionModal.action },
                    {
                      onSettled: () => setDecisionModal(null),
                    }
                  )
                }}
                className={`px-4 py-2.5 text-xs font-bold text-white active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 ${
                  decisionModal.action === 'ACCEPTED'
                    ? 'bg-[#107C41] hover:bg-[#0b5c30]'
                    : 'bg-[#D83B01] hover:bg-[#b03001]'
                }`}
              >
                {decideApplicationMutation.isPending ? 'Menyimpan...' : 'Ya'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* MODAL KONFIRMASI HAPUS BERKAS (SATUAN ATAU PER TANGGAL) */}
    <AnimatePresence>
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => {
              if (!deleteApplicationMutation.isPending && !deleteApplicationsByDateMutation.isPending) {
                setDeleteModal(null)
              }
            }}
            className="fixed inset-0 bg-black/60"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white border border-[#111215]/20 shadow-2xl p-6 sm:p-7 max-w-sm w-full z-10 text-center"
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mb-3.5">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-[#111215] tracking-tight">
              {deleteModal.type === 'single' ? 'Hapus Berkas Ini?' : 'Hapus Semua Berkas Tanggal Ini?'}
            </h3>

            <p className="text-xs text-[#525660] mt-2 mb-6 leading-relaxed">
              {deleteModal.type === 'single' ? (
                <>
                  Apakah Anda yakin ingin menghapus berkas pendaftaran calon anggota{' '}
                  <strong className="text-[#111215]">{deleteModal.name}</strong>? Data yang dihapus tidak dapat dipulihkan kembali.
                </>
              ) : (
                <>
                  Apakah Anda yakin ingin menghapus seluruh{' '}
                  <strong className="text-[#111215]">{deleteModal.count} berkas pendaftaran</strong> pada tanggal{' '}
                  <strong className="text-[#111215]">{deleteModal.dateLabel}</strong>?
                </>
              )}
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={deleteApplicationMutation.isPending || deleteApplicationsByDateMutation.isPending}
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2.5 text-xs font-bold bg-[#F4F1EB] text-[#111215] border border-[#111215]/20 hover:bg-[#E8E4DC] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteApplicationMutation.isPending || deleteApplicationsByDateMutation.isPending}
                onClick={() => {
                  if (deleteModal.type === 'single' && deleteModal.id) {
                    deleteApplicationMutation.mutate(deleteModal.id)
                  } else if (deleteModal.type === 'date') {
                    deleteApplicationsByDateMutation.mutate({
                      date: deleteModal.dateKey || '',
                      ids: deleteModal.ids,
                    })
                  }
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {deleteApplicationMutation.isPending || deleteApplicationsByDateMutation.isPending
                    ? 'Menghapus...'
                    : 'Hapus'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      {/* MODAL: DETAIL ISIAN ONBOARDING MEMBER (KHUSUS PENGURUS) */}
      {selectedTrackerMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-onboarding-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedTrackerMember(null)
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60"
        >
          <div className="bg-white border-2 border-[#111215] max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl text-left overflow-hidden">
            {/* Pinned Sticky Header */}
            <div className="flex items-start justify-between p-4 sm:p-5 border-b border-[#111215]/15 bg-white shrink-0">
              <div className="min-w-0 pr-3">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h3 id="modal-onboarding-title" className="text-base sm:text-lg font-bold text-[#111215] truncate">
                    Isian Onboarding: {selectedTrackerMember.full_name}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold border shrink-0 ${
                      selectedTrackerMember.is_onboarded
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {selectedTrackerMember.is_onboarded ? 'SELESAI' : 'MENUNGGU'}
                  </span>
                </div>
                <p className="text-xs text-[#525660] mt-0.5 truncate">
                  {selectedTrackerMember.email} • Token: {selectedTrackerMember.token_key || '-'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Tutup modal"
                onClick={() => setSelectedTrackerMember(null)}
                className="p-1.5 hover:bg-[#111215] hover:text-[#F4F1EB] border border-transparent hover:border-[#111215] text-[#111215] transition-colors shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body Only */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs overscroll-contain">
              {/* Section 1 */}
              <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-2">
                <div className="font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-1.5 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Detail Pribadi & Studi</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#7E8492] block">Program Studi:</span>
                    <span className="font-semibold text-[#111215]">{selectedTrackerMember.profile?.major || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#7E8492] block">Angkatan:</span>
                    <span className="font-semibold text-[#111215]">{selectedTrackerMember.profile?.cohort_year || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#7E8492] block">Kampus / Domisili:</span>
                    <span className="font-semibold text-[#111215]">{selectedTrackerMember.profile?.campus_domicile || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#7E8492] block">Minat Dasar:</span>
                    <span className="font-medium text-[#111215]">{selectedTrackerMember.profile?.interests || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#7E8492] block">Target Keterampilan:</span>
                    <span className="font-medium text-[#111215]">{selectedTrackerMember.profile?.target_skills || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-2">
                <div className="font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-1.5 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>2. Perkenalan Diri</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-[#7E8492] block">Hobi:</span>
                    <span className="font-medium text-[#111215]">{selectedTrackerMember.profile?.hobbies || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#7E8492] block">Fokus Spesifik:</span>
                    <span className="font-medium text-[#111215]">{selectedTrackerMember.profile?.specific_focus || '-'}</span>
                  </div>
                  <div>
                    <span className="text-[#7E8492] block">Topik yang Ingin Dipelajari:</span>
                    <span className="font-medium text-[#111215]">{selectedTrackerMember.profile?.topics_to_learn || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 3 */}
              <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-2">
                <div className="font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-1.5 flex items-center space-x-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>3. Ekspektasi Bergabung di NCD</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    {selectedTrackerMember.profile?.expectations?.map((exp) => (
                      <span key={exp} className="px-2 py-0.5 bg-white border border-[#111215]/20 font-semibold text-[#111215]">
                        ✓ {exp}
                      </span>
                    ))}
                  </div>
                  {selectedTrackerMember.profile?.expectation_note && (
                    <p className="mt-1 text-[#525660] italic">
                      "{selectedTrackerMember.profile.expectation_note}"
                    </p>
                  )}
                </div>
              </div>

              {/* Section 4 */}
              <div className="p-4 bg-[#F4F1EB] border border-[#111215]/10 space-y-2">
                <div className="font-bold text-xs text-[#111215] border-b border-[#111215]/10 pb-1.5 flex items-center space-x-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>4. Bidang Minat & Spesialisasi</span>
                </div>
                <div className="flex flex-wrap gap-1 text-[11px]">
                  {selectedTrackerMember.profile?.interest_fields?.map((fld) => (
                    <span key={fld} className="px-2 py-0.5 bg-[#111215] text-[#F4F1EB] font-semibold">
                      {fld}
                    </span>
                  ))}
                </div>
                {selectedTrackerMember.profile?.other_interest && (
                  <div className="text-[11px] text-[#525660] mt-1">
                    Lainnya: <strong className="text-[#111215]">{selectedTrackerMember.profile.other_interest}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Pinned Sticky Footer */}
            <div className="p-3.5 sm:px-6 border-t border-[#111215]/15 bg-[#F4F1EB] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-[#7E8492] hidden sm:inline">
                Data tersimpan di sistem keanggotaan internal NCD.
              </span>
              <button
                type="button"
                onClick={() => setSelectedTrackerMember(null)}
                className="px-5 py-2 bg-[#111215] text-[#F4F1EB] text-xs font-semibold hover:bg-black transition-colors cursor-pointer ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VERIFIKASI BERKAS PENDAFTARAN (SEKRETARIS, SUPER ADMIN, GOD ADMIN) */}
      {verifyModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg bg-white border border-[#111215]/20 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#111215]/10 shrink-0 bg-[#F4F1EB]">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-[#6456EB]" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#111215]">
                    Verifikasi Administrasi Berkas
                  </h3>
                  <p className="text-[11px] text-[#525660]">
                    Pemeriksa Berkas: {currentUser.name} ({currentUser.role})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerifyModal(null)}
                className="text-[#7E8492] hover:text-[#111215] text-lg font-bold p-1 cursor-pointer"
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              <div className="p-3 bg-[#F4F1EB]/60 border border-[#111215]/10 space-y-1">
                <div className="text-[11px] font-bold text-[#111215]">
                  {verifyModal.app.full_name}
                </div>
                <div className="text-[10px] text-[#525660]">
                  {verifyModal.app.major} • {verifyModal.app.campus_domicile} • WA: {verifyModal.app.phone_whatsapp}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111215] mb-2">
                  Status Kelengkapan Berkas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'LENGKAP', label: '✓ Lengkap', desc: 'Memenuhi syarat', border: 'border-emerald-300', bg: 'bg-emerald-50 text-emerald-900' },
                    { val: 'PERLU_REVISI', label: '⚠ Revisi', desc: 'Ada kekurangan', border: 'border-amber-300', bg: 'bg-amber-50 text-amber-900' },
                    { val: 'TIDAK_LENGKAP', label: '✕ Tidak Lengkap', desc: 'Gugur berkas', border: 'border-rose-300', bg: 'bg-rose-50 text-rose-900' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setVerifyModal({ ...verifyModal, status: s.val as any })}
                      className={`p-2.5 text-left border transition-all cursor-pointer ${
                        verifyModal.status === s.val
                          ? `${s.bg} ${s.border} ring-2 ring-[#111215]`
                          : 'bg-white border-[#111215]/15 text-[#525660] hover:border-[#111215]/40'
                      }`}
                    >
                      <span className="block font-bold text-xs">{s.label}</span>
                      <span className="block text-[10px] mt-0.5 opacity-80">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#111215] mb-1.5">
                  Catatan Verifikasi Administrasi (Opsional)
                </label>
                <textarea
                  rows={3}
                  value={verifyModal.note}
                  onChange={(e) => setVerifyModal({ ...verifyModal, note: e.target.value })}
                  placeholder="Contoh: Berkas KTM valid, portofolio GitHub aktif, nomor WA terhubung..."
                  className="w-full px-3 py-2 text-xs bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#111215]/10 shrink-0 bg-[#F4F1EB] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setVerifyModal(null)}
                className="px-4 py-2 text-xs font-semibold text-[#525660] hover:text-[#111215] border border-transparent hover:border-[#111215]/20 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={verifyApplicationMutation.isPending}
                onClick={() =>
                  verifyApplicationMutation.mutate({
                    id: verifyModal.app.id,
                    verification_status: verifyModal.status,
                    verification_note: verifyModal.note.trim(),
                  })
                }
                className="px-4 py-2 text-xs font-bold bg-[#111215] text-[#F4F1EB] hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
              >
                {verifyApplicationMutation.isPending ? 'Menyimpan...' : 'Simpan Status Verifikasi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DETAIL / BACA DOKUMEN & NOTULENSI ORGANISASI */}
      {selectedDocView && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-2xl bg-white border border-[#111215]/20 shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#111215]/10 shrink-0 bg-[#F4F1EB]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-[#111215] text-[#F4F1EB]">
                    {selectedDocView.category}
                  </span>
                  <span className="text-xs text-[#7E8492] font-mono">
                    {new Date(selectedDocView.date).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[#111215] leading-snug">
                  {selectedDocView.title}
                </h3>
                <p className="text-[11px] text-[#525660]">
                  Diarsipkan oleh: <strong className="text-[#111215]">{selectedDocView.author}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDocView(null)}
                className="text-[#7E8492] hover:text-[#111215] text-lg font-bold p-1 self-start cursor-pointer"
                aria-label="Tutup modal dokumen"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {selectedDocView.summary && (
                <div className="p-3 bg-[#F4F1EB]/70 border-l-2 border-[#111215] text-xs text-[#111215] italic">
                  <strong>Ringkasan:</strong> {selectedDocView.summary}
                </div>
              )}

              {selectedDocView.file_link && (
                <div className="p-3 bg-blue-50 border border-blue-200 flex items-center justify-between gap-2 text-xs">
                  <span className="text-blue-900 font-medium">
                    Berkas Eksternal / Dokumen Terlampir:
                  </span>
                  <a
                    href={selectedDocView.file_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-bold text-[#6456EB] hover:underline"
                  >
                    <span>Buka Tautan</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div>
                <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-2">
                  Isi / Notulensi Rapat
                </span>
                <div className="p-4 bg-[#F4F1EB]/30 border border-[#111215]/10 whitespace-pre-wrap font-sans text-xs leading-relaxed text-[#111215]">
                  {selectedDocView.content_md || 'Tidak ada teks isi terlampir.'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-[#111215]/10 shrink-0 bg-[#F4F1EB] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setSelectedDocView(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#111215] text-[#F4F1EB] hover:bg-black transition-colors cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PENCATATAN & EDIT MUTASI KAS (BENDAHARA) */}
      {isTxModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsTxModalOpen(false)
              setEditingTransaction(null)
              resetTxForm()
            }
          }}
        >
          <div className="relative w-full max-w-lg bg-white border border-[#111215]/20 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#111215]/10 shrink-0 bg-[#F4F1EB]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-[#111215] text-[#F4F1EB] flex items-center justify-center shrink-0">
                  <Receipt className="w-4 h-4 text-[#E6FF55]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#111215]">
                    {editingTransaction ? 'Edit Draft Mutasi Kas' : 'Catat Mutasi Kas Baru'}
                  </h3>
                  <p className="text-[11px] text-[#525660]">
                    {editingTransaction
                      ? editingTransaction.status === 'VOID'
                        ? 'Perbaiki transaksi yang ditolak untuk diajukan ulang'
                        : 'Perbarui rincian atau bukti nota draft'
                      : 'Input transaksi kas masuk/keluar untuk diverifikasi Bendahara II'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTxModalOpen(false)
                  setEditingTransaction(null)
                  resetTxForm()
                }}
                className="p-1 text-[#7E8492] hover:text-[#111215] hover:bg-[#111215]/5 rounded transition-colors"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitTransaction} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
                {/* Rejection Notice if VOID */}
                {editingTransaction && editingTransaction.status === 'VOID' && (
                  <div className="p-3.5 bg-rose-50 border border-rose-300 rounded text-rose-950 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold uppercase tracking-wider text-[10px] text-rose-800">
                        Alasan Penolakan dari {editingTransaction.void_by_name || 'Bendahara II'}:
                      </p>
                      <p className="font-medium text-rose-900 bg-white/70 p-2 rounded border border-rose-200 text-xs">
                        &quot;{editingTransaction.void_reason || 'Tidak ada alasan spesifik'}&quot;
                      </p>
                      <p className="text-[10px] text-rose-700">
                        Perbaiki rincian atau foto nota di bawah. Saat disimpan, status transaksi akan kembali menjadi <strong>Menunggu Verifikasi</strong>.
                      </p>
                    </div>
                  </div>
                )}

                {txFormError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 text-rose-700 text-xs flex items-center gap-2 rounded">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{txFormError}</span>
                  </div>
                )}

                {/* Jenis Mutasi: EXPENSE vs INCOME */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-1.5">
                    Jenis Mutasi Kas *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTxType('EXPENSE')}
                      className={`px-3 py-2 text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        txType === 'EXPENSE'
                          ? 'bg-rose-50 border-rose-600 text-rose-700 shadow-xs'
                          : 'bg-white border-[#111215]/20 text-[#525660] hover:border-[#111215]'
                      }`}
                    >
                      <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>- Pengeluaran Dana</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType('INCOME')}
                      className={`px-3 py-2 text-xs font-bold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        txType === 'INCOME'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-700 shadow-xs'
                          : 'bg-white border-[#111215]/20 text-[#525660] hover:border-[#111215]'
                      }`}
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>+ Pemasukan Dana</span>
                    </button>
                  </div>
                </div>

                {/* Nominal & Live Currency Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#7E8492]">
                      Nominal Kas (Rp) *
                    </label>
                    {txAmount && Number(txAmount) > 0 && (
                      <span className="text-[11px] font-mono font-bold text-[#6456EB]">
                        Rp {Number(txAmount).toLocaleString('id-ID')}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="Contoh: 150000"
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-none transition-colors font-mono font-bold"
                  />
                </div>

                {/* Tanggal & PIC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-1.5">
                      Tanggal Transaksi *
                    </label>
                    <input
                      type="date"
                      value={txDate}
                      onChange={(e) => setTxDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-1.5">
                      Penanggung Jawab (PIC) *
                    </label>
                    <input
                      type="text"
                      value={txPIC}
                      onChange={(e) => setTxPIC(e.target.value)}
                      placeholder="Nama PIC pengeluaran/penerima"
                      required
                      className="w-full px-3 py-2 text-xs bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-1.5">
                    Kategori Transaksi *
                  </label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-none transition-colors"
                  >
                    <option value="Operasional">Operasional</option>
                    <option value="Konsumsi Rapat">Konsumsi Rapat</option>
                    <option value="Perlengkapan & Logistik">Perlengkapan & Logistik</option>
                    <option value="Transportasi">Transportasi</option>
                    <option value="Kas Anggota">Kas Anggota</option>
                    <option value="Sponsorship & Donasi">Sponsorship & Donasi</option>
                    <option value="Hadiah / Lomba">Hadiah / Lomba</option>
                    <option value="Lainnya">Lainnya (Ketik Manual)</option>
                  </select>
                  {txCategory === 'Lainnya' && (
                    <input
                      type="text"
                      value={txCustomCategory}
                      onChange={(e) => setTxCustomCategory(e.target.value)}
                      placeholder="Tuliskan nama kategori baru..."
                      className="w-full mt-2 px-3 py-2 text-xs bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-none transition-colors"
                    />
                  )}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#7E8492] mb-1.5">
                    Deskripsi / Peruntukan Kas *
                  </label>
                  <textarea
                    rows={2}
                    value={txDescription}
                    onChange={(e) => setTxDescription(e.target.value)}
                    placeholder="Contoh: Pembelian kabel HDMI dan roll banner untuk meetup pengurus..."
                    required
                    className="w-full px-3 py-2 text-xs bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Bukti Nota / Kwitansi */}
                <div className="p-3 bg-[#F4F1EB]/50 border border-[#111215]/10 rounded space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#7E8492]">
                      Bukti Nota / Kwitansi *
                    </label>
                    {txReceiptUrl && (
                      <button
                        type="button"
                        onClick={() => setTxReceiptUrl('')}
                        className="text-[10px] text-rose-600 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Hapus Nota</span>
                      </button>
                    )}
                  </div>

                  {/* File Upload & URL input */}
                  <div className="space-y-2">
                    <div>
                      <span className="block text-[10px] text-[#525660] mb-1">
                        Pilih foto dari perangkat (JPG/PNG/WebP, maks 5MB):
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleReceiptFileChange}
                        className="w-full text-xs text-[#525660] file:mr-2.5 file:py-1 file:px-2.5 file:border file:border-[#111215]/20 file:text-xs file:font-semibold file:bg-white hover:file:bg-[#111215] hover:file:text-white file:transition-colors cursor-pointer"
                      />
                    </div>
                    <div>
                      <span className="block text-[10px] text-[#525660] mb-1">
                        Atau tautan URL gambar eksternal:
                      </span>
                      <input
                        type="url"
                        value={txReceiptUrl.startsWith('data:') ? '' : txReceiptUrl}
                        onChange={(e) => setTxReceiptUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3 py-1.5 text-xs bg-white border border-[#111215]/20 focus:border-[#111215] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {txReceiptUrl && (
                    <div className="mt-2 pt-2 border-t border-[#111215]/10 flex items-center gap-3">
                      <div className="w-16 h-16 rounded border border-[#111215]/20 overflow-hidden bg-white shrink-0 flex items-center justify-center">
                        <img
                          src={txReceiptUrl}
                          alt="Preview Nota"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      </div>
                      <div className="text-[11px] text-[#525660] space-y-0.5">
                        <p className="font-semibold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Nota berhasil dilampirkan</span>
                        </p>
                        <p className="text-[10px] text-[#7E8492]">
                          Nota ini akan ditinjau oleh Bendahara II sebelum dicatat sah di kas resmi.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-5 border-t border-[#111215]/10 shrink-0 bg-[#F4F1EB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsTxModalOpen(false)
                    setEditingTransaction(null)
                    resetTxForm()
                  }}
                  className="px-4 py-2 text-xs font-semibold border border-[#111215]/20 bg-white text-[#525660] hover:bg-[#111215]/5 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={createTransactionMutation.isPending || updateTransactionMutation.isPending}
                  className="px-5 py-2 text-xs font-bold bg-[#111215] text-[#F4F1EB] hover:bg-black transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {createTransactionMutation.isPending || updateTransactionMutation.isPending
                    ? 'Menyimpan...'
                    : editingTransaction
                    ? editingTransaction.status === 'VOID'
                      ? 'Simpan & Ajukan Ulang'
                      : 'Simpan Perubahan'
                    : 'Simpan Draft Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Tab Bar (Visible only on mobile inside Dashboard) */}
      <aside
        aria-label="Navigasi Menu Dasbor Mobile"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-2 bg-[#F4F1EB] border-t border-[#111215]/20 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <nav
          role="tablist"
          aria-label="Tab Menu Dasbor"
          className="relative flex items-center justify-between w-full bg-white border border-[#111215]/20 p-1 shadow-lg select-none"
        >
          {navTabs.map((tab, idx) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`dashboard-mobile-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`dashboard-panel-${tab.id}`}
                aria-label={tab.label}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                onKeyDown={(e) => handleTabKeyDown(e, idx, true)}
                className={`relative flex-1 flex items-center justify-center py-2.5 min-h-[44px] transition-colors duration-150 outline-none focus-visible:ring-1 focus-visible:ring-[#111215] ${
                  isActive ? 'text-[#F4F1EB]' : 'text-[#525660] hover:text-[#111215]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="dashboardActiveTabThumbMobile"
                    className="absolute inset-0 bg-[#111215] z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center">
                  <Icon className="w-5 h-5 shrink-0" />
                  {tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-600 border border-white" />
                  )}
                </span>
              </button>
            )
          })}
        </nav>
      </aside>
    </div>
  )
}

export default Dashboard
