import React, { useState } from 'react'
import { api } from '../services/api'
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowUpRight } from 'lucide-react'

export function Join() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_whatsapp: '',
    university: 'Universitas Gunadarma',
    major: '',
    generation: 'Angkatan 2024',
    skills_interest: '',
    motivation: '',
    portfolio_links: '',
  })

  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      alert('Mohon menyetujui syarat persetujuan pemrosesan data pendaftaran sesuai UU PDP.')
      return
    }

    setStatus('submitting')
    try {
      const res = await api.post('/public/apply', formData)
      setStatus('success')
      setMessage(res.data.message || 'Formulir berhasil terkirim.')
    } catch {
      setStatus('error')
      setMessage('Gagal mengirim formulir. Pastikan semua kolom wajib telah terisi.')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-left">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-[#6C4DF6]/10 text-[#6C4DF6] dark:text-[#8267FF] mb-4">
          <span>Rekrutmen Anggota NCD</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#101216] dark:text-white">
          Formulir Pendaftaran Terbuka
        </h1>
        <p className="text-sm text-[#585E6C] dark:text-[#949BA8] mt-3 leading-relaxed">
          Bergabung bersama 35 talenta teknologi NCD di bawah naungan NEXA Tech Labs. Silakan lengkapi profil dan motivasi Anda di bawah ini.
        </p>
      </div>

      {status === 'success' ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#101216]/80 border border-emerald-500/30 shadow-xs text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#101216] dark:text-white">Pendaftaran Berhasil Terkirim!</h2>
          <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-3 leading-relaxed max-w-md mx-auto">
            {message} Pengurus NCD akan meninjau berkas pendaftaran Anda dan menghubungi via WhatsApp/Email resmi.
          </p>
          <button
            onClick={() => {
              setStatus('idle')
              setFormData({
                full_name: '',
                email: '',
                phone_whatsapp: '',
                university: 'Universitas Gunadarma',
                major: '',
                generation: 'Angkatan 2024',
                skills_interest: '',
                motivation: '',
                portfolio_links: '',
              })
              setConsent(false)
            }}
            className="mt-6 px-6 py-2.5 rounded-full bg-[#6C4DF6] text-white font-semibold text-xs hover:bg-[#583BD9] transition-all"
          >
            Kirim Formulir Lain
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-3xl bg-white dark:bg-[#101216]/80 border border-[#101216]/8 dark:border-white/10 shadow-xs space-y-6"
        >
          {status === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="cth. Fauzan Al Farikhi"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#6C4DF6] dark:focus:border-[#8267FF] focus:bg-white dark:focus:bg-[#181B22] text-[#101216] dark:text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
                Email Aktif *
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="nama@student.gunadarma.ac.id"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#6C4DF6] dark:focus:border-[#8267FF] focus:bg-white dark:focus:bg-[#181B22] text-[#101216] dark:text-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
                Nomor WhatsApp *
              </label>
              <input
                type="text"
                name="phone_whatsapp"
                required
                placeholder="081234567890"
                value={formData.phone_whatsapp}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#6C4DF6] dark:focus:border-[#8267FF] focus:bg-white dark:focus:bg-[#181B22] text-[#101216] dark:text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
                Jurusan Kuliah *
              </label>
              <input
                type="text"
                name="major"
                required
                placeholder="cth. Informatika"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#6C4DF6] dark:focus:border-[#8267FF] focus:bg-white dark:focus:bg-[#181B22] text-[#101216] dark:text-white outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
                Angkatan *
              </label>
              <select
                name="generation"
                value={formData.generation}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent text-[#101216] dark:text-white outline-none"
              >
                <option value="Angkatan 2024">Angkatan 2024</option>
                <option value="Angkatan 2023">Angkatan 2023</option>
                <option value="Angkatan 2022">Angkatan 2022</option>
                <option value="Angkatan 2025">Angkatan 2025</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
              Divisi / Minat Keahlian *
            </label>
            <input
              type="text"
              name="skills_interest"
              required
              placeholder="cth. Backend (Go), Frontend (React), Mobile, UI/UX"
              value={formData.skills_interest}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#6C4DF6] dark:focus:border-[#8267FF] focus:bg-white dark:focus:bg-[#181B22] text-[#101216] dark:text-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
              Motivasi Bergabung NCD *
            </label>
            <textarea
              name="motivation"
              required
              rows={3}
              placeholder="Jelaskan alasan dan komitmen Anda dalam mengikuti inkubasi riset mandiri NCD..."
              value={formData.motivation}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#6C4DF6] dark:focus:border-[#8267FF] focus:bg-white dark:focus:bg-[#181B22] text-[#101216] dark:text-white outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#101216] dark:text-white mb-1.5">
              Tautan Portofolio / GitHub / LinkedIn
            </label>
            <input
              type="text"
              name="portfolio_links"
              placeholder="https://github.com/username atau https://linkedin.com/in/username"
              value={formData.portfolio_links}
              onChange={handleChange}
              className="w-full px-4 py-2.5 text-xs rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-[#6C4DF6] dark:focus:border-[#8267FF] focus:bg-white dark:focus:bg-[#181B22] text-[#101216] dark:text-white outline-none transition-all"
            />
          </div>

          {/* UU PDP Consent Affirmation Box */}
          <div className="p-4 rounded-2xl bg-[#6C4DF6]/5 dark:bg-[#8267FF]/10 border border-[#6C4DF6]/20 dark:border-[#8267FF]/20">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 accent-[#6C4DF6] dark:accent-[#8267FF]"
              />
              <label htmlFor="consent" className="text-xs text-[#585E6C] dark:text-[#949BA8] leading-relaxed cursor-pointer select-none">
                <strong className="text-[#101216] dark:text-white flex items-center space-x-1 mb-0.5 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6C4DF6] dark:text-[#8267FF]" />
                  <span>Persetujuan Pemrosesan Data Pribadi (UU PDP No. 27/2022)</span>
                </strong>
                Saya menyatakan data yang saya kirimkan adalah benar dan memberikan persetujuan kepada Pengurus NCD untuk memproses data ini semata-mata untuk keperluan seleksi dan komunikasi resmi komunitas.
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3.5 rounded-full bg-[#101216] dark:bg-white text-white dark:text-[#101216] font-semibold text-xs tracking-wider hover:bg-[#6C4DF6] dark:hover:bg-[#8267FF] dark:hover:text-white transition-all flex items-center justify-center space-x-1.5 shadow-xs disabled:opacity-50"
          >
            <span>{status === 'submitting' ? 'Mengirim Formulir...' : 'Kirim Pendaftaran Seleksi'}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  )
}
