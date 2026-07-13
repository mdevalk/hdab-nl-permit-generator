import React, { useState, useEffect } from 'react'
import {
  List, CheckCircle, XCircle, AlertTriangle,
  Download, ShieldOff, RefreshCw, X,
} from 'lucide-react'
import { getIssuedPermits, revokePermit, exportPermitJson } from '../services/permitGeneratorService.js'
import PermitPreview from '../components/PermitPreview.jsx'

const STATUS_ICON = {
  valid:   { icon: CheckCircle,   color: 'var(--color-valid)' },
  expired: { icon: AlertTriangle, color: 'var(--color-expired)' },
  revoked: { icon: XCircle,       color: 'var(--color-revoked)' },
}

export default function IssuedPermitsView() {
  const [permits, setPermits]       = useState([])
  const [filter, setFilter]         = useState('all')
  const [selected, setSelected]     = useState(null)
  const [revoking, setRevoking]     = useState(null)
  const [revokeReason, setRevokeReason] = useState('')

  useEffect(() => { setPermits(getIssuedPermits()) }, [])

  function refresh() { setPermits(getIssuedPermits()) }

  function handleRevoke() {
    if (!revoking || !revokeReason.trim()) return
    const updated = revokePermit(revoking.permitId, revokeReason.trim())
    setPermits(updated)
    if (selected?.permitId === revoking.permitId)
      setSelected(updated.find(p => p.permitId === revoking.permitId))
    setRevoking(null)
    setRevokeReason('')
  }

  const counts = { valid: 0, expired: 0, revoked: 0 }
  permits.forEach(p => { if (counts[p.status] !== undefined) counts[p.status]++ })
  const filtered = filter === 'all' ? permits : permits.filter(p => p.status === filter)

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <List size={20} color="var(--color-primary)" />
            <h2 style={{ fontSize: 20, fontWeight: 700 }}>Issued Permits</h2>
          </div>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 560 }}>
            All permits issued by HDAB-NL. Select a permit to view details, export, or revoke it.
          </p>
        </div>
        <button
          onClick={refresh}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: '1.5px solid var(--color-border)',
            background: 'var(--color-surface)', fontSize: 13, fontWeight: 600,
            color: 'var(--color-text-muted)',
          }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <SummaryCard label="Total issued" count={permits.length} color="var(--color-primary)" bg="#eff6ff" />
        <SummaryCard label="Active"        count={counts.valid}   color="var(--color-valid)"   bg="var(--color-valid-bg)" />
        <SummaryCard label="Expired"       count={counts.expired} color="var(--color-expired)" bg="var(--color-expired-bg)" />
        <SummaryCard label="Revoked"       count={counts.revoked} color="var(--color-revoked)" bg="var(--color-revoked-bg)" />
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {['all', 'valid', 'expired', 'revoked'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              border: '1.5px solid',
              borderColor: filter === f ? 'var(--color-primary)' : 'var(--color-border)',
              background: filter === f ? 'var(--color-primary)' : 'var(--color-surface)',
              color: filter === f ? '#fff' : 'var(--color-text)',
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {permits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
          <List size={36} style={{ marginBottom: 12, opacity: 0.3 }} />
          <div style={{ fontWeight: 600, marginBottom: 4 }}>No permits issued yet</div>
          <div style={{ fontSize: 13 }}>Use "Issue Permit" to create the first permit.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid', gap: 10,
          gridTemplateColumns: selected ? '300px 1fr' : '1fr',
          alignItems: 'start',
        }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(p => {
              const { icon: Icon, color } = STATUS_ICON[p.status] || STATUS_ICON.expired
              const isSelected = selected?.permitId === p.permitId
              return (
                <button
                  key={p.permitId}
                  onClick={() => setSelected(isSelected ? null : p)}
                  style={{
                    textAlign: 'left', padding: '12px 14px',
                    borderRadius: 8, border: '1.5px solid',
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isSelected ? '#eff6ff' : 'var(--color-surface)',
                    cursor: 'pointer', boxShadow: 'var(--shadow)', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = '#a0aec0' }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon size={15} color={color} />
                    <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600 }}>{p.permitId}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 2 }}>{p.dataUser.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>↳ {p.dataHolder.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Issued {new Date(p.issuedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>No permits match this filter.</p>
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12, flexWrap: 'wrap', gap: 8,
              }}>
                <div style={{
                  fontWeight: 600, fontSize: 13,
                  color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  Permit Details
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => exportPermitJson(selected)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 7,
                      border: '1.5px solid var(--color-border)',
                      background: 'var(--color-surface)', fontSize: 12, fontWeight: 600, color: 'var(--color-text)',
                    }}
                  >
                    <Download size={13} /> Export JSON
                  </button>
                  {selected.status === 'valid' && (
                    <button
                      onClick={() => { setRevoking(selected); setRevokeReason('') }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        padding: '6px 12px', borderRadius: 7,
                        border: '1.5px solid var(--color-revoked)',
                        background: 'var(--color-revoked-bg)', fontSize: 12, fontWeight: 600,
                        color: 'var(--color-revoked)',
                      }}
                    >
                      <ShieldOff size={13} /> Revoke
                    </button>
                  )}
                </div>
              </div>
              <PermitPreview permit={selected} />
            </div>
          )}
        </div>
      )}

      {/* Revoke modal */}
      {revoking && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 20,
        }}>
          <div style={{
            background: 'var(--color-surface)', borderRadius: 'var(--radius)',
            padding: 28, maxWidth: 480, width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-revoked)' }}>Revoke Permit</div>
              <button onClick={() => setRevoking(null)} style={{ color: 'var(--color-text-muted)' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 4 }}>
              You are about to revoke permit{' '}
              <strong style={{ fontFamily: 'monospace' }}>{revoking.permitId}</strong>.
              This action cannot be undone.
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
              Provide a reason for revocation:
            </p>
            <input
              type="text"
              value={revokeReason}
              onChange={e => setRevokeReason(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && revokeReason.trim()) handleRevoke() }}
              placeholder="e.g. Data user failed to comply with output checking procedures"
              autoFocus
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid var(--color-border)',
                borderRadius: 7, fontSize: 13, outline: 'none', marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setRevoking(null)}
                style={{
                  padding: '8px 16px', borderRadius: 7,
                  border: '1.5px solid var(--color-border)',
                  fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={!revokeReason.trim()}
                style={{
                  padding: '8px 16px', borderRadius: 7,
                  background: revokeReason.trim() ? 'var(--color-revoked)' : '#ccc',
                  color: '#fff', fontSize: 13, fontWeight: 700,
                  cursor: revokeReason.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Revoke Permit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, count, color, bg }) {
  return (
    <div style={{
      background: bg, border: `1.5px solid ${color}44`,
      borderRadius: 'var(--radius)', padding: '14px 20px',
      minWidth: 120, boxShadow: 'var(--shadow)',
    }}>
      <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>{count}</div>
      <div style={{ fontSize: 12, color, fontWeight: 600, marginTop: 4 }}>{label}</div>
    </div>
  )
}
