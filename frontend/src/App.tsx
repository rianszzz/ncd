import { Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { RouteMeta } from './components/RouteMeta'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Team } from './pages/Team'
import { Projects } from './pages/Projects'
import { Join } from './pages/Join'
import { Finance } from './pages/Finance'
import { Login } from './pages/Login'
import { Terms } from './pages/Terms'
import { Privacy } from './pages/Privacy'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F4F1EB] text-[#111215] selection:bg-[#6456EB] selection:text-white">
      <RouteMeta />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/team" element={<Team />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/join" element={<Join />} />
          <Route path="/app/finance" element={<Finance />} />
          <Route path="/login" element={<Login />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Analytics />
    </div>
  )
}
