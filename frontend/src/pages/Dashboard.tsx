import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Wallet,
  Clock,
  Users,
  FolderGit2,
  BookOpen,
  Receipt,
  FolderKanban,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  Bell,
  UserCheck,
} from 'lucide-react'
import { api, DashboardSummary } from '../services/api'

export function Dashboard() {
  const [localUser] = useState<{
    id?: string
    full_name?: string
    name?: string
    email?: string
    role?: string
    position?: string
  } | null>(() => {
    try {
      const raw = localStorage.getItem('ncd_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const {
    data: dashboardData,
    isLoading,
    refetch,
  } = useQuery<DashboardSummary>({
    queryKey: ['portalDashboard'],
    queryFn: async () => {
      const res = await api.get('/portal/dashboard')
      return res.data
    },
    staleTime: 30000,
    retry: 1,
  })

  // User identity resolution
  const user = {
    name:
      localUser?.full_name ||
      localUser?.name ||
      dashboardData?.user?.full_name ||
      dashboardData?.user?.name ||
      'Pengurus NCD',
    email: localUser?.email || dashboardData?.user?.email || 'pengurus@ncd.dev',
    role: localUser?.role || dashboardData?.user?.role || 'PENGURUS',
    position:
      localUser?.position ||
      dashboardData?.user?.position ||
      'Pengurus Harian Komunitas',
  }

  // Numerical metrics resolution
  const cashBalance =
    dashboardData?.stats?.cash_balance ?? dashboardData?.cash_balance ?? 8500000
  const pendingCount =
    dashboardData?.stats?.pending_verification_count ??
    dashboardData?.pending_verification_count ??
    0
  const activeProjects =
    dashboardData?.stats?.active_projects_count ??
    dashboardData?.active_projects_count ??
    2
  const totalMembers =
    dashboardData?.stats?.total_members_count ??
    dashboardData?.total_members_count ??
    35

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'GOD_ADMIN':
        return {
          label: 'Developer Lead (God Admin)',
          color: 'bg-purple-50 text-purple-700 border-purple-200/80',
        }
      case 'SUPER_ADMIN':
        return {
          label: 'Super Admin',
          color: 'bg-blue-50 text-blue-700 border-blue-200/80',
        }
      case 'BENDAHARA_I':
        return {
          label: 'Bendahara I (Maker)',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
        }
      case 'BENDAHARA_II':
        return {
          label: 'Bendahara II (Checker)',
          color: 'bg-amber-50 text-amber-700 border-amber-200/80',
        }
      case 'SEKRETARIS':
        return {
          label: 'Sekretaris I',
          color: 'bg-cyan-50 text-cyan-700 border-cyan-200/80',
        }
      default:
        return {
          label: role || 'Pengurus Komunitas',
          color: 'bg-[#6456EB]/10 text-[#6456EB] border-[#6456EB]/20',
        }
    }
  }

  const getActivityBadgeClass = (type: string, badge?: string) => {
    if (badge) {
      const b = badge.toUpperCase()
      if (b.includes('VERIFIKASI') || b.includes('VERIFIED')) {
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      }
      if (b.includes('MENUNGGU') || b.includes('PENDING')) {
        return 'bg-amber-50 text-amber-700 border-amber-200/80'
      }
      if (b.includes('DEVELOPMENT') || b.includes('AKTIF')) {
        return 'bg-[#6456EB]/10 text-[#6456EB] border-[#6456EB]/20'
      }
      if (b.includes('PENGUMUMAN') || b.includes('OPERASIONAL')) {
        return 'bg-blue-50 text-blue-700 border-blue-200/80'
      }
      if (b.includes('REKRUTMEN') || b.includes('MEMBER')) {
        return 'bg-rose-50 text-rose-700 border-rose-200/80'
      }
    }
    switch (type) {
      case 'TRANSACTION':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      case 'PROJECT':
        return 'bg-[#6456EB]/10 text-[#6456EB] border-[#6456EB]/20'
      case 'MEMBER':
        return 'bg-rose-50 text-rose-700 border-rose-200/80'
      case 'ANNOUNCEMENT':
        return 'bg-blue-50 text-blue-700 border-blue-200/80'
      default:
        return 'bg-[#111215]/5 text-[#525660] border-[#111215]/10'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION':
        return <Receipt className="w-4 h-4 text-emerald-600" />
      case 'PROJECT':
        return <FolderGit2 className="w-4 h-4 text-[#6456EB]" />
      case 'MEMBER':
        return <Users className="w-4 h-4 text-rose-600" />
      case 'ANNOUNCEMENT':
        return <Bell className="w-4 h-4 text-blue-600" />
      default:
        return <Activity className="w-4 h-4 text-[#7E8492]" />
    }
  }

  // Fallback activities if backend is empty
  const activities = dashboardData?.recent_activity?.length
    ? dashboardData.recent_activity
    : [
        {
          id: 'act-1',
          title: 'Pencatatan Hadiah Kompetisi Gemastik terverifikasi',
          timestamp: '2 jam yang lalu',
          type: 'TRANSACTION',
          actor: 'Sri Gunarti Wijiastuti (Bendahara II)',
          badge: 'TERVERIFIKASI',
        },
        {
          id: 'act-2',
          title: 'Sprint 4: Decoupled Go API & Web UI terintegrasi ke staging',
          timestamp: '5 jam yang lalu',
          type: 'PROJECT',
          actor: 'Rianszzz (Solo Dev)',
          badge: 'DEVELOPMENT',
        },
        {
          id: 'act-3',
          title: 'Draft pengajuan operasional server cloud & domain menunggu verifikasi',
          timestamp: '1 hari yang lalu',
          type: 'TRANSACTION',
          actor: 'Muhammad Iqbal Fajri (Bendahara I)',
          badge: 'MENUNGGU',
        },
        {
          id: 'act-4',
          title: 'Rapat Koordinasi Pengurus Inti & Evaluasi Roadmap Q4 2026',
          timestamp: '2 hari yang lalu',
          type: 'ANNOUNCEMENT',
          actor: 'Mirza Danisywar (Chairman)',
          badge: 'OPERASIONAL',
        },
        {
          id: 'act-5',
          title: 'Pendaftaran Terbuka Anggota Baru Angkatan 2026 telah dibuka',
          timestamp: '3 hari yang lalu',
          type: 'MEMBER',
          actor: 'Annisa Saskia (Sekretaris I)',
          badge: 'REKRUTMEN',
        },
      ]

  const roleBadge = getRoleBadge(user.role)

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 md:py-16 text-left">
      {/* Skeleton Loading State */}
      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          {/* Banner Skeleton */}
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-8 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="w-32 h-6 rounded-xl bg-[#111215]/8" />
                <div className="w-64 md:w-96 h-9 rounded-xl bg-[#111215]/10" />
                <div className="w-48 h-4 rounded-md bg-[#111215]/6" />
              </div>
              <div className="w-36 h-10 rounded-xl bg-[#111215]/8" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#111215]/8 p-6 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-24 h-4 rounded bg-[#111215]/8" />
                  <div className="w-8 h-8 rounded-xl bg-[#111215]/10" />
                </div>
                <div className="w-36 h-8 rounded-lg bg-[#111215]/10" />
                <div className="w-28 h-3.5 rounded bg-[#111215]/6" />
              </div>
            ))}
          </div>

          {/* Quick Actions Skeleton */}
          <div className="space-y-3">
            <div className="w-40 h-5 rounded bg-[#111215]/10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#111215]/8 p-5 shadow-2xs space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#111215]/10" />
                  <div className="w-28 h-4 rounded bg-[#111215]/8" />
                  <div className="w-full h-3 rounded bg-[#111215]/6" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-6 shadow-2xs space-y-4">
            <div className="w-48 h-5 rounded bg-[#111215]/10 mb-4" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-[#111215]/6 last:border-none"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-[#111215]/8" />
                  <div className="space-y-1.5">
                    <div className="w-48 sm:w-80 h-4 rounded bg-[#111215]/10" />
                    <div className="w-32 h-3 rounded bg-[#111215]/6" />
                  </div>
                </div>
                <div className="w-20 h-6 rounded-xl bg-[#111215]/8" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-6 md:p-8 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-[#111215]">
                    Selamat Datang, {user.name}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${roleBadge.color}`}
                  >
                    {roleBadge.label}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#525660] max-w-2xl leading-relaxed">
                  Pusat kendali organisasi NEXA Community Development. Akses
                  pembukuan kas terbuka Maker-Checker, direktori kepengurusan,
                  dan progres proyek riset.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 shrink-0">
                <div className="flex items-center space-x-2 text-xs text-[#7E8492]">
                  <span className="w-2 h-2 rounded-full bg-[#107C41]" />
                  <span>Sistem Online & Terhubung</span>
                </div>
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 min-h-[38px] rounded-xl bg-[#F4F1EB] hover:bg-[#111215]/10 text-xs font-medium text-[#111215] border border-[#111215]/6 transition-all cursor-pointer"
                  title="Segarkan data ringkasan"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#525660]" />
                  <span>Segarkan Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Saldo Kas */}
            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between hover:border-[#111215]/15 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8492] font-medium mb-3">
                  <span>Saldo Kas Bersih</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
                <div className="text-2xl md:text-3xl font-semibold text-[#111215] font-tabular tracking-tight">
                  {formatRupiah(cashBalance)}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#111215]/6 flex items-center justify-between text-[11px] text-[#7E8492]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#107C41]" />
                  Buku Kas Terbuka
                </span>
                <Link
                  to="/app/finance"
                  className="text-[#6456EB] font-medium hover:underline inline-flex items-center"
                >
                  Rincian
                </Link>
              </div>
            </div>

            {/* 2. Menunggu Verifikasi */}
            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between hover:border-[#111215]/15 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8492] font-medium mb-3">
                  <span>Antrean Verifikasi</span>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      pendingCount > 0
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    }`}
                  >
                    <Clock
                      className={`w-4 h-4 ${
                        pendingCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl md:text-3xl font-semibold text-[#111215] font-tabular tracking-tight">
                    {pendingCount}
                  </div>
                  <span className="text-xs text-[#7E8492] font-normal">
                    transaksi
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#111215]/6 flex items-center justify-between text-[11px]">
                {pendingCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Menunggu Checker
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Semua Terverifikasi
                  </span>
                )}
                <Link
                  to="/app/finance"
                  className="text-[#6456EB] font-medium hover:underline inline-flex items-center"
                >
                  Audit
                </Link>
              </div>
            </div>

            {/* 3. Proyek Aktif */}
            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between hover:border-[#111215]/15 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8492] font-medium mb-3">
                  <span>Proyek Berjalan</span>
                  <div className="w-8 h-8 rounded-xl bg-[#6456EB]/10 text-[#6456EB] flex items-center justify-center border border-[#6456EB]/20">
                    <FolderGit2 className="w-4 h-4 text-[#6456EB]" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl md:text-3xl font-semibold text-[#111215] font-tabular tracking-tight">
                    {activeProjects}
                  </div>
                  <span className="text-xs text-[#7E8492] font-normal">
                    inisiatif
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#111215]/6 flex items-center justify-between text-[11px] text-[#7E8492]">
                <span>Riset & Rekayasa</span>
                <Link
                  to="/projects"
                  className="text-[#6456EB] font-medium hover:underline inline-flex items-center"
                >
                  Katalog
                </Link>
              </div>
            </div>

            {/* 4. Anggota Aktif */}
            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs flex flex-col justify-between hover:border-[#111215]/15 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs text-[#7E8492] font-medium mb-3">
                  <span>Anggota Komunitas</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl md:text-3xl font-semibold text-[#111215] font-tabular tracking-tight">
                    {totalMembers}
                  </div>
                  <span className="text-xs text-[#7E8492] font-normal">
                    talenta
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#111215]/6 flex items-center justify-between text-[11px] text-[#7E8492]">
                <span>8 Pengurus Inti</span>
                <Link
                  to="/team"
                  className="text-[#6456EB] font-medium hover:underline inline-flex items-center"
                >
                  Direktori
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-semibold tracking-tight text-[#111215]">
                  Pintasan Operasional
                </h2>
                <p className="text-xs text-[#525660] mt-0.5">
                  Akses langsung modul administrasi dan sistem kerja organisasi
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Action 1 */}
              <Link
                to="/app/finance"
                className="p-5 rounded-2xl bg-white border border-[#111215]/8 hover:border-[#6456EB]/40 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EB] group-hover:bg-[#6456EB]/10 flex items-center justify-center text-[#111215] group-hover:text-[#6456EB] transition-colors mb-4 border border-[#111215]/6">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#111215] group-hover:text-[#6456EB] transition-colors flex items-center justify-between">
                    <span>Buka Buku Kas</span>
                    <ArrowUpRight className="w-4 h-4 text-[#7E8492] group-hover:text-[#6456EB] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-[#525660] mt-1.5 leading-relaxed">
                    Lihat rekapitulasi saldo, audit mutasi debet/kredit, dan arus
                    kas terbuka komunitas.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#111215]/6 text-[11px] font-medium text-[#6456EB]">
                  Lihat Pembukuan &rarr;
                </div>
              </Link>

              {/* Action 2 */}
              <Link
                to="/app/finance"
                className="p-5 rounded-2xl bg-white border border-[#111215]/8 hover:border-[#6456EB]/40 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EB] group-hover:bg-[#6456EB]/10 flex items-center justify-center text-[#111215] group-hover:text-[#6456EB] transition-colors mb-4 border border-[#111215]/6">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#111215] group-hover:text-[#6456EB] transition-colors flex items-center justify-between">
                    <span>Kelola Transaksi</span>
                    <ArrowUpRight className="w-4 h-4 text-[#7E8492] group-hover:text-[#6456EB] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-[#525660] mt-1.5 leading-relaxed">
                    Pengajuan draft pengeluaran (Maker) dan otorisasi verifikasi
                    nota sah (Checker).
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#111215]/6 text-[11px] font-medium text-[#6456EB]">
                  Maker-Checker Flow &rarr;
                </div>
              </Link>

              {/* Action 3 */}
              <Link
                to="/team"
                className="p-5 rounded-2xl bg-white border border-[#111215]/8 hover:border-[#6456EB]/40 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EB] group-hover:bg-[#6456EB]/10 flex items-center justify-center text-[#111215] group-hover:text-[#6456EB] transition-colors mb-4 border border-[#111215]/6">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#111215] group-hover:text-[#6456EB] transition-colors flex items-center justify-between">
                    <span>Daftar Tim</span>
                    <ArrowUpRight className="w-4 h-4 text-[#7E8492] group-hover:text-[#6456EB] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-[#525660] mt-1.5 leading-relaxed">
                    Struktur bagan organisasi, divisi pengurus harian, dan
                    profil seluruh talenta NCD.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#111215]/6 text-[11px] font-medium text-[#6456EB]">
                  Buka Struktur &rarr;
                </div>
              </Link>

              {/* Action 4 */}
              <Link
                to="/projects"
                className="p-5 rounded-2xl bg-white border border-[#111215]/8 hover:border-[#6456EB]/40 hover:shadow-sm transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#F4F1EB] group-hover:bg-[#6456EB]/10 flex items-center justify-center text-[#111215] group-hover:text-[#6456EB] transition-colors mb-4 border border-[#111215]/6">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#111215] group-hover:text-[#6456EB] transition-colors flex items-center justify-between">
                    <span>Katalog Proyek</span>
                    <ArrowUpRight className="w-4 h-4 text-[#7E8492] group-hover:text-[#6456EB] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </h3>
                  <p className="text-xs text-[#525660] mt-1.5 leading-relaxed">
                    Dokumentasi teknis aplikasi, repositori GitHub, demo live,
                    dan pendelegasian sprint.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#111215]/6 text-[11px] font-medium text-[#6456EB]">
                  Eksplorasi Proyek &rarr;
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity List / Pinned Operational Notifications */}
          <div className="bg-white rounded-2xl border border-[#111215]/8 p-6 md:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-[#111215]/8">
              <div>
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#6456EB]" />
                  <h2 className="text-lg md:text-xl font-semibold tracking-tight text-[#111215]">
                    Aktivitas & Notifikasi Operasional
                  </h2>
                </div>
                <p className="text-xs text-[#525660] mt-1">
                  Pemberitahuan audit sistem, status mutasi keuangan, dan agenda
                  resmi organisasi
                </p>
              </div>

              <div className="flex items-center space-x-2 text-xs text-[#7E8492]">
                <span className="w-2 h-2 rounded-full bg-[#6456EB]" />
                <span>Terakhir sinkronisasi realtime</span>
              </div>
            </div>

            <div className="divide-y divide-[#111215]/6">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-[#F4F1EB]/30 -mx-4 px-4 rounded-xl transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-9 h-9 rounded-xl bg-[#F4F1EB] border border-[#111215]/6 flex items-center justify-center shrink-0 mt-0.5">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs sm:text-sm font-medium text-[#111215] group-hover:text-[#6456EB] transition-colors leading-snug">
                        {act.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[#7E8492]">
                        {act.actor && (
                          <span className="font-medium text-[#525660]">
                            {act.actor}
                          </span>
                        )}
                        {act.actor && <span>•</span>}
                        <span>{act.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:self-center shrink-0 pl-12 sm:pl-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${getActivityBadgeClass(
                        act.type,
                        act.badge
                      )}`}
                    >
                      {act.badge || act.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
export default Dashboard
