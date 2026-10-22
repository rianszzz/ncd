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
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6] flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#101216]">Portal Member NCD</h1>
        <p className="text-xs text-[#585E6C] mt-1.5">
          Area terproteksi bagi 35 anggota dan pengurus NEXA Community Development
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-[#101216]/10 p-8 shadow-xs">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[#101216]">Email Akun *</label>
            <input
              type="email"
              required
              placeholder="nama@ncd.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 outline-none focus:bg-white focus:border-[#6C4DF6] border border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#101216]">Kata Sandi *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/5 outline-none focus:bg-white focus:border-[#6C4DF6] border border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#6C4DF6] text-white font-semibold hover:bg-[#583BD9] transition-all flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <span>{loading ? 'Mengautentikasi...' : 'Masuk Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Testing Role Switcher */}
        <div className="mt-8 pt-6 border-t border-[#101216]/10 text-left">
          <div className="text-[11px] font-bold text-[#585E6C] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#6C4DF6]" />
            <span>Pintasan Uji Coba Akun Pengurus:</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <button
              onClick={() => handleQuickLogin('godadmin@ncd.dev')}
              className="p-2 rounded-lg bg-black/5 hover:bg-[#6C4DF6]/10 hover:text-[#6C4DF6] text-left transition-colors"
            >
              <span className="font-bold block text-[#101216]">Rianszzz</span>
              <span className="text-[10px] text-[#585E6C]">God Admin</span>
            </button>
            <button
              onClick={() => handleQuickLogin('chairman@ncd.dev')}
              className="p-2 rounded-lg bg-black/5 hover:bg-[#6C4DF6]/10 hover:text-[#6C4DF6] text-left transition-colors"
            >
              <span className="font-bold block text-[#101216]">Mirza Danisywar</span>
              <span className="text-[10px] text-[#585E6C]">Chairman</span>
            </button>
            <button
              onClick={() => handleQuickLogin('bendahara1@ncd.dev')}
              className="p-2 rounded-lg bg-black/5 hover:bg-[#6C4DF6]/10 hover:text-[#6C4DF6] text-left transition-colors"
            >
              <span className="font-bold block text-[#101216]">Iqbal Fajri</span>
              <span className="text-[10px] text-[#107C41]">Bendahara I (Maker)</span>
            </button>
            <button
              onClick={() => handleQuickLogin('bendahara2@ncd.dev')}
              className="p-2 rounded-lg bg-black/5 hover:bg-[#6C4DF6]/10 hover:text-[#6C4DF6] text-left transition-colors"
            >
              <span className="font-bold block text-[#101216]">Sri Gunarti</span>
              <span className="text-[10px] text-sky-700">Bendahara II (Checker)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
