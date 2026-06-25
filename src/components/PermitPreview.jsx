import React from 'react'
import {
  CheckCircle, XCircle, AlertTriangle,
  Building2, User, Shield, FileText, Tag, BadgeCheck,
} from 'lucide-react'

const STATUS_CONFIG = {
  valid:   { icon: CheckCircle,   color: 'var(--color-valid)',   bg: 'var(--color-valid-bg)',   label: 'Valid' },
  expired: { icon: AlertTriangle, color: 'var(--color-expired)', bg: 'var(--color-expired-bg)', label: 'Expired' },
  revoked: { icon: XCircle,       color: 'var(--color-revoked)', bg: 'var(--color-revoked-bg)', label: 'Revoked' },
}

function Section({ title, icon: Icon, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
        color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        <Icon size={13} />{title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{label}: </span>
      <span style={{ fontSize: 13 }}>{value || '—'}</span>
    </div>
  )
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function PermitPreview({ permit }) {
  const cfg = STATUS_CONFIG[permit.status] || STATUS_CONFIG.valid
  const StatusIcon = cfg.icon

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `2px solid ${cfg.color}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Issuer banner */}
      <div style={{
        padding: '12px 20px',
        background: '#f0fdf4',
        borderBottom: '1px solid var(--color-valid)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <BadgeCheck size={20} color="var(--color-valid)" />
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-valid)' }}>
            Signed by Health Data Access Body — Netherlands
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Key: {permit.issuer?.keyId} · Alg: {permit.issuer?.algorithm}
          </div>
        </div>
      </div>

      {/* Status header */}
      <div style={{
        background: cfg.bg,
        borderBottom: `1px solid ${cfg.color}44`,
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusIcon size={22} color={cfg.color} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: cfg.color }}>{cfg.label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-text-muted)' }}>
              {permit.permitId}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--color-text-muted)' }}>
          <div>Issued: {formatDate(permit.issuedAt)}</div>
          <div>Expires: {formatDate(permit.expiresAt)}</div>
          {permit.revokedAt && (
            <div style={{ color: 'var(--color-revoked)', fontWeight: 600 }}>
              Revoked: {formatDate(permit.revokedAt)}
            </div>
          )}
        </div>
      </div>

      {/* Main fields */}
      <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
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

      {/* Categories, datasets, conditions */}
      <div style={{ padding: '0 20px 20px' }}>
        <Section title="Data Categories" icon={Tag}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(permit.dataCategories || []).map(cat => (
              <span key={cat} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 20, padding: '3px 10px', fontSize: 12,
              }}>
                {cat}
              </span>
            ))}
          </div>
        </Section>

        <Section title="Permitted Datasets" icon={FileText}>
          {(permit.datasets || []).map(ds => (
            <div key={ds.id} style={{ marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--color-text-muted)' }}>{ds.id}</span>
              {' '}
              <span style={{ fontSize: 13 }}>{ds.name}</span>
            </div>
          ))}
        </Section>

        <Section title="Conditions" icon={AlertTriangle}>
          <ol style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.7, color: 'var(--color-text)' }}>
            {(permit.conditions || []).map((c, i) => <li key={i}>{c}</li>)}
          </ol>
        </Section>

        {permit.revocationReason && (
          <div style={{
            marginTop: 8, padding: '10px 14px',
            background: 'var(--color-revoked-bg)', border: '1px solid var(--color-revoked)',
            borderRadius: 8, fontSize: 13, color: 'var(--color-revoked)',
          }}>
            <strong>Revocation reason:</strong> {permit.revocationReason}
          </div>
        )}
      </div>
    </div>
  )
}
