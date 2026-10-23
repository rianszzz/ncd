import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  CheckCircle,
  Clock,
  Ban,
  Search,
  Filter,
  ExternalLink,
} from 'lucide-react'
import { api, CashSummary, Transaction } from '../services/api'
import { SummarySkeleton, TableRowSkeleton } from '../components/Skeletons'

export function Finance() {
  const [filterType, setFilterType] = useState<string>('ALL')
  const [filterCategory, setFilterCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)

  const { data: summary, isLoading: isSummaryLoading } = useQuery<CashSummary>({
    queryKey: ['financeSummary'],
    queryFn: async () => {
      const res = await api.get('/finance/summary')
      return res.data
    },
  })

  const { data: transactions, isLoading: isTxLoading } = useQuery<Transaction[]>({
    queryKey: ['financeTransactions'],
    queryFn: async () => {
      const res = await api.get('/finance/transactions')
      return res.data
    },
  })

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val)
  }

  const filteredTx = transactions?.filter((tx) => {
    const matchType = filterType === 'ALL' || tx.type === filterType
    const matchCategory = filterCategory === 'ALL' || tx.category_name === filterCategory
    const matchSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.transaction_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.maker_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchType && matchCategory && matchSearch
  })

  const categories = Array.from(new Set(transactions?.map((t) => t.category_name) || []))

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 text-left">
      {/* Header & Title */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Buku Kas Terbuka & Maker-Checker
        </h1>
        <p className="text-xs md:text-sm text-[#525660] mt-2 leading-relaxed max-w-2xl">
          Setiap mutasi dicatat oleh Bendahara I (Maker), diverifikasi oleh Bendahara II (Checker), dan dapat diaudit secara terbuka dengan bukti nota fisik.
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {isSummaryLoading ? (
          <>
            <SummarySkeleton />
            <SummarySkeleton />
            <SummarySkeleton />
            <SummarySkeleton />
          </>
        ) : (
          <>
            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#7E8492] mb-2 font-medium">
                <span>Saldo Kas Bersih</span>
                <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
              </div>
              <div className="text-2xl md:text-3xl font-semibold text-[#111215] font-tabular tracking-tight">
                {formatRupiah(summary?.current_balance || 0)}
              </div>
              <div className="text-[11px] text-[#7E8492] mt-2">Saldo resmi terverifikasi</div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#7E8492] mb-2 font-medium">
                <span>Total Pemasukan</span>
                <TrendingUp className="w-4 h-4 text-[#107C41]" />
              </div>
              <div className="text-2xl md:text-3xl font-semibold text-[#107C41] font-tabular tracking-tight">
                {formatRupiah(summary?.total_income || 0)}
              </div>
              <div className="text-[11px] text-[#7E8492] mt-2">Iuran & kas terhimpun</div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#7E8492] mb-2 font-medium">
                <span>Total Pengeluaran</span>
                <TrendingDown className="w-4 h-4 text-[#D83B01]" />
              </div>
              <div className="text-2xl md:text-3xl font-semibold text-[#D83B01] font-tabular tracking-tight">
                {formatRupiah(summary?.total_expense || 0)}
              </div>
              <div className="text-[11px] text-[#7E8492] mt-2">Operasional & kegiatan</div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#7E8492] mb-2 font-medium">
                <span>Menunggu Verifikasi</span>
                <Clock className="w-4 h-4 text-[#D97706]" />
              </div>
              <div className="text-2xl md:text-3xl font-semibold text-[#D97706] font-tabular tracking-tight">
                {summary?.pending_drafts || 0}
              </div>
              <div className="text-[11px] text-[#7E8492] mt-2">Draft menunggu Checker</div>
            </div>
          </>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#111215]/8 mb-6 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#7E8492] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari transaksi, deskripsi, maker..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#F4F1EB]/70 border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#F4F1EB] text-xs text-[#525660] border border-[#111215]/6">
            <Filter className="w-3.5 h-3.5 text-[#7E8492]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-[#111215] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="INCOME">Pemasukan (Debet)</option>
              <option value="EXPENSE">Pengeluaran (Kredit)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#F4F1EB] text-xs text-[#525660] border border-[#111215]/6">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-[#111215] focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#111215]/8 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F4F1EB]/50 border-b border-[#111215]/8 text-[#525660] font-medium">
              <tr>
                <th className="py-3.5 px-4">No. Transaksi</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Tipe & Kategori</th>
                <th className="py-3.5 px-4">Deskripsi</th>
                <th className="py-3.5 px-4">Nominal</th>
                <th className="py-3.5 px-4">Pembuat (Maker)</th>
                <th className="py-3.5 px-4">Status & Verifikator</th>
                <th className="py-3.5 px-4 text-center">Bukti Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111215]/5">
              {isTxLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : filteredTx?.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-xs text-[#7E8492]">
                    Tidak ada transaksi yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredTx?.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-[#F4F1EB]/40 transition-colors ${
                      tx.status === 'VOID' ? 'opacity-60 bg-red-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-tabular font-medium text-[#111215]">
                      {tx.transaction_number}
                    </td>
                    <td className="py-3.5 px-4 text-[#7E8492] whitespace-nowrap">
                      {tx.transaction_date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mr-1.5 ${
                          tx.type === 'INCOME'
                            ? 'bg-[#107C41]/10 text-[#107C41]'
                            : 'bg-[#D83B01]/10 text-[#D83B01]'
                        }`}
                      >
                        {tx.type === 'INCOME' ? 'DEBET' : 'KREDIT'}
                      </span>
                      <span className="text-[#111215] font-medium">{tx.category_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#525660] max-w-xs truncate" title={tx.description}>
                      {tx.description}
                      {tx.void_reason && (
                        <div className="text-[10px] text-[#D83B01] italic mt-0.5">
                          Alasan Void: {tx.void_reason} ({tx.void_by_name})
                        </div>
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-tabular font-semibold whitespace-nowrap ${
                        tx.type === 'INCOME' ? 'text-[#107C41]' : 'text-[#D83B01]'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#7E8492] text-[11px] whitespace-nowrap">
                      {tx.maker_name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.status === 'VERIFIED' && (
                        <div>
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-[#107C41]/10 text-[#107C41]">
                            <CheckCircle className="w-3 h-3" />
                            <span>Terverifikasi</span>
                          </span>
                          <div className="text-[9px] text-[#7E8492] mt-0.5">{tx.verifier_name}</div>
                        </div>
                      )}
                      {tx.status === 'DRAFT_PENDING' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-[#D97706]/10 text-[#D97706]">
                          <Clock className="w-3 h-3" />
                          <span>Pending Checker</span>
                        </span>
                      )}
                      {tx.status === 'VOID' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                          <Ban className="w-3 h-3" />
                          <span>Dibatalkan</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceipt(tx.receipt_url)}
                        className="p-1.5 rounded-lg text-[#6456EB] hover:bg-[#6456EB]/10 transition-colors inline-flex items-center space-x-1"
                        title="Lihat Bukti Nota/Transfer"
                      >
                        <Receipt className="w-4 h-4" />
                        <span className="text-[11px] font-medium">Nota</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Receipt Lightbox */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-4 shadow-2xl border border-[#111215]/8">
            <div className="flex items-center justify-between p-3 border-b border-[#111215]/8 mb-3">
              <span className="text-xs font-semibold text-[#111215]">Pratinjau Bukti Sah Transaksi</span>
              <a
                href={selectedReceipt}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#6456EB] hover:underline flex items-center space-x-1 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Buka Dokumen Asli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <img
              src={selectedReceipt}
              alt="Bukti Nota"
              className="w-full max-h-[70vh] object-contain rounded-xl bg-[#F4F1EB]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
