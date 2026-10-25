import React, { lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { RouteMeta } from './components/RouteMeta'
import { Home } from './pages/Home'

// Route-level dynamic code-splitting: loads non-home modules on-demand
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })))
const Team = lazy(() => import('./pages/Team').then((m) => ({ default: m.Team })))
const Projects = lazy(() => import('./pages/Projects').then((m) => ({ default: m.Projects })))
const Achievements = lazy(() => import('./pages/Achievements').then((m) => ({ default: m.Achievements })))
const News = lazy(() => import('./pages/News').then((m) => ({ default: m.News })))
const Join = lazy(() => import('./pages/Join').then((m) => ({ default: m.Join })))
const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })))
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

function PageFallback() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#111215]/20 border-t-[#111215] rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('ncd_jwt')
  const user = localStorage.getItem('ncd_user')
  if (!token && !user) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F4F1EB] text-[#111215] selection:bg-[#6456EB] selection:text-white">
      <RouteMeta />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: shouldReduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
          >
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/team" element={<Team />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/news" element={<News />} />
              <Route path="/join" element={<Join />} />
              <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<Navigate to="/app" replace />} />
              <Route path="/app/finance" element={<Navigate to="/app" replace />} />
              <Route path="/finance" element={<Navigate to="/app" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </motion.div>
        </Suspense>
      </main>
      <Footer />
      {import.meta.env.PROD && typeof window !== 'undefined' && !window.location.hostname.includes('127.0.0.1') && !window.location.hostname.includes('localhost') && <Analytics />}
    </div>
  )
}
