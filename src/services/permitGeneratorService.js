// Real Ed25519 signing using the bundled HDAB-NL private key.
// The private key file (src/assets/keys/*.private.json) must never be committed
// to a public repository — distribute it separately with the application binary.

import * as ed from '@noble/ed25519'
import PRIVATE_KEY_JWK from '../assets/keys/hdab-nl-signing-key-2025-v1.private.json'

const HDAB_NL_ISSUER = {
  authorityId:    'HDAB-NL',
  name:           'Health Data Access Body — Netherlands',
  country:        'NL',
  organizationId: 'NL-OIN-00000000008765432000',
  kid:            'hdab-nl-signing-key-2025-v1',
  algorithm:      'Ed25519',
}

export const LEGAL_BASES = [
  'EHDS Article 54(1)(a) — Scientific research',
  'EHDS Article 54(1)(b) — Commercial research',
  'EHDS Article 54(1)(c) — Policy making',
  'EHDS Article 54(1)(d) — Education and training',
]

export const DATA_CATEGORY_OPTIONS = [
  'Electronic health records',
  'Medical imaging data',
  'Genomic data (aggregated)',
  'Hospital discharge data',
  'Surgical procedure records',
  'GP prescription records',
  'Diagnosis codes',
  'Laboratory results',
  'Mental health records',
  'Vaccination records',
  'Wearable device data',
  'Claims data',
]

export const SPE_TYPES = [
  'Remote Access SPE',
  'On-site SPE',
  'Federated SPE',
]

export const DEFAULT_CONDITIONS = [
  'Data must be processed within the designated SPE only',
  'No re-identification of natural persons permitted',
  'Results must be reviewed by HDAB before publication',
  'Minimum cell size of 10 for all output tables',
]

export const EU_COUNTRIES = [
  'AT','BE','BG','CY','CZ','DE','DK','EE','ES','FI',
  'FR','GR','HR','HU','IE','IT','LT','LU','LV','MT',
  'NL','PL','PT','RO','SE','SI','SK',
]

function generatePermitId() {
  const year = new Date().getFullYear()
  const seq  = String(Math.floor(Math.random() * 89999) + 10001)
  return `EHDS-${year}-NL-${seq}`
}

// The fields covered by the signature — must match the validator's canonicalPayload exactly.
function canonicalPayload(permit) {
  return {
    permitId:       permit.permitId,
    issuedAt:       permit.issuedAt,
    expiresAt:      permit.expiresAt,
    issuerKid:      permit.issuer.kid,
    dataUser:       permit.dataUser,
    dataHolder:     permit.dataHolder,
    speOperator:    permit.speOperator,
    purpose:        permit.purpose,
    legalBasis:     permit.legalBasis,
    dataCategories: permit.dataCategories,
    datasets:       permit.datasets,
    conditions:     permit.conditions,
  }
}

function fromBase64Url(b64) {
  const b64std = b64.replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(b64std), c => c.charCodeAt(0))
}

function toBase64Url(bytes) {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

async function signPermit(permit) {
  const privateKeyBytes = fromBase64Url(PRIVATE_KEY_JWK.d)
  const encoded         = new TextEncoder().encode(JSON.stringify(canonicalPayload(permit)))
  const sigBytes        = await ed.sign(encoded, privateKeyBytes)
  return toBase64Url(sigBytes)
}

export async function issuePermit(formData) {
  const now        = new Date()
  const permitId   = generatePermitId()
  const validityMs = parseInt(formData.validityYears || '2') * 365.25 * 24 * 60 * 60 * 1000

  const permit = {
    permitId,
    status:    'valid',
    issuedAt:  now.toISOString(),
    expiresAt: new Date(now.getTime() + validityMs).toISOString(),
    issuer: {
      ...HDAB_NL_ISSUER,
      signature: null,
    },
    dataUser: {
      name:           formData.dataUserName,
      organizationId: formData.dataUserOrgId,
      country:        formData.dataUserCountry,
    },
    dataHolder: {
      name:           formData.dataHolderName,
      organizationId: formData.dataHolderOrgId,
      country:        formData.dataHolderCountry,
    },
    speOperator: {
      name:           formData.speOperatorName,
      organizationId: formData.speOperatorOrgId,
      speType:        formData.speType,
    },
    purpose:        formData.purpose,
    legalBasis:     formData.legalBasis,
    dataCategories: formData.dataCategories,
    datasets:       formData.datasets,
    conditions:     formData.conditions.filter(c => c.trim()),
    permitDocument: `HDAB-NL-PERMIT-${now.getFullYear()}-${permitId.split('-').pop()}.pdf`,
  }

  permit.issuer.signature = await signPermit(permit)
  return permit
}

export function exportPermitJson(permit) {
  const json = JSON.stringify(permit, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${permit.permitId}.json`
  // Must be in the DOM for the click to trigger a download in Chromium/Electron
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke after a tick so the browser has time to start the download
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
