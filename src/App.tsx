import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav'
import Footer from './components/Footer'
import CommandBar from './components/CommandBar'
import { CommandBarProvider } from './components/CommandBarProvider'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SkillsPage from './pages/SkillsPage'
import WorkPage from './pages/WorkPage'
import ContactPage from './pages/ContactPage'

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex-1 flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/about" element={<PageTransition><AboutPage /></PageTransition>} />
        <Route path="/skills" element={<PageTransition><SkillsPage /></PageTransition>} />
        <Route path="/work" element={<PageTransition><WorkPage /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><ContactPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CommandBarProvider>
        {/* Fixed teal edge strips — Petronas */}
        <div className="fixed left-0 top-0 bottom-0 w-1 bg-[#00D2BE] z-50 pointer-events-none" />
        <div className="fixed right-0 top-0 bottom-0 w-1 bg-[#00D2BE] z-50 pointer-events-none" />

        <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
          <Nav />
          {/* pt-14 = nav height, so content never hides behind fixed nav */}
          <main className="flex-1 flex flex-col pt-14">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>

        <CommandBar />
      </CommandBarProvider>
    </BrowserRouter>
  )
}
