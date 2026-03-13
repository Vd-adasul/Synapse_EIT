import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import ChronosView from './pages/ChronosView'
import SentinelView from './pages/SentinelView'
import CommandPalette from './components/CommandPalette'
import { playNavClick, playPaletteOpen } from './utils/sounds'
import './styles/index.css'

export default function App() {
  const [showPalette, setShowPalette] = useState(false)
  const [activeView, setActiveView] = useState('chronos')

  // Global Cmd+K handler
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowPalette(v => {
          if (!v) playPaletteOpen()
          return !v
        })
      }
      if (e.key === 'Escape') setShowPalette(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const navigate = useCallback((view) => {
    playNavClick()
    setActiveView(view)
    setShowPalette(false)
  }, [])

  return (
    <BrowserRouter>
      <div className="bg-[#06080d] text-gray-100 min-h-screen font-display">
        {/* Ambient background */}
        <div className="ambient-bg" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-3 bg-glass-texture border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/images/MasterBrandLogo.png" alt="Synapse Logo" className="h-9 w-auto object-contain drop-shadow-md" />
          <span className="font-bold text-xl tracking-tight text-white font-display">Synapse EIT</span>
        </div>

        <div className="flex gap-2 p-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-inner">
          <NavTab active={activeView === 'chronos'} onClick={() => navigate('chronos')} icon="/images/ProjectChronos.png" label="Project Chronos" />
          <NavTab active={activeView === 'sentinel'} onClick={() => navigate('sentinel')} icon="/images/ProjectSentinel.png" label="Project Sentinel" />
        </div>

        <button
          onClick={() => { playPaletteOpen(); setShowPalette(true) }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            transition: 'var(--transition-smooth)',
          }}
          onMouseEnter={e => { e.target.style.borderColor = 'var(--glass-border-hover)'; e.target.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--glass-border)'; e.target.style.color = 'var(--text-secondary)'; }}
        >
          <span>Search</span>
          <kbd style={{
            background: 'rgba(255,255,255,0.06)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>⌘K</kbd>
        </button>
      </nav>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '56px', height: '100vh' }}>
        {activeView === 'chronos' && <ChronosView />}
        {activeView === 'sentinel' && <SentinelView />}
      </div>

      {/* Command Palette */}
      <AnimatePresence>
        {showPalette && (
          <CommandPalette
            onClose={() => setShowPalette(false)}
            onNavigate={navigate}
            currentView={activeView}
          />
        )}
      </AnimatePresence>
      </div>
    </BrowserRouter>
  )
}

function NavTab({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-5 py-2 rounded-full border-b-2 transition-all duration-300
        ${active 
          ? 'bg-[#34d399]/15 text-[#34d399] border-[#34d399] shadow-[0_0_12px_rgba(52,211,153,0.3)]' 
          : 'border-transparent text-gray-400 hover:text-white hover:brightness-125 hover:bg-white/5'}
      `}
      style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px' }}
    >
      <img src={icon} alt={label} className={`h-6 w-6 object-contain drop-shadow transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-60'}`} />
      <span>{label}</span>
    </button>
  )
}
