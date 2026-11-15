import { Navigate, useSearchParams } from 'react-router-dom'
import { isAuthenticated } from '../services/api'

export function LearningSession() {
  const [searchParams] = useSearchParams()
  const targetClass = searchParams.get('class')
  const isLoggedIn = isAuthenticated()

  const destUrl = targetClass
    ? `/app?tab=learning-session&class=${encodeURIComponent(targetClass)}`
    : '/app?tab=learning-session'

  if (!isLoggedIn) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(destUrl)}`} replace />
  }

  return <Navigate to={destUrl} replace />
}

export default LearningSession
