import { Routes, Route } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Team } from './pages/Team'
import { Projects } from './pages/Projects'
import { Join } from './pages/Join'
import { Finance } from './pages/Finance'
import { Login } from './pages/Login'

export default function App() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#F4F1EA] dark:bg-[#07080A] text-[#101216] dark:text-[#F4F1EA] selection:bg-[#6C4DF6] selection:text-white transition-colors">
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
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
