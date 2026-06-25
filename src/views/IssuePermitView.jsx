import React, { useState } from 'react'
import {
  FileText, ChevronRight, ChevronLeft, Shield,
  CheckCircle, Download, Plus, X, RotateCcw,
} from 'lucide-react'
import {
  issuePermit, savePermit, exportPermitJson,
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

const STEPS = ['Parties', 'Scope', 'Conditions & Review']

export default function IssuePermitView() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [issued, setIssued] = useState(null)

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  function validate(s) {
    const errs = {}
    if (s === 0) {
      if (!form.dataUserName.trim())    errs.dataUserName    = 'Required'
      if (!form.dataUserOrgId.trim())   errs.dataUserOrgId   = 'Required'
      if (!form.dataHolderName.trim())  errs.dataHolderName  = 'Required'
      if (!form.dataHolderOrgId.trim()) errs.dataHolderOrgId = 'Required'
      if (!form.speOperatorName.trim()) errs.speOperatorName = 'Required'
      if (!form.speOperatorOrgId.trim()) errs.speOperatorOrgId = 'Required'
    } else if (s === 1) {
      if (!form.purpose.trim()) errs.purpose = 'Required'
      if (form.dataCategories.length === 0) errs.dataCategories = 'Select at least one data category'
      if (!form.datasets.length || form.datasets.some(d => !d.id.trim() || !d.name.trim()))
        errs.datasets = 'All dataset fields are required'
    } else if (s === 2) {
      if (!form.conditions.length || form.conditions.some(c => !c.trim()))
        errs.conditions = 'All conditions must be non-empty'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function next() { if (validate(step)) setStep(s => s + 1) }
  function back() { setStep(s => s - 1); setErrors({}) }

  function handleIssue() {
    if (!validate(2)) return
    const permit = issuePermit(form)
    savePermit(permit)
    setIssued(permit)
  }

  function handleNew() {
    setForm(EMPTY_FORM)
    setIssued(null)
    setStep(0)
    setErrors({})
  }

  if (issued) {
    return (
      <div>
        <div style={{
          background: 'var(--color-valid-bg)', border: '2px solid var(--color-valid)',
          borderRadius: 'var(--radius)', padding: '20px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'flex-start', gap: 14,
        }}>
          <CheckCircle size={28} color="var(--color-valid)" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-valid)', marginBottom: 4 }}>
              Permit issued successfully
            </div>
            <div style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 16 }}>
              Permit{' '}
              <strong style={{ fontFamily: 'monospace' }}>{issued.permitId}</strong>
              {' '}has been signed and recorded in the HDAB-NL registry.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => exportPermitJson(issued)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8,
                  background: 'var(--color-valid)', color: '#fff', fontSize: 13, fontWeight: 600,
                }}
              >
                <Download size={15} /> Download JSON
              </button>
              <button
                onClick={handleNew}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 16px', borderRadius: 8,
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-surface)', fontSize: 13, fontWeight: 600, color: 'var(--color-text)',
                }}
              >
                <RotateCcw size={14} /> Issue another
              </button>
            </div>
          </div>
        </div>
        <div style={{
          fontWeight: 600, marginBottom: 12, fontSize: 13,
          color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em',
        }}>
          Issued Permit
        </div>
        <PermitPreview permit={issued} />
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <FileText size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Issue New EHDB Permit</h2>
        </div>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 600 }}>
          Complete all sections to generate a signed EHDB data access permit on behalf of HDAB-NL.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: i < step ? 'var(--color-valid)' : i === step ? 'var(--color-primary)' : 'var(--color-border)',
                color: i <= step ? '#fff' : 'var(--color-text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, transition: 'background 0.2s',
              }}>
                {i < step ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 13,
                fontWeight: i === step ? 700 : 500,
                color: i === step ? 'var(--color-text)' : 'var(--color-text-muted)',
              }}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 12px',
                background: i < step ? 'var(--color-valid)' : 'var(--color-border)',
                transition: 'background 0.2s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Form card */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius)', padding: 28, boxShadow: 'var(--shadow)',
      }}>
        {step === 0 && <StepParties    form={form} update={update} errors={errors} />}
        {step === 1 && <StepScope      form={form} update={update} errors={errors} />}
        {step === 2 && <StepConditions form={form} update={update} errors={errors} />}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        {step > 0 ? (
          <button
            onClick={back}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 18px', borderRadius: 8,
              border: '1.5px solid var(--color-border)',
              background: 'var(--color-surface)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)',
            }}
          >
            <ChevronLeft size={16} /> Back
          </button>
        ) : <div />}
        {step < 2 ? (
          <button
            onClick={next}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 20px', borderRadius: 8,
              background: 'var(--color-primary)', color: '#fff', fontSize: 14, fontWeight: 600,
            }}
          >
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleIssue}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 22px', borderRadius: 8,
              background: 'var(--color-valid)', color: '#fff', fontSize: 14, fontWeight: 700,
            }}
          >
            <Shield size={16} /> Issue Permit
          </button>
        )}
      </div>
    </div>
  )
}

// ---- Shared form primitives ----

function FormField({ label, error, required, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 600,
        color: 'var(--color-text-muted)', marginBottom: 6,
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {label}{required && <span style={{ color: 'var(--color-revoked)', marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint  && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{hint}</div>}
      {error && <div style={{ fontSize: 12, color: 'var(--color-revoked)', marginTop: 4 }}>{error}</div>}
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, mono }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '9px 12px',
        border: `1.5px solid ${error ? 'var(--color-revoked)' : 'var(--color-border)'}`,
        borderRadius: 7, fontSize: 13,
        fontFamily: mono ? 'monospace' : 'inherit',
        outline: 'none', transition: 'border-color 0.15s',
      }}
      onFocus={e => { e.target.style.borderColor = error ? 'var(--color-revoked)' : 'var(--color-primary)' }}
      onBlur={e => { e.target.style.borderColor = error ? 'var(--color-revoked)' : 'var(--color-border)' }}
    />
  )
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%', padding: '9px 12px',
        border: '1.5px solid var(--color-border)',
        borderRadius: 7, fontSize: 13,
        background: 'var(--color-surface)', outline: 'none',
      }}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function SectionHeading({ children }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 700, color: 'var(--color-text)',
      marginBottom: 16, paddingBottom: 8,
      borderBottom: '1px solid var(--color-border)',
    }}>
      {children}
    </div>
  )
}

// ---- Step 1: Parties ----

function StepParties({ form, update, errors }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
      <div>
        <SectionHeading>Data User</SectionHeading>
        <FormField label="Organisation name" required error={errors.dataUserName}>
          <TextInput value={form.dataUserName} onChange={v => update('dataUserName', v)}
            placeholder="e.g. Amsterdam UMC Research Institute" error={errors.dataUserName} />
        </FormField>
        <FormField label="Organisation ID" required error={errors.dataUserOrgId}>
          <TextInput value={form.dataUserOrgId} onChange={v => update('dataUserOrgId', v)}
            placeholder="e.g. NL-KVK-34375365" mono error={errors.dataUserOrgId} />
        </FormField>
        <FormField label="Country">
          <SelectInput value={form.dataUserCountry} onChange={v => update('dataUserCountry', v)} options={EU_COUNTRIES} />
        </FormField>
      </div>

      <div>
        <SectionHeading>Data Holder</SectionHeading>
        <FormField label="Organisation name" required error={errors.dataHolderName}>
          <TextInput value={form.dataHolderName} onChange={v => update('dataHolderName', v)}
            placeholder="e.g. RIVM National Institute" error={errors.dataHolderName} />
        </FormField>
        <FormField label="Organisation ID" required error={errors.dataHolderOrgId}>
          <TextInput value={form.dataHolderOrgId} onChange={v => update('dataHolderOrgId', v)}
            placeholder="e.g. NL-OIN-00000000003214345000" mono error={errors.dataHolderOrgId} />
        </FormField>
        <FormField label="Country">
          <SelectInput value={form.dataHolderCountry} onChange={v => update('dataHolderCountry', v)} options={EU_COUNTRIES} />
        </FormField>
      </div>

      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
        <SectionHeading>SPE Operator</SectionHeading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '0 20px' }}>
          <FormField label="Organisation name" required error={errors.speOperatorName}>
            <TextInput value={form.speOperatorName} onChange={v => update('speOperatorName', v)}
              placeholder="e.g. CBS SPE" error={errors.speOperatorName} />
          </FormField>
          <FormField label="Organisation ID" required error={errors.speOperatorOrgId}>
            <TextInput value={form.speOperatorOrgId} onChange={v => update('speOperatorOrgId', v)}
              placeholder="NL-OIN-…" mono error={errors.speOperatorOrgId} />
          </FormField>
          <FormField label="SPE Type">
            <SelectInput value={form.speType} onChange={v => update('speType', v)} options={SPE_TYPES} />
          </FormField>
        </div>
      </div>
    </div>
  )
}

// ---- Step 2: Scope ----

function StepScope({ form, update, errors }) {
  function toggleCategory(cat) {
    const next = form.dataCategories.includes(cat)
      ? form.dataCategories.filter(c => c !== cat)
      : [...form.dataCategories, cat]
    update('dataCategories', next)
  }

  function updateDataset(i, field, value) {
    update('datasets', form.datasets.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  function addDataset() { update('datasets', [...form.datasets, { id: '', name: '' }]) }
  function removeDataset(i) { update('datasets', form.datasets.filter((_, idx) => idx !== i)) }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px', marginBottom: 8 }}>
        <FormField label="Research purpose" required error={errors.purpose}>
          <TextInput value={form.purpose} onChange={v => update('purpose', v)}
            placeholder="e.g. Scientific research — cardiovascular disease epidemiology"
            error={errors.purpose} />
        </FormField>
        <FormField label="Legal basis" required>
          <SelectInput value={form.legalBasis} onChange={v => update('legalBasis', v)} options={LEGAL_BASES} />
        </FormField>
        <FormField label="Validity period"
          hint={`Expires ${form.validityYears} year${form.validityYears !== '1' ? 's' : ''} from today`}>
          <SelectInput value={form.validityYears} onChange={v => update('validityYears', v)}
            options={['1','2','3','4','5']} />
        </FormField>
      </div>

      <SectionHeading>Data Categories</SectionHeading>
      {errors.dataCategories && (
        <div style={{ fontSize: 12, color: 'var(--color-revoked)', marginBottom: 8 }}>{errors.dataCategories}</div>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
        {DATA_CATEGORY_OPTIONS.map(cat => {
          const sel = form.dataCategories.includes(cat)
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                border: `1.5px solid ${sel ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: sel ? '#eff6ff' : 'var(--color-surface)',
                color: sel ? 'var(--color-primary)' : 'var(--color-text)',
                transition: 'all 0.15s',
              }}
            >
              {sel && '✓ '}{cat}
            </button>
          )
        })}
      </div>

      <SectionHeading>Permitted Datasets</SectionHeading>
      {errors.datasets && (
        <div style={{ fontSize: 12, color: 'var(--color-revoked)', marginBottom: 8 }}>{errors.datasets}</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {form.datasets.map((ds, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="text" value={ds.id}
              onChange={e => updateDataset(i, 'id', e.target.value)}
              placeholder="Dataset ID (e.g. RIVM-DS-2019-CVD)"
              style={{
                flex: '0 0 220px', padding: '8px 10px',
                border: '1.5px solid var(--color-border)', borderRadius: 7,
                fontSize: 12, fontFamily: 'monospace', outline: 'none',
              }}
            />
            <input
              type="text" value={ds.name}
              onChange={e => updateDataset(i, 'name', e.target.value)}
              placeholder="Dataset name"
              style={{
                flex: 1, padding: '8px 10px',
                border: '1.5px solid var(--color-border)', borderRadius: 7,
                fontSize: 13, outline: 'none',
              }}
            />
            {form.datasets.length > 1 && (
              <button
                onClick={() => removeDataset(i)}
                style={{ color: 'var(--color-text-muted)', padding: 4, borderRadius: 4, flexShrink: 0 }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        onClick={addDataset}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--color-primary)', fontWeight: 600,
          padding: '4px 8px', borderRadius: 6,
        }}
      >
        <Plus size={14} /> Add dataset
      </button>
    </div>
  )
}

// ---- Step 3: Conditions ----

function StepConditions({ form, update, errors }) {
  function updateCondition(i, value) {
    update('conditions', form.conditions.map((c, idx) => idx === i ? value : c))
  }
  function addCondition() { update('conditions', [...form.conditions, '']) }
  function removeCondition(i) { update('conditions', form.conditions.filter((_, idx) => idx !== i)) }
  function addDefault(cond) {
    if (!form.conditions.includes(cond)) update('conditions', [...form.conditions, cond])
  }

  return (
    <div>
      <SectionHeading>Permit Conditions</SectionHeading>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 16 }}>
        Specify the conditions the data user must comply with.
        You may add from the standard HDAB-NL conditions below or write custom ones.
      </p>

      {errors.conditions && (
        <div style={{ fontSize: 12, color: 'var(--color-revoked)', marginBottom: 8 }}>{errors.conditions}</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {form.conditions.map((cond, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--color-bg)', border: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)',
              flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <input
              type="text" value={cond}
              onChange={e => updateCondition(i, e.target.value)}
              style={{
                flex: 1, padding: '8px 12px',
                border: '1.5px solid var(--color-border)', borderRadius: 7,
                fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={() => removeCondition(i)}
              style={{ color: 'var(--color-text-muted)', padding: 4, borderRadius: 4, flexShrink: 0 }}
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addCondition}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--color-primary)', fontWeight: 600,
          padding: '5px 10px', borderRadius: 6,
          border: '1px dashed var(--color-primary)', marginBottom: 24,
        }}
      >
        <Plus size={14} /> Add condition
      </button>

      {/* Standard conditions picker */}
      <div style={{
        background: 'var(--color-bg)', borderRadius: 8,
        border: '1px solid var(--color-border)', padding: 16,
      }}>
        <div style={{
          fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10,
        }}>
          Standard HDAB-NL conditions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DEFAULT_CONDITIONS.map(cond => {
            const added = form.conditions.includes(cond)
            return (
              <div key={cond} style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: added ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                  {cond}
                </span>
                <button
                  onClick={() => !added && addDefault(cond)}
                  disabled={added}
                  style={{
                    fontSize: 11, fontWeight: 600, flexShrink: 0,
                    color: added ? 'var(--color-valid)' : 'var(--color-primary)',
                    opacity: added ? 0.7 : 1,
                  }}
                >
                  {added ? '✓ Added' : '+ Add'}
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
