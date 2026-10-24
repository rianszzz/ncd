import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
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
const Finance = lazy(() => import('./pages/Finance').then((m) => ({ default: m.Finance })))
const Login = lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })))
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })))
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })))
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })))

function PageFallback() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 animate-pulse text-left">
      <div className="w-56 h-8 rounded-xl bg-[#111215]/10 mb-4" />
      <div className="w-80 h-4 rounded bg-[#111215]/6 mb-12" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="h-64 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs" />
        <div className="h-64 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs" />
        <div className="h-64 rounded-2xl bg-white border border-[#111215]/8 shadow-2xs" />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F4F1EB] text-[#111215] selection:bg-[#6456EB] selection:text-white">
      <RouteMeta />
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/team" element={<Team />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/news" element={<News />} />
            <Route path="/join" element={<Join />} />
            <Route path="/app" element={<Dashboard />} />
            <Route path="/app/finance" element={<Finance />} />
            <Route path="/login" element={<Login />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <Analytics />
    </div>
  )
}
