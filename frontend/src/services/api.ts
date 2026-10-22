import axios from 'axios'

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
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
