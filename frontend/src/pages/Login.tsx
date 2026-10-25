import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { KeyRound, ArrowRight, Loader2 } from 'lucide-react'

export function Login() {
  const navigate = useNavigate()
  const [accessKey, setAccessKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanKey = accessKey.trim()
    if (!cleanKey) {
      setError('Masukkan kunci akses / token portal.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', { key: cleanKey })
      if (res.data?.token) {
        localStorage.setItem('ncd_jwt', res.data.token)
      }
      if (res.data?.user) {
        localStorage.setItem('ncd_user', JSON.stringify(res.data.user))
      }
      navigate('/app')
    } catch {
      setError('Kunci akses tidak valid atau telah dicabut oleh God Admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12 md:py-20 text-left">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-[#111215] border border-black/20 flex items-center justify-center text-white mx-auto mb-4 shadow-2xs">
          <KeyRound className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#111215]">
          Portal Member NCD
        </h1>
        <p className="text-xs text-[#525660] mt-2">
          Masuk menggunakan Kunci Akses / Token yang diterbitkan oleh God Admin
        </p>
      </div>

      <div className="bg-white border border-[#111215]/20 p-6 sm:p-8 shadow-2xs">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-[#D83B01] text-xs font-medium border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium mb-1.5 text-[#111215]">
              Kunci Akses / Token 
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Masukkan Token Akses..."
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                autoComplete="off"
                spellCheck="false"
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F4F1EB] outline-none focus:bg-white focus:border-[#111215] border border-[#111215]/20 transition-all placeholder:text-[#525660] font-mono text-xs uppercase"
              />
            </div>
            <p className="text-[11px] text-[#525660] mt-1.5">
              Tidak membutuhkan email dan password. Cukup masukkan token unik role Anda.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 min-h-[44px] bg-[#111215] text-[#F4F1EB] font-medium hover:bg-[#252830] transition-all flex items-center justify-center space-x-2 shadow-2xs disabled:opacity-50 mt-2 cursor-pointer disabled:cursor-not-allowed border border-black"
          >
            <span>{loading ? 'Memvalidasi Kunci...' : 'Masuk Dasbor'}</span>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}
export default Login
