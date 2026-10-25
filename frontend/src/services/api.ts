import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  timeout: 12000, // 12-second client timeout
})

export interface Member {
  id: string
  full_name: string
  nickname: string
  avatar_url: string
  position_title: string
  position_level: number
  division: string
  generation: string
  major: string
  university: string
  skills: string[]
  bio: string
  linkedin_url: string
  github_url: string
  is_leader: boolean
}

export interface Project {
  id: string
  title: string
  slug: string
  summary: string
  tech_stack: string[]
  status: string
  progress: number
  thumbnail_url: string
  repo_url: string
  demo_url: string
  team_leader: string
}

export interface HistoryItem {
  id: string
  year: number
  month: string
  title: string
  description: string
}

export interface CashSummary {
  current_balance: number
  total_income: number
  total_expense: number
  pending_drafts: number
  last_updated: string
}

export interface Transaction {
  id: string
  transaction_number: string
  type: 'INCOME' | 'EXPENSE'
  category_name: string
  amount: number
  description: string
  person_in_charge: string
  receipt_url: string
  status: 'DRAFT_PENDING' | 'VERIFIED' | 'VOID'
  transaction_date: string
  maker_name: string
  maker_id: string
  verifier_name?: string
  verifier_id?: string
  verified_at?: string
  void_reason?: string
  void_by_name?: string
  created_at: string
}

export interface Post {
  id: string
  title: string
  slug: string
  summary: string
  content_md: string
  cover_image_url?: string
  category: 'Pengumuman' | 'Rilis Produk' | 'Riset & Edukasi' | 'Kegiatan Komunitas' | string
  tags: string[]
  author_name: string
  is_pinned: boolean
  published_at: string
}

export interface Achievement {
  id: string
  title: string
  event_name: string
  competition?: string
  organizer?: string
  tier: 'Internasional' | 'Nasional' | 'Regional / Kampus' | string
  rank: string
  category?: string
  year?: number
  date?: string
  award_date: string
  team_name?: string
  members?: string[]
  team_members: string[]
  project_title?: string
  certificate_url?: string
  photo_url?: string
  description: string
}

export interface Competition {
  id: string
  name: string
  organizer: string
  tier: 'Internasional' | 'Nasional' | 'Regional / Kampus' | string
  category: string
  registration_deadline: string
  event_date: string
  status: 'Open Registration' | 'Upcoming' | 'In Progress' | 'Completed' | string
  description: string
  url?: string
}

export interface DashboardUser {
  id: string
  name: string
  full_name?: string
  email: string
  role: string
  position: string
}

export interface ApplicationVote {
  id: string
  user_id: string
  user_name: string
  user_role: string
  decision: 'ACC' | 'TIDAK_ACC'
  note?: string
  created_at: string
}

export interface ApplicationItem {
  id: string
  full_name: string
  email: string
  phone_whatsapp: string
  university: string
  major: string
  generation: string
  campus_domicile: string
  referral_source: string
  skills_interest: string
  motivation: string
  portfolio_links?: string
  status: 'NEW' | 'ACCEPTED' | 'REJECTED'
  final_decision_by?: string
  final_decision_at?: string
  verification_status?: 'LENGKAP' | 'PERLU_REVISI' | 'TIDAK_LENGKAP'
  verification_note?: string
  verified_by?: string
  verified_at?: string
  votes: ApplicationVote[]
  created_at: string
  updated_at: string
}

export interface OrganizationDocument {
  id: string
  title: string
  date: string
  category: 'NOTULENSI' | 'SOP' | 'SURAT_KEPUTUSAN' | 'PANDUAN' | 'ARSIP' | string
  summary: string
  content_md: string
  file_link?: string
  author: string
  created_at: string
  updated_at: string
}

export interface ActivityItem {
  id: string
  title: string
  timestamp: string
  type: 'TRANSACTION' | 'PROJECT' | 'MEMBER' | 'ANNOUNCEMENT' | string
  actor?: string
  badge?: string
}

export interface DashboardSummary {
  user: DashboardUser
  pending_verification_count?: number
  total_transactions_count?: number
  active_projects_count?: number
  total_members_count?: number
  cash_balance?: number
  stats?: {
    cash_balance: number
    pending_verification_count: number
    total_transactions_count?: number
    active_projects_count: number
    total_members_count: number
  }
  recent_activity: ActivityItem[]
}

export interface AccessKey {
  id: string
  key: string
  role: string
  assignee: string
  position: string
  email: string
  is_active: boolean
  created_at: string
  last_used_at?: string
}

export interface MemberProfile {
  user_id?: string
  email?: string
  full_name: string
  major: string
  cohort_year: string
  campus_domicile: string
  interests: string
  target_skills: string
  hobbies: string
  specific_focus: string
  topics_to_learn: string
  expectations: string[]
  expectation_note: string
  interest_fields: string[]
  other_interest: string
  is_onboarded: boolean
  completed_at?: string
  updated_at?: string
}

export interface OnboardingTrackerItem {
  user_id: string
  full_name: string
  email: string
  role: string
  position: string
  token_key?: string
  is_onboarded: boolean
  completed_at?: string
  profile?: MemberProfile
}

export interface OnboardingTrackerResponse {
  total_members: number
  completed_count: number
  pending_count: number
  completion_rate: number
  members: OnboardingTrackerItem[]
}

export const getMemberProfile = async (): Promise<MemberProfile> => {
  const res = await api.get('/member/profile')
  return res.data
}

export const submitMemberOnboarding = async (data: Partial<MemberProfile>): Promise<MemberProfile> => {
  const res = await api.post('/member/onboarding', data)
  return res.data
}

export const getMemberOnboardingTracker = async (): Promise<OnboardingTrackerResponse> => {
  const res = await api.get('/portal/member-onboarding')
  return res.data
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ncd_jwt')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. Sesi Login Habis / Token Tidak Sah
    if (error.response?.status === 401) {
      localStorage.removeItem('ncd_jwt')
      localStorage.removeItem('ncd_user')
      if (
        typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/app') ||
          window.location.pathname.startsWith('/finance') ||
          window.location.pathname.startsWith('/dashboard'))
      ) {
        window.location.replace('/login')
      }
    }

    // 2. Handle Timeout Error
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      error.userFriendlyMessage =
        'Permintaan ke server memakan waktu terlalu lama (timeout). Silakan periksa koneksi dan coba lagi.'
    }

    // 3. Handle Rate Limiting (429)
    if (error.response?.status === 429) {
      error.userFriendlyMessage =
        error.response.data?.error ||
        'Terlalu banyak permintaan (Rate limit tercapai). Silakan tunggu sejenak sebelum mencoba lagi.'
    }

    // 4. Handle Network / Connection Drop
    if (!error.response && !error.status) {
      error.userFriendlyMessage =
        'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.'
    }

    return Promise.reject(error)
  }
)
