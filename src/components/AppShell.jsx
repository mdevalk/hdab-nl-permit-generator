import React from 'react'
import { FileText, List, Shield } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const NAV = [
  { path: '/issue', icon: FileText, label: 'Issue Permit' },
  { path: '/issued', icon: List, label: 'Issued Permits' },
]

export default function AppShell({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={22} color="var(--color-primary)" />
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.01em' }}>
            HDAB-NL Permit Generator
          </span>
          <span style={{
            background: 'var(--color-primary)',
            color: '#fff',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 20,
            marginLeft: 4,
          }}>
            Issuer
          </span>
        </div>
        <nav style={{ display: 'flex', gap: 4 }}>
          {NAV.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6,
                  fontSize: 13, fontWeight: 600,
                  color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: active ? '#eff6ff' : 'transparent',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--color-bg)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <Icon size={15} />
                {label}
              </button>
            )
          })}
        </nav>
      </header>
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1000, margin: '0 auto', width: '100%' }}>
        {children}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '12px 24px',
        fontSize: 12,
        color: 'var(--color-text-muted)',
        borderTop: '1px solid var(--color-border)',
      }}>
        HDAB-NL · European Health Data Space · EHDS Regulation (EU) 2025/327
      </footer>
    </div>
  )
}
