import React, { useState, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { ArrowRight, Loader2 } from 'lucide-react'
import { NcdPortalAvatar } from '../components/portal/NcdPortalAvatar'

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [accessKey, setAccessKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccessKey(e.target.value)
    if (error) setError('')
    setIsTyping(true)
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1100)
  }

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

      setIsSuccess(true)

      const redirectPath = searchParams.get('redirect')
      const targetClass = searchParams.get('class')
      setTimeout(() => {
        if (redirectPath) {
          const dest = targetClass ? `${redirectPath}?class=${encodeURIComponent(targetClass)}` : redirectPath
          navigate(dest)
        } else {
          navigate('/app')
        }
      }, 500)
    } catch {
      setError('Kunci akses tidak valid atau telah dicabut oleh God Admin.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-6 py-12 md:py-16 text-left">
      <div className="text-center mb-8">
        {/* Interactive Avatar replacing former key box */}
        <div className="flex justify-center mb-3">
          <NcdPortalAvatar
            isTyping={isTyping}
            isFocused={isFocused}
            hasError={Boolean(error)}
            isLoading={loading}
            isSuccess={isSuccess}
            size={116}
          />
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
            <label htmlFor="token-input" className="block font-medium mb-1.5 text-[#111215]">
              Kunci Akses / Token 
            </label>
            <div className="relative">
              <input
                id="token-input"
                type="text"
                required
                value={accessKey}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false)
                  setIsTyping(false)
                }}
                autoComplete="off"
                spellCheck="false"
                className="w-full px-3.5 py-2.5 min-h-[44px] bg-[#F4F1EB] outline-none focus:bg-white focus:border-[#111215] focus-visible:ring-2 focus-visible:ring-[#111215] focus-visible:ring-offset-2 border border-[#111215]/20 transition-all font-mono text-xs uppercase"
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
