import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { CheckCircle2, AlertCircle, Send, Loader2, MapPin } from 'lucide-react'

export function Join() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_whatsapp: '',
    university: 'Universitas Gunadarma',
    major: '',
    generation: '',
    campus_domicile: 'Depok',
    referral_source: '',
    skills_interest: '',
    motivation: '',
    portfolio_links: '',
  })

  const [consent, setConsent] = useState(false)
  const [consentError, setConsentError] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20 text-left">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111215]">
          Formulir Pendaftaran Terbuka
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-[#525660] mt-3 max-w-xl mx-auto leading-relaxed">
          Bergabung bersama talenta rekayasa perangkat lunak dan riset mandiri NCD. Lengkapi data di bawah ini untuk ditinjau oleh Dewan Pengurus.
        </p>
      </div>

      {status === 'success' ? (
        <div className="p-8 sm:p-12 bg-white border border-[#111215]/20 shadow-xs text-center rounded-xl">
          <div className="w-16 h-16 rounded-full bg-[#107C41]/10 text-[#107C41] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#111215]">Pendaftaran Berhasil Dikirim</h2>
          <p className="text-xs sm:text-sm text-[#525660] mt-3 leading-relaxed max-w-md mx-auto">
            {message} Data Anda telah masuk ke sistem musyawarah pengurus untuk tahap voting penerimaan. Kami akan menghubungi via WhatsApp/Email resmi.
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
                generation: '',
                campus_domicile: 'Depok',
                referral_source: '',
                skills_interest: '',
                motivation: '',
                portfolio_links: '',
              })
              setConsent(false)
            }}
            className="mt-6 px-6 py-3 min-h-[44px] rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-xs sm:text-sm hover:bg-[#252830] active:scale-[0.98] transition-all cursor-pointer select-none"
          >
            Kirim Formulir Lain
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-5 sm:p-8 md:p-10 bg-white border border-[#111215]/20 shadow-xs space-y-5 rounded-xl"
        >
          {status === 'error' && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-[#D83B01] text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="input-full-name" className="block text-xs font-semibold text-[#111215] mb-1.5">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                id="input-full-name"
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="input-email" className="block text-xs font-semibold text-[#111215] mb-1.5">
                Email Aktif <span className="text-red-500">*</span>
              </label>
              <input
                id="input-email"
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label htmlFor="input-phone" className="block text-xs font-semibold text-[#111215] mb-1.5">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                id="input-phone"
                type="text"
                name="phone_whatsapp"
                required
                value={formData.phone_whatsapp}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="input-major" className="block text-xs font-semibold text-[#111215] mb-1.5">
                Jurusan Kuliah <span className="text-red-500">*</span>
              </label>
              <input
                id="input-major"
                type="text"
                name="major"
                required
                value={formData.major}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
              />
            </div>
          </div>

          {/* Angkatan (Input), Domisili Kampus (Choice), Darimana tau NCD? */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label htmlFor="input-generation" className="block text-xs font-semibold text-[#111215] mb-1.5">
                Angkatan <span className="text-red-500">*</span>
              </label>
              <input
                id="input-generation"
                type="text"
                name="generation"
                required
                value={formData.generation}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="select-domicile" className="block text-xs font-semibold text-[#111215] mb-1.5">
                Domisili Kampus <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="select-domicile"
                  name="campus_domicile"
                  value={formData.campus_domicile}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all cursor-pointer font-medium text-[#111215]"
                >
                  <option value="Depok">Depok</option>
                  <option value="Bekasi">Bekasi</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Tangerang">Tangerang</option>
                </select>
                <MapPin className="w-3.5 h-3.5 text-[#525660] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="input-referral" className="block text-xs font-semibold text-[#111215] mb-1.5">
                Darimana tau NCD? <span className="text-red-500">*</span>
              </label>
              <input
                id="input-referral"
                type="text"
                name="referral_source"
                required
                value={formData.referral_source}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label htmlFor="input-skills" className="block text-xs font-semibold text-[#111215] mb-1.5">
              Minat Divisi & Keahlian Teknis <span className="text-red-500">*</span>
            </label>
            <input
              id="input-skills"
              type="text"
              name="skills_interest"
              required
              value={formData.skills_interest}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="input-portfolio" className="block text-xs font-semibold text-[#111215] mb-1.5">
              Tautan Portofolio / GitHub / LinkedIn <span className="text-[#525660] font-normal">(Opsional)</span>
            </label>
            <input
              id="input-portfolio"
              type="text"
              name="portfolio_links"
              value={formData.portfolio_links}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
            />
          </div>

          <div>
            <label htmlFor="textarea-motivation" className="block text-xs font-semibold text-[#111215] mb-1.5">
              Motivasi Bergabung dengan NCD <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textarea-motivation"
              name="motivation"
              required
              rows={4}
              value={formData.motivation}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-[#F4F1EB]/40 border border-[#111215]/20 focus:border-[#111215] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 outline-none transition-all"
            />
          </div>

          {/* Privacy Consent (UU PDP) */}
          <div className="pt-2">
            <label
              className={`flex items-start space-x-2.5 text-xs text-[#525660] cursor-pointer p-3 rounded-lg border transition-colors ${
                consentError ? 'border-red-300 bg-red-50/50' : 'border-[#111215]/10 bg-[#F4F1EB]/20'
              }`}
            >
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => {
                  setConsent(e.target.checked)
                  if (e.target.checked) setConsentError(false)
                }}
                className="mt-0.5 rounded text-[#111215] focus:ring-black cursor-pointer"
              />
              <span className="leading-relaxed">
                Saya menyetujui bahwa data yang saya kirimkan digunakan semata-mata untuk keperluan seleksi internal NCD sesuai{' '}
                <Link to="/privacy" className="text-[#6456EB] underline font-medium" target="_blank">
                  Kebijakan Privasi & UU PDP
                </Link>
                .
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
            className="w-full py-3 min-h-[44px] rounded-xl bg-[#111215] text-[#F4F1EB] font-medium text-xs sm:text-sm hover:bg-[#252830] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 shadow-2xs disabled:opacity-50 mt-4 cursor-pointer disabled:cursor-not-allowed select-none"
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
