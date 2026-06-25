// In production, replace mockSign() with real RS256 signing against the HDAB-NL private key.

const HDAB_NL_ISSUER = {
  authorityId: 'HDAB-NL',
  name: 'Health Data Access Body — Netherlands',
  country: 'NL',
  organizationId: 'NL-OIN-00000000008765432000',
  keyId: 'hdab-nl-signing-key-2024-v1',
  algorithm: 'RS256',
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
  const seq = String(Math.floor(Math.random() * 89999) + 10001)
  return `EHDB-${year}-NL-${seq}`
}

function mockSign(permit) {
  const header  = btoa(JSON.stringify({ alg: HDAB_NL_ISSUER.algorithm, kid: HDAB_NL_ISSUER.keyId }))
  const payload = btoa(JSON.stringify({ permitId: permit.permitId, issuedAt: permit.issuedAt, sub: permit.dataUser.organizationId }))
  const sig     = btoa('hdab-nl-mock-sig-' + permit.permitId)
  return `${header}.${payload}.${sig}`
}

export function issuePermit(formData) {
  const now       = new Date()
  const permitId  = generatePermitId()
  const validityMs = parseInt(formData.validityYears || '2') * 365.25 * 24 * 60 * 60 * 1000

  const permit = {
    permitId,
    status: 'valid',
    issuedAt:  now.toISOString(),
    expiresAt: new Date(now.getTime() + validityMs).toISOString(),
    issuer: {
      ...HDAB_NL_ISSUER,
      signature: null,
      signatureValid: true,
    },
    dataUser: {
      name: formData.dataUserName,
      organizationId: formData.dataUserOrgId,
      country: formData.dataUserCountry,
    },
    dataHolder: {
      name: formData.dataHolderName,
      organizationId: formData.dataHolderOrgId,
      country: formData.dataHolderCountry,
    },
    speOperator: {
      name: formData.speOperatorName,
      organizationId: formData.speOperatorOrgId,
      speType: formData.speType,
    },
    purpose:        formData.purpose,
    legalBasis:     formData.legalBasis,
    dataCategories: formData.dataCategories,
    datasets:       formData.datasets,
    conditions:     formData.conditions.filter(c => c.trim()),
    permitDocument: `HDAB-NL-PERMIT-${now.getFullYear()}-${permitId.split('-').pop()}.pdf`,
  }

  permit.issuer.signature = mockSign(permit)
  return permit
}

export function exportPermitJson(permit) {
  const json = JSON.stringify(permit, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${permit.permitId}.json`
  a.click()
  URL.revokeObjectURL(url)
}
