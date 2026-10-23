import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react'

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
  const [consentError, setConsentError] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!consent) {
      setConsentError(true)
      return
    }
    setConsentError(false)

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
    <div className="max-w-3xl mx-auto px-6 py-20 text-left">
      <div className="text-center mb-14">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-[#111215]">
          Formulir Pendaftaran Terbuka
        </h1>
        <p className="text-sm md:text-base text-[#525660] mt-3.5 leading-relaxed">
          Bergabung bersama talenta teknologi NCD di bawah naungan NEXA Tech Labs. Silakan lengkapi profil dan motivasi Anda di bawah ini.
        </p>
      </div>

      {status === 'success' ? (
        <div className="p-10 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs text-center">
          <div className="w-16 h-16 rounded-full bg-[#107C41]/10 text-[#107C41] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-[#111215]">Pendaftaran Berhasil Terkirim</h2>
          <p className="text-sm text-[#525660] mt-3 leading-relaxed max-w-md mx-auto">
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
            className="mt-6 px-5 py-2.5 rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-xs hover:bg-[#252830] transition-all"
          >
            Kirim Formulir Lain
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-8 md:p-10 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs space-y-5">
          {status === 'error' && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-[#D83B01] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#111215] mb-1.5">Nama Lengkap *</label>
              <input
                type="text"
                name="full_name"
                required
                placeholder="cth. Fauzan Al Farikhi"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111215] mb-1.5">Email Aktif *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="nama@student.gunadarma.ac.id"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#111215] mb-1.5">Nomor WhatsApp *</label>
              <input
                type="text"
                name="phone_whatsapp"
                required
                placeholder="081234567890"
                value={formData.phone_whatsapp}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111215] mb-1.5">Jurusan Kuliah *</label>
              <input
                type="text"
                name="major"
                required
                placeholder="cth. Informatika / Sistem Informasi"
                value={formData.major}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#111215] mb-1.5">Angkatan *</label>
              <select
                name="generation"
                value={formData.generation}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all"
              >
                <option value="Angkatan 2024">Angkatan 2024</option>
                <option value="Angkatan 2023">Angkatan 2023</option>
                <option value="Angkatan 2022">Angkatan 2022</option>
                <option value="Angkatan 2025">Angkatan 2025</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111215] mb-1.5">Minat Divisi & Keahlian Teknis *</label>
            <input
              type="text"
              name="skills_interest"
              required
              placeholder="cth. Backend Go, React Frontend, UI/UX Design, Competitive Programming"
              value={formData.skills_interest}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111215] mb-1.5">Tautan Portofolio / GitHub / LinkedIn</label>
            <input
              type="text"
              name="portfolio_links"
              placeholder="https://github.com/username atau https://linkedin.com/in/username"
              value={formData.portfolio_links}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#111215] mb-1.5">Motivasi Bergabung dengan NCD *</label>
            <textarea
              name="motivation"
              required
              rows={4}
              placeholder="Ceritakan tujuan Anda bergabung dan apa kontribusi yang ingin Anda berikan bagi komunitas..."
              value={formData.motivation}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[#F4F1EB] border border-transparent focus:border-[#111215]/20 focus:bg-white outline-none transition-all placeholder:text-[#7E8492]"
            />
          </div>

          {/* Privacy Consent (UU PDP) */}
          <div className="pt-2">
            <label className={`flex items-start space-x-2.5 text-xs text-[#525660] cursor-pointer p-3 rounded-xl border transition-colors ${consentError ? 'border-red-300 bg-red-50/50' : 'border-transparent'}`}>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  if (e.target.checked) setConsentError(false)
                }}
                className="mt-0.5 rounded text-[#111215] focus:ring-black"
              />
              <span className="leading-relaxed">
                Saya menyetujui bahwa data yang saya kirimkan digunakan semata-mata untuk keperluan seleksi internal NCD sesuai <Link to="/privacy" className="text-[#6456EB] underline font-medium" target="_blank">Kebijakan Privasi & UU PDP</Link>.
              </span>
            </label>
            {consentError && (
              <p className="text-[11px] text-red-600 mt-1 pl-3 font-medium">
                * Wajib menyetujui persetujuan pemrosesan data pendaftaran sesuai UU PDP.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-3 rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-xs hover:bg-[#252830] transition-all flex items-center justify-center space-x-2 shadow-2xs disabled:opacity-50 mt-4 cursor-pointer disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{status === 'submitting' ? 'Mengirim Berkas...' : 'Kirim Berkas Pendaftaran'}</span>
          </button>
        </form>
      )}
    </div>
  )
}
