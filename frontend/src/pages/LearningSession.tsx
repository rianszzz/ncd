import { Navigate, useSearchParams } from 'react-router-dom'

export function LearningSession() {
  const [searchParams] = useSearchParams()
  const targetClass = searchParams.get('class')

  const token = typeof window !== 'undefined' ? localStorage.getItem('ncd_jwt') : null
  const localUserRaw = typeof window !== 'undefined' ? localStorage.getItem('ncd_user') : null
  const localUser = localUserRaw ? JSON.parse(localUserRaw) : null
  const isLoggedIn = Boolean(token && localUser)

  const destUrl = targetClass
    ? `/app?tab=learning-session&class=${encodeURIComponent(targetClass)}`
    : '/app?tab=learning-session'

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(destUrl)}`} replace />
  }

  return <Navigate to={destUrl} replace />
}

export default LearningSession
