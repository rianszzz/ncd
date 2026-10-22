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
      setError('Kredensial tidak valid. Silakan gunakan tombol simulasi peran di bawah.')
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
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-[#6C4DF6] dark:bg-[#8267FF] flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-[#101216] dark:text-white">Portal Member NCD</h1>
        <p className="text-xs text-[#585E6C] dark:text-[#949BA8] mt-1.5">
          Area terproteksi bagi 35 anggota &amp; pengurus NEXA Community Development
        </p>
      </div>

      <div className="bg-white dark:bg-[#101216]/80 rounded-3xl border border-[#101216]/8 dark:border-white/10 p-8 shadow-xs">
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1 text-[#101216] dark:text-white">Email Akun *</label>
            <input
              type="email"
              required
              placeholder="nama@ncd.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 outline-none focus:bg-white dark:focus:bg-[#181B22] focus:border-[#6C4DF6] dark:focus:border-[#8267FF] text-[#101216] dark:text-white border border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-[#101216] dark:text-white">Kata Sandi *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 outline-none focus:bg-white dark:focus:bg-[#181B22] focus:border-[#6C4DF6] dark:focus:border-[#8267FF] text-[#101216] dark:text-white border border-transparent transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-[#101216] dark:bg-white text-white dark:text-[#101216] font-semibold hover:bg-[#6C4DF6] dark:hover:bg-[#8267FF] dark:hover:text-white transition-all flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50"
          >
            <span>{loading ? 'Mengautentikasi...' : 'Masuk Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Testing Role Switcher */}
        <div className="mt-8 pt-6 border-t border-[#101216]/8 dark:border-white/10 text-left">
          <div className="text-[11px] font-semibold text-[#585E6C] dark:text-[#949BA8] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#6C4DF6] dark:text-[#8267FF]" />
            <span>Pintasan Uji Coba Akun:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              onClick={() => handleQuickLogin('godadmin@ncd.dev')}
              className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#6C4DF6]/10 dark:hover:bg-[#8267FF]/10 text-left transition-colors"
            >
              <span className="font-bold block text-[#101216] dark:text-white">Rianszzz</span>
              <span className="text-[10px] text-[#585E6C] dark:text-[#949BA8]">God Admin</span>
            </button>

            <button
              onClick={() => handleQuickLogin('farhan@ncd.dev')}
              className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#6C4DF6]/10 dark:hover:bg-[#8267FF]/10 text-left transition-colors"
            >
              <span className="font-bold block text-[#101216] dark:text-white">Farhan</span>
              <span className="text-[10px] text-[#585E6C] dark:text-[#949BA8]">Ketua Umum</span>
            </button>

            <button
              onClick={() => handleQuickLogin('iqbal@ncd.dev')}
              className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#6C4DF6]/10 dark:hover:bg-[#8267FF]/10 text-left transition-colors"
            >
              <span className="font-bold block text-[#101216] dark:text-white">Iqbal</span>
              <span className="text-[10px] text-[#585E6C] dark:text-[#949BA8]">Bendahara I (Maker)</span>
            </button>

            <button
              onClick={() => handleQuickLogin('alfi@ncd.dev')}
              className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-[#6C4DF6]/10 dark:hover:bg-[#8267FF]/10 text-left transition-colors"
            >
              <span className="font-bold block text-[#101216] dark:text-white">Alfi</span>
              <span className="text-[10px] text-[#585E6C] dark:text-[#949BA8]">Bendahara II (Checker)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
