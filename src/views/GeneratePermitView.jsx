import React, { useState } from 'react'
import { Shield, Download, RotateCcw, Plus, X, CheckCircle, Loader } from 'lucide-react'
import {
  issuePermit, exportPermitJson,
  LEGAL_BASES, DATA_CATEGORY_OPTIONS, SPE_TYPES,
  DEFAULT_CONDITIONS, EU_COUNTRIES,
} from '../services/permitGeneratorService.js'
import PermitPreview from '../components/PermitPreview.jsx'

const EMPTY_FORM = {
  dataUserName: '',
  dataUserOrgId: '',
  dataUserCountry: 'NL',
  dataHolderName: '',
  dataHolderOrgId: '',
  dataHolderCountry: 'NL',
  speOperatorName: 'CBS Secure Processing Environment',
  speOperatorOrgId: 'NL-OIN-00000000001234567000',
  speType: SPE_TYPES[0],
  purpose: '',
  legalBasis: LEGAL_BASES[0],
  validityYears: '2',
  dataCategories: [],
  datasets: [{ id: '', name: '' }],
  conditions: [DEFAULT_CONDITIONS[0], DEFAULT_CONDITIONS[1]],
}

function buildDraft(form) {
  const validityMs = parseInt(form.validityYears || '2') * 365.25 * 24 * 60 * 60 * 1000
  return {
    permitId: 'PENDING',
    status: 'valid',
    issuedAt:  new Date().toISOString(),
    expiresAt: new Date(Date.now() + validityMs).toISOString(),
    issuer: { authorityId: 'HDAB-NL', keyId: 'hdab-nl-signing-key-2025-v1', algorithm: 'Ed25519' },
    dataUser:    { name: form.dataUserName    || '—', organizationId: form.dataUserOrgId    || '—', country: form.dataUserCountry },
    dataHolder:  { name: form.dataHolderName  || '—', organizationId: form.dataHolderOrgId  || '—', country: form.dataHolderCountry },
    speOperator: { name: form.speOperatorName || '—', organizationId: form.speOperatorOrgId || '—', speType: form.speType },
    purpose:        form.purpose || '—',
    legalBasis:     form.legalBasis,
    dataCategories: form.dataCategories,
    datasets:       form.datasets,
    conditions:     form.conditions,
  }
}

export default function GeneratePermitView() {
  const [form, setForm]       = useState(EMPTY_FORM)
  const [errors, setErrors]   = useState({})
  const [issued, setIssued]   = useState(null)
  const [signing, setSigning] = useState(false)

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  function validate() {
    const errs = {}
    if (!form.dataUserName.trim())     errs.dataUserName     = 'Required'
    if (!form.dataUserOrgId.trim())    errs.dataUserOrgId    = 'Required'
    if (!form.dataHolderName.trim())   errs.dataHolderName   = 'Required'
    if (!form.dataHolderOrgId.trim())  errs.dataHolderOrgId  = 'Required'
    if (!form.speOperatorName.trim())  errs.speOperatorName  = 'Required'
    if (!form.speOperatorOrgId.trim()) errs.speOperatorOrgId = 'Required'
    if (!form.purpose.trim())          errs.purpose          = 'Required'
    if (!form.dataCategories.length)   errs.dataCategories   = 'Select at least one'
    if (!form.datasets.length || form.datasets.some(d => !d.id.trim() || !d.name.trim()))
      errs.datasets = 'All dataset fields are required'
    if (!form.conditions.length || form.conditions.some(c => !c.trim()))
      errs.conditions = 'All conditions must be filled'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSign() {
    if (!validate()) return
    setSigning(true)
    try {
      const permit = await issuePermit(form)
      setIssued(permit)
      exportPermitJson(permit)
    } finally {
      setSigning(false)
    }
  }

  function handleReset() {
    setForm(EMPTY_FORM)
    setIssued(null)
    setErrors({})
  }

  const preview = issued || buildDraft(form)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 28, alignItems: 'start' }}>

      {/* ---- Left: form ---- */}
      <div>
        {issued ? (
          <div style={{
            background: 'var(--color-valid-bg)', border: '2px solid var(--color-valid)',
            borderRadius: 'var(--radius)', padding: '18px 20px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
          }}>
            <CheckCircle size={22} color="var(--color-valid)" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-valid)', marginBottom: 4 }}>
                Permit issued &amp; downloaded
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--color-text)', marginBottom: 14 }}>
                {issued.permitId}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => exportPermitJson(issued)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 7,
                    background: 'var(--color-valid)', color: '#fff', fontSize: 12, fontWeight: 600,
                  }}
                >
                  <Download size={13} /> Download again
                </button>
                <button
                  onClick={handleReset}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 7,
                    border: '1.5px solid var(--color-border)',
                    background: 'var(--color-surface)', fontSize: 12, fontWeight: 600, color: 'var(--color-text)',
                  }}
                >
                  <RotateCcw size={12} /> New permit
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow)',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Configure Permit</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>
                Fill in all fields, then sign and export.
              </div>
            </div>

            <div style={{ padding: 20 }}>
              <FormSection title="Data User">
                <Field label="Organisation name" required error={errors.dataUserName}>
                  <TextInput value={form.dataUserName} onChange={v => update('dataUserName', v)}
                    placeholder="e.g. Amsterdam UMC Research Institute" error={errors.dataUserName} />
                </Field>
                <Field label="Organisation ID" required error={errors.dataUserOrgId}>
                  <TextInput value={form.dataUserOrgId} onChange={v => update('dataUserOrgId', v)}
                    placeholder="e.g. NL-KVK-34375365" mono error={errors.dataUserOrgId} />
                </Field>
                <Field label="Country">
                  <SelectInput value={form.dataUserCountry} onChange={v => update('dataUserCountry', v)} options={EU_COUNTRIES} />
                </Field>
              </FormSection>

              <FormSection title="Data Holder">
                <Field label="Organisation name" required error={errors.dataHolderName}>
                  <TextInput value={form.dataHolderName} onChange={v => update('dataHolderName', v)}
                    placeholder="e.g. RIVM National Institute" error={errors.dataHolderName} />
                </Field>
                <Field label="Organisation ID" required error={errors.dataHolderOrgId}>
                  <TextInput value={form.dataHolderOrgId} onChange={v => update('dataHolderOrgId', v)}
                    placeholder="e.g. NL-OIN-00000000003214345000" mono error={errors.dataHolderOrgId} />
                </Field>
                <Field label="Country">
                  <SelectInput value={form.dataHolderCountry} onChange={v => update('dataHolderCountry', v)} options={EU_COUNTRIES} />
                </Field>
              </FormSection>

              <FormSection title="SPE Operator">
                <Field label="Organisation name" required error={errors.speOperatorName}>
                  <TextInput value={form.speOperatorName} onChange={v => update('speOperatorName', v)} error={errors.speOperatorName} />
                </Field>
                <Field label="Organisation ID" required error={errors.speOperatorOrgId}>
                  <TextInput value={form.speOperatorOrgId} onChange={v => update('speOperatorOrgId', v)} mono error={errors.speOperatorOrgId} />
                </Field>
                <Field label="SPE Type">
                  <SelectInput value={form.speType} onChange={v => update('speType', v)} options={SPE_TYPES} />
                </Field>
              </FormSection>

              <FormSection title="Scope">
                <Field label="Research purpose" required error={errors.purpose}>
                  <TextInput value={form.purpose} onChange={v => update('purpose', v)}
                    placeholder="e.g. Scientific research — cardiovascular disease" error={errors.purpose} />
                </Field>
                <Field label="Legal basis">
                  <SelectInput value={form.legalBasis} onChange={v => update('legalBasis', v)} options={LEGAL_BASES} />
                </Field>
                <Field label="Validity"
                  hint={`Expires ${form.validityYears} year${form.validityYears !== '1' ? 's' : ''} from signing`}>
                  <SelectInput value={form.validityYears} onChange={v => update('validityYears', v)} options={['1','2','3','4','5']} />
                </Field>
              </FormSection>

              <FormSection title="Data Categories">
                {errors.dataCategories && (
                  <div style={{ fontSize: 11, color: 'var(--color-revoked)', marginBottom: 6 }}>{errors.dataCategories}</div>
                )}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {DATA_CATEGORY_OPTIONS.map(cat => {
                    const sel = form.dataCategories.includes(cat)
                    return (
                      <button key={cat}
                        onClick={() => update('dataCategories',
                          sel ? form.dataCategories.filter(c => c !== cat) : [...form.dataCategories, cat]
                        )}
                        style={{
                          padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                          border: `1.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          background: sel ? '#eff6ff' : 'var(--color-surface)',
                          color: sel ? 'var(--color-primary)' : 'var(--color-text)',
                          transition: 'all 0.12s',
                        }}
                      >
                        {sel && '✓ '}{cat}
                      </button>
                    )
                  })}
                </div>
              </FormSection>

              <FormSection title="Datasets">
                {errors.datasets && (
                  <div style={{ fontSize: 11, color: 'var(--color-revoked)', marginBottom: 6 }}>{errors.datasets}</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  {form.datasets.map((ds, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="text" value={ds.id}
                        onChange={e => update('datasets', form.datasets.map((d, idx) => idx === i ? { ...d, id: e.target.value } : d))}
                        placeholder="ID"
                        style={{ flex: '0 0 130px', padding: '6px 8px', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: 11, fontFamily: 'monospace', outline: 'none' }}
                      />
                      <input type="text" value={ds.name}
                        onChange={e => update('datasets', form.datasets.map((d, idx) => idx === i ? { ...d, name: e.target.value } : d))}
                        placeholder="Dataset name"
                        style={{ flex: 1, padding: '6px 8px', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: 12, outline: 'none' }}
                      />
                      {form.datasets.length > 1 && (
                        <button onClick={() => update('datasets', form.datasets.filter((_, idx) => idx !== i))}
                          style={{ color: 'var(--color-text-muted)', padding: 2, flexShrink: 0 }}><X size={13} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <button onClick={() => update('datasets', [...form.datasets, { id: '', name: '' }])}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-primary)', fontWeight: 600 }}>
                  <Plus size={13} /> Add dataset
                </button>
              </FormSection>

              <FormSection title="Conditions" last>
                {errors.conditions && (
                  <div style={{ fontSize: 11, color: 'var(--color-revoked)', marginBottom: 6 }}>{errors.conditions}</div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
                  {form.conditions.map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 700, width: 16, flexShrink: 0 }}>{i + 1}.</span>
                      <input type="text" value={c}
                        onChange={e => update('conditions', form.conditions.map((x, idx) => idx === i ? e.target.value : x))}
                        style={{ flex: 1, padding: '6px 8px', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: 12, outline: 'none' }}
                      />
                      <button onClick={() => update('conditions', form.conditions.filter((_, idx) => idx !== i))}
                        style={{ color: 'var(--color-text-muted)', padding: 2, flexShrink: 0 }}><X size={13} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => update('conditions', [...form.conditions, ''])}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-primary)', fontWeight: 600, marginBottom: 14 }}>
                  <Plus size={13} /> Add condition
                </button>
                <div style={{ padding: 12, background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    Standard HDAB-NL conditions
                  </div>
                  {DEFAULT_CONDITIONS.map(cond => {
                    const added = form.conditions.includes(cond)
                    return (
                      <div key={cond} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: added ? 'var(--color-text-muted)' : 'var(--color-text)', flex: 1, lineHeight: 1.4 }}>{cond}</span>
                        <button
                          onClick={() => !added && update('conditions', [...form.conditions, cond])}
                          disabled={added}
                          style={{ fontSize: 11, fontWeight: 600, flexShrink: 0, color: added ? 'var(--color-valid)' : 'var(--color-primary)', opacity: added ? 0.7 : 1 }}
                        >
                          {added ? '✓' : '+ Add'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </FormSection>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              <button
                onClick={handleSign}
                disabled={signing}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px', borderRadius: 8,
                  background: signing ? '#93c5fd' : 'var(--color-primary)',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  transition: 'background 0.15s',
                  cursor: signing ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={e => { if (!signing) e.currentTarget.style.background = 'var(--color-primary-hover)' }}
                onMouseLeave={e => { if (!signing) e.currentTarget.style.background = 'var(--color-primary)' }}
              >
                {signing
                  ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Signing…</>
                  : <><Shield size={16} /> Sign &amp; Export Permit</>
                }
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ---- Right: live preview ---- */}
      <div style={{ position: 'sticky', top: 24 }}>
        <div style={{
          fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10,
        }}>
          {issued ? 'Issued Permit' : 'Live Preview'}
        </div>
        <PermitPreview permit={preview} draft={!issued} />
      </div>
    </div>
  )
}

function FormSection({ title, children, last }) {
  return (
    <div style={{ marginBottom: last ? 0 : 20, paddingBottom: last ? 0 : 20, borderBottom: last ? 'none' : '1px solid var(--color-border)' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, required, error, hint, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 }}>
        {label}{required && <span style={{ color: 'var(--color-revoked)', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint  && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 3 }}>{hint}</div>}
      {error && <div style={{ fontSize: 11, color: 'var(--color-revoked)', marginTop: 3 }}>{error}</div>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, mono }) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: '100%', padding: '7px 10px',
        border: `1.5px solid ${error ? 'var(--color-revoked)' : 'var(--color-border)'}`,
        borderRadius: 6, fontSize: 13,
        fontFamily: mono ? 'monospace' : 'inherit', outline: 'none',
      }}
      onFocus={e => { e.target.style.borderColor = error ? 'var(--color-revoked)' : 'var(--color-primary)' }}
      onBlur={e =>  { e.target.style.borderColor = error ? 'var(--color-revoked)' : 'var(--color-border)' }}
    />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ width: '100%', padding: '7px 10px', border: '1.5px solid var(--color-border)', borderRadius: 6, fontSize: 13, background: 'var(--color-surface)', outline: 'none' }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}
