import React from 'react'
import {
  CheckCircle, XCircle, AlertTriangle,
  Building2, User, Shield, FileText, Tag, BadgeCheck, Clock,
} from 'lucide-react'

const STATUS_CONFIG = {
  valid:   { icon: CheckCircle,   color: 'var(--color-valid)',   bg: 'var(--color-valid-bg)',   label: 'Valid' },
  expired: { icon: AlertTriangle, color: 'var(--color-expired)', bg: 'var(--color-expired-bg)', label: 'Expired' },
  revoked: { icon: XCircle,       color: 'var(--color-revoked)', bg: 'var(--color-revoked-bg)', label: 'Revoked' },
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
        color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        <Icon size={12} />{title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 5 }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{label}: </span>
      <span style={{ fontSize: 12 }}>{value || '—'}</span>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PermitPreview({ permit, draft }) {
  const cfg = STATUS_CONFIG[permit.status] || STATUS_CONFIG.valid
  const StatusIcon = cfg.icon

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `2px solid ${draft ? 'var(--color-border)' : cfg.color}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: draft ? 'var(--shadow)' : 'var(--shadow-md)',
      opacity: draft ? 0.92 : 1,
      transition: 'border-color 0.2s, opacity 0.2s',
    }}>
      {/* Issuer / draft banner */}
      <div style={{
        padding: '10px 18px',
        background: draft ? 'var(--color-bg)' : '#f0fdf4',
        borderBottom: `1px solid ${draft ? 'var(--color-border)' : 'var(--color-valid)'}`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        {draft
          ? <Clock size={18} color="var(--color-text-muted)" />
          : <BadgeCheck size={18} color="var(--color-valid)" />
        }
        <div>
          <div style={{ fontWeight: 700, fontSize: 12, color: draft ? 'var(--color-text-muted)' : 'var(--color-valid)' }}>
            {draft ? 'Draft — not yet signed' : 'Signed by Health Data Access Body — Netherlands'}
          </div>
          {!draft && (
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
              kid: {permit.issuer?.kid} · alg: {permit.issuer?.algorithm}
            </div>
          )}
        </div>
      </div>

      {/* Status header */}
      <div style={{
        background: draft ? 'var(--color-bg)' : cfg.bg,
        borderBottom: `1px solid ${draft ? 'var(--color-border)' : cfg.color + '44'}`,
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusIcon size={20} color={draft ? 'var(--color-text-muted)' : cfg.color} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: draft ? 'var(--color-text-muted)' : cfg.color }}>
              {draft ? 'Pending' : cfg.label}
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>
              {permit.permitId}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--color-text-muted)' }}>
          <div>Issued: {draft ? 'upon signing' : formatDate(permit.issuedAt)}</div>
          <div>Expires: {formatDate(permit.expiresAt)}</div>
        </div>
      </div>

      {/* Main fields */}
      <div style={{ padding: '16px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 28px' }}>
        <Section title="Data User" icon={User}>
          <Field label="Name"    value={permit.dataUser?.name} />
          <Field label="Org ID"  value={permit.dataUser?.organizationId} />
          <Field label="Country" value={permit.dataUser?.country} />
        </Section>
        <Section title="Data Holder" icon={Building2}>
          <Field label="Name"    value={permit.dataHolder?.name} />
          <Field label="Org ID"  value={permit.dataHolder?.organizationId} />
          <Field label="Country" value={permit.dataHolder?.country} />
        </Section>
        <Section title="SPE Operator" icon={Shield}>
          <Field label="Name"     value={permit.speOperator?.name} />
          <Field label="Org ID"   value={permit.speOperator?.organizationId} />
          <Field label="SPE Type" value={permit.speOperator?.speType} />
        </Section>
        <Section title="Legal Basis" icon={FileText}>
          <Field label="Purpose"     value={permit.purpose} />
          <Field label="Legal basis" value={permit.legalBasis} />
        </Section>
      </div>

      <div style={{ padding: '0 18px 18px' }}>
        <Section title="Data Categories" icon={Tag}>
          {permit.dataCategories?.length ? (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {permit.dataCategories.map(cat => (
                <span key={cat} style={{
                  background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                  borderRadius: 20, padding: '2px 9px', fontSize: 11,
                }}>{cat}</span>
              ))}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>None selected</span>
          )}
        </Section>

        <Section title="Permitted Datasets" icon={FileText}>
          {permit.datasets?.filter(d => d.id || d.name).length ? (
            permit.datasets.filter(d => d.id || d.name).map((ds, i) => (
              <div key={i} style={{ marginBottom: 3 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)' }}>{ds.id}</span>
                {ds.id && ds.name && ' '}
                <span style={{ fontSize: 12 }}>{ds.name}</span>
              </div>
            ))
          ) : (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No datasets added</span>
          )}
        </Section>

        <Section title="Conditions" icon={AlertTriangle}>
          {permit.conditions?.filter(c => c).length ? (
            <ol style={{ paddingLeft: 16, fontSize: 12, lineHeight: 1.7, color: 'var(--color-text)' }}>
              {permit.conditions.filter(c => c).map((c, i) => <li key={i}>{c}</li>)}
            </ol>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>No conditions added</span>
          )}
        </Section>
      </div>
    </div>
  )
}
