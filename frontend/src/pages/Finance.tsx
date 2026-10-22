import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, CashSummary, Transaction } from '../services/api'
import {
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  PlusCircle,
  FileCheck,
  Ban,
  Receipt,
  CheckCircle,
  X,
  ExternalLink
} from 'lucide-react'

export function Finance() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'VOID'>('ALL')
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [voidModalTx, setVoidModalTx] = useState<Transaction | null>(null)
  const [voidReason, setVoidReason] = useState('')

  // New Transaction Form State
  const [newTx, setNewTx] = useState({
    type: 'EXPENSE',
    category_name: 'Operasional & Event',
    amount: 150000,
    description: '',
    person_in_charge: 'Muhammad Iqbal Fajri',
    receipt_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    transaction_date: new Date().toISOString().split('T')[0],
  })

  // Queries
  const { data: summary } = useQuery<CashSummary>({
    queryKey: ['cash-summary'],
    queryFn: async () => {
      const res = await api.get('/finance/summary')
      return res.data
    },
  })

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: async () => {
      const res = await api.get('/finance/transactions')
      return res.data
    },
  })

  // Mutations
  const createTxMutation = useMutation({
    mutationFn: async (data: typeof newTx) => {
      return await api.post('/finance/transactions', data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-summary'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setIsAddModalOpen(false)
      alert('Draft transaksi berhasil dicatat! Menunggu verifikasi dari Bendahara II.')
    },
  })

  const verifyTxMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.post(`/finance/transactions/${id}/verify`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-summary'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      alert('Transaksi berhasil diverifikasi dan disahkan oleh Bendahara II!')
    },
  })

  const voidTxMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await api.post(`/finance/transactions/${id}/void`, { reason })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-summary'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setVoidModalTx(null)
      setVoidReason('')
      alert('Transaksi berhasil dibatalkan (VOID). Catatan audit tersimpan abadi.')
    },
  })

  const filteredTx = transactions?.filter((tx) => {
    if (activeTab === 'ALL') return true
    return tx.status === activeTab
  })

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Transparansi Finansial Komunitas</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#101216]">
            Buku Kas Terbuka & Maker-Checker
          </h1>
          <p className="text-xs text-[#585E6C] mt-1.5 leading-relaxed">
            Setiap rupiah dicatat oleh Bendahara I (Maker), diverifikasi oleh Bendahara II (Checker), dan dapat diaudit oleh seluruh 35 anggota.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[#6C4DF6] text-white text-xs font-semibold hover:bg-[#583BD9] transition-all flex items-center space-x-2 shadow-xs shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Input Draft Kas (Bendahara I)</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#585E6C] mb-2 font-medium">
            <span>Saldo Kas Bersih</span>
            <span className="w-2 h-2 rounded-full bg-[#107C41]"></span>
          </div>
          <div className="text-2xl font-bold text-[#101216] font-tabular">
            {formatRupiah(summary?.current_balance || 0)}
          </div>
          <div className="text-[11px] text-[#585E6C] mt-2">Saldo resmi terverifikasi</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#585E6C] mb-2 font-medium">
            <span>Total Pemasukan</span>
            <TrendingUp className="w-4 h-4 text-[#107C41]" />
          </div>
          <div className="text-2xl font-bold text-[#107C41] font-tabular">
            {formatRupiah(summary?.total_income || 0)}
          </div>
          <div className="text-[11px] text-[#585E6C] mt-2">Iuran, hadiah lomba & sponsor</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#585E6C] mb-2 font-medium">
            <span>Total Pengeluaran</span>
            <TrendingDown className="w-4 h-4 text-[#D83B01]" />
          </div>
          <div className="text-2xl font-bold text-[#D83B01] font-tabular">
            {formatRupiah(summary?.total_expense || 0)}
          </div>
          <div className="text-[11px] text-[#585E6C] mt-2">Infrastruktur & operasional</div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-[#101216]/10 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#585E6C] mb-2 font-medium">
            <span>Menunggu Verifikasi</span>
            <Clock className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="text-2xl font-bold text-[#D97706] font-tabular">
            {summary?.pending_drafts || 0} Draft
          </div>
          <div className="text-[11px] text-[#585E6C] mt-2">Perlu disahkan Bendahara II</div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center space-x-2 border-b border-[#101216]/10 pb-3 mb-6">
        {[
          { key: 'ALL', label: 'Semua Mutasi' },
          { key: 'DRAFT_PENDING', label: 'Menunggu Verifikasi (Pending)' },
          { key: 'VERIFIED', label: 'Terverifikasi (Resmi)' },
          { key: 'VOID', label: 'Dibatalkan (Void)' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[#101216] text-white shadow-xs'
                : 'text-[#585E6C] hover:bg-black/5 hover:text-[#101216]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-[#101216]/10 overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="text-center py-16 text-xs text-[#585E6C]">Memuat data mutasi buku kas...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/5 text-[#585E6C] font-semibold border-b border-[#101216]/10 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">No. Transaksi</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Tipe & Kategori</th>
                  <th className="py-3 px-4">Deskripsi</th>
                  <th className="py-3 px-4">Nominal</th>
                  <th className="py-3 px-4">Pembuat (Maker)</th>
                  <th className="py-3 px-4">Status & Verifikator</th>
                  <th className="py-3 px-4 text-center">Nota</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#101216]/5">
                {filteredTx?.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`hover:bg-black/2 transition-colors ${
                      tx.status === 'VOID' ? 'opacity-60 bg-red-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-tabular font-semibold text-[#101216]">
                      {tx.transaction_number}
                    </td>
                    <td className="py-3.5 px-4 text-[#585E6C] whitespace-nowrap">
                      {tx.transaction_date}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-1.5 ${
                          tx.type === 'INCOME'
                            ? 'bg-[#107C41]/10 text-[#107C41]'
                            : 'bg-[#D83B01]/10 text-[#D83B01]'
                        }`}
                      >
                        {tx.type === 'INCOME' ? 'DEBET' : 'KREDIT'}
                      </span>
                      <span className="text-[#101216] font-medium">{tx.category_name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#585E6C] max-w-xs truncate" title={tx.description}>
                      {tx.description}
                      {tx.void_reason && (
                        <div className="text-[10px] text-red-600 italic mt-0.5">
                          Alasan Void: {tx.void_reason} ({tx.void_by_name})
                        </div>
                      )}
                    </td>
                    <td
                      className={`py-3.5 px-4 font-tabular font-bold whitespace-nowrap ${
                        tx.type === 'INCOME' ? 'text-[#107C41]' : 'text-[#D83B01]'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[#585E6C] text-[11px] whitespace-nowrap">
                      {tx.maker_name}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.status === 'VERIFIED' && (
                        <div>
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800">
                            <CheckCircle className="w-3 h-3" />
                            <span>Terverifikasi</span>
                          </span>
                          <div className="text-[9px] text-[#585E6C] mt-0.5">{tx.verifier_name}</div>
                        </div>
                      )}
                      {tx.status === 'DRAFT_PENDING' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          <Clock className="w-3 h-3" />
                          <span>Pending Checker</span>
                        </span>
                      )}
                      {tx.status === 'VOID' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          <Ban className="w-3 h-3" />
                          <span>Dibatalkan</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedReceipt(tx.receipt_url)}
                        className="p-1.5 rounded-lg text-[#6C4DF6] hover:bg-[#6C4DF6]/10 transition-colors"
                        title="Lihat Bukti Nota/Transfer"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        {tx.status === 'DRAFT_PENDING' && (
                          <button
                            onClick={() => verifyTxMutation.mutate(tx.id)}
                            className="px-2.5 py-1 rounded bg-[#107C41] text-white text-[10px] font-semibold hover:bg-[#0e6b38] transition-colors flex items-center space-x-1"
                            title="Sahkan & Verifikasi sebagai Bendahara II"
                          >
                            <FileCheck className="w-3 h-3" />
                            <span>Sahkan (B2)</span>
                          </button>
                        )}
                        {tx.status !== 'VOID' && (
                          <button
                            onClick={() => setVoidModalTx(tx)}
                            className="px-2 py-1 rounded border border-red-200 text-red-600 text-[10px] font-semibold hover:bg-red-50 transition-colors"
                            title="Batalkan Mutasi (Super Admin)"
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Input New Transaction (Maker - Bendahara I) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-[#101216]/10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#101216]/10">
              <h3 className="font-bold text-base text-[#101216]">Input Draft Mutasi Kas (Bendahara I)</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[#585E6C] hover:text-[#101216]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Tipe Mutasi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'INCOME' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newTx.type === 'INCOME'
                        ? 'bg-[#107C41] text-white border-[#107C41]'
                        : 'bg-white border-[#101216]/10 text-[#585E6C]'
                    }`}
                  >
                    + Pemasukan (Debet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTx({ ...newTx, type: 'EXPENSE' })}
                    className={`py-2 rounded-xl font-bold border transition-all ${
                      newTx.type === 'EXPENSE'
                        ? 'bg-[#D83B01] text-white border-[#D83B01]'
                        : 'bg-white border-[#101216]/10 text-[#585E6C]'
                    }`}
                  >
                    - Pengeluaran (Kredit)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Kategori Biaya</label>
                <select
                  value={newTx.category_name}
                  onChange={(e) => setNewTx({ ...newTx, category_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none"
                >
                  <option value="Iuran Anggota">Iuran Anggota</option>
                  <option value="Operasional & Event">Operasional & Event</option>
                  <option value="Infrastruktur & Cloud">Infrastruktur & Cloud</option>
                  <option value="Konsumsi & Rapat Kerja">Konsumsi & Rapat Kerja</option>
                  <option value="Hadiah Kompetisi">Hadiah Kompetisi</option>
                  <option value="Perlengkapan Teknis">Perlengkapan Teknis</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Nominal (Rupiah)</label>
                <input
                  type="number"
                  value={newTx.amount}
                  onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none font-tabular text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={2}
                  value={newTx.description}
                  onChange={(e) => setNewTx({ ...newTx, description: e.target.value })}
                  placeholder="cth. Pembelian domain ncd.nexatechlabs.my.id"
                  className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Penanggung Jawab (PIC)</label>
                <input
                  type="text"
                  value={newTx.person_in_charge}
                  onChange={(e) => setNewTx({ ...newTx, person_in_charge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Bukti Struk/Nota Transfer (URL Foto)</label>
                <input
                  type="text"
                  value={newTx.receipt_url}
                  onChange={(e) => setNewTx({ ...newTx, receipt_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-black/5 outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-black/5 text-xs font-semibold hover:bg-black/10"
              >
                Batal
              </button>
              <button
                onClick={() => createTxMutation.mutate(newTx)}
                disabled={!newTx.description || newTx.amount <= 0}
                className="px-4 py-2 rounded-xl bg-[#6C4DF6] text-white text-xs font-semibold hover:bg-[#583BD9] disabled:opacity-50"
              >
                Simpan Draft Mutasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Void Transaction (Super Admin) */}
      {voidModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl border border-red-200">
            <h3 className="font-bold text-base text-red-600 mb-2">Batalkan Mutasi Kas (VOID)</h3>
            <p className="text-xs text-[#585E6C] mb-4">
              Transaksi <strong>{voidModalTx.transaction_number}</strong> tidak akan dihapus dari database (anti-delete), melainkan ditandai VOID dan dicatat ke Audit Trail.
            </p>

            <label className="block text-xs font-semibold mb-1">Alasan Pembatalan Resmi *</label>
            <textarea
              rows={3}
              required
              placeholder="Sebutkan alasan detail (misal: nota salah input oleh vendor)..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/5 text-xs outline-none mb-4"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setVoidModalTx(null)}
                className="px-4 py-2 rounded-xl bg-black/5 text-xs font-semibold hover:bg-black/10"
              >
                Batal
              </button>
              <button
                onClick={() => voidTxMutation.mutate({ id: voidModalTx.id, reason: voidReason })}
                disabled={!voidReason}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                Konfirmasi VOID
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Receipt Lightbox */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 cursor-pointer"
        >
          <div className="relative max-w-2xl w-full bg-white rounded-3xl overflow-hidden p-3 shadow-2xl">
            <div className="flex items-center justify-between p-3 border-b border-[#101216]/10 mb-2">
              <span className="text-xs font-bold text-[#101216]">Pratinjau Bukti Sah Transaksi</span>
              <a
                href={selectedReceipt}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#6C4DF6] hover:underline flex items-center space-x-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Buka Ukuran Asli</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <img
              src={selectedReceipt}
              alt="Bukti Nota"
              className="w-full max-h-[70vh] object-contain rounded-2xl bg-black/5"
            />
          </div>
        </div>
      )}
    </div>
  )
}
