import React from 'react'
import { Shield } from 'lucide-react'

export default function AppShell({ children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <header style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 28px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        boxShadow: 'var(--shadow)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
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
          marginLeft: 2,
        }}>
          Internal
        </span>
      </header>
      <main style={{
        flex: 1,
        padding: '28px 28px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
      }}>
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
