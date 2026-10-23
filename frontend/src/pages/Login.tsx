import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Lock, UserCheck, ArrowRight } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { email, password })
      localStorage.setItem('ncd_user', JSON.stringify(res.data.user))
      navigate('/app/finance')
    } catch {
      setError('Kredensial tidak valid. Silakan coba akun pengurus yang tersedia.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = (testEmail: string) => {
    setEmail(testEmail)
    setPassword('password123')
  }

  return (
    <div className="max-w-md mx-auto px-6 py-20 text-left">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-xl bg-[#111215] flex items-center justify-center text-white mx-auto mb-4 shadow-2xs">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111215]">Portal Member NCD</h1>
        <p className="text-xs text-[#525660] mt-2">
          Area terproteksi bagi anggota dan pengurus NEXA Community Development
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#111215]/8 p-8 shadow-2xs">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-[#D83B01] text-xs font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1.5 text-[#111215]">Email Akun *</label>
            <input
              type="email"
              required
              placeholder="nama@ncd.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F1EB] outline-none focus:bg-white focus:border-[#111215]/20 border border-transparent transition-all placeholder:text-[#7E8492]"
            />
          </div>

          <div>
            <label className="block font-medium mb-1.5 text-[#111215]">Kata Sandi *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F4F1EB] outline-none focus:bg-white focus:border-[#111215]/20 border border-transparent transition-all placeholder:text-[#7E8492]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#111215] text-[#F4F1EB] font-medium hover:bg-[#252830] transition-all flex items-center justify-center space-x-2 shadow-2xs disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Mengautentikasi...' : 'Masuk Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Testing Role Switcher */}
        <div className="mt-8 pt-6 border-t border-[#111215]/8 text-left">
          <div className="text-[11px] font-semibold text-[#7E8492] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#6456EB]" />
            <span>Pintasan Uji Coba Akun Pengurus:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleQuickLogin('godadmin@ncd.dev')}
              className="p-2.5 rounded-xl bg-[#F4F1EB] hover:bg-[#111215]/10 text-left transition-colors"
            >
              <span className="font-semibold block text-[#111215]">Rianszzz</span>
              <span className="text-[10px] text-[#7E8492]">God Admin</span>
            </button>
            <button
              onClick={() => handleQuickLogin('chairman@ncd.dev')}
              className="p-2.5 rounded-xl bg-[#F4F1EB] hover:bg-[#111215]/10 text-left transition-colors"
            >
              <span className="font-semibold block text-[#111215]">Mirza Danisywar</span>
              <span className="text-[10px] text-[#7E8492]">Chairman</span>
            </button>
            <button
              onClick={() => handleQuickLogin('bendahara1@ncd.dev')}
              className="p-2.5 rounded-xl bg-[#F4F1EB] hover:bg-[#111215]/10 text-left transition-colors"
            >
              <span className="font-semibold block text-[#111215]">Iqbal Fajri</span>
              <span className="text-[10px] text-[#107C41]">Bendahara I (Maker)</span>
            </button>
            <button
              onClick={() => handleQuickLogin('bendahara2@ncd.dev')}
              className="p-2.5 rounded-xl bg-[#F4F1EB] hover:bg-[#111215]/10 text-left transition-colors"
            >
              <span className="font-semibold block text-[#111215]">Sri Gunarti</span>
              <span className="text-[10px] text-[#0071E3]">Bendahara II (Checker)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
