import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ncd_jwt')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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
    if (error.response?.status === 401) {
      localStorage.removeItem('ncd_jwt')
      localStorage.removeItem('ncd_user')
      if (
        typeof window !== 'undefined' &&
        (window.location.pathname.startsWith('/app') || window.location.pathname.startsWith('/finance'))
      ) {
        window.location.replace('/login')
      }
    }
    return Promise.reject(error)
  }
)
