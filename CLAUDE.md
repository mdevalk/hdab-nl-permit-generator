# CLAUDE.md — HDAB-NL Permit Generator

This file provides context for AI-assisted development on this repository.

## Project Purpose

This is the official permit issuance tool for the Health Data Access Body — Netherlands (HDAB-NL). It issues, signs and exports digital data access permits under the European Health Data Space (EHDS) regulation. The digital permit is a machine-readable, cryptographically signed JSON document that authorises a health data user to process specific datasets in a Secure Processing Environment (SPE).

## Regulatory Framework

### EHDS Regulation

**Regulation (EU) 2025/327** of the European Parliament and of the Council on the European Health Data Space.

Key articles for this project:

| Article | Subject |
|---|---|
| Art. 53(1) | Permitted purposes for secondary use of health data |
| Art. 67 | Health data access applications |
| Art. 68 | Granting of data permits; requirements and conditions |
| Art. 69 | Access to data in anonymised statistical format |
| Art. 70 | Implementing acts (application form, permit template) |
| Art. 71 | Right to opt out |
| Art. 72 | Trusted data holders |
| Art. 73 | Cross-border data access |

Full text: https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202500327

### TEHDAS2 Guidelines

TEHDAS2 (Towards the European Health Data Space, Joint Action 2) provides operational guidance for HDABs implementing the EHDS regulation.

| Document | Description | URL |
|---|---|---|
| **D6.3** | Guideline for HDABs on procedures and formats for data access. Contains **Annex 9** (data permit template) and **Annex 10** (data request approval template). Primary reference for the digital permit schema. | https://tehdas.eu/wp-content/uploads/2025/09/draft-guideline-for-health-data-access-bodies-on-the-procedures-and-formats-for-data-access.pdf |
| **M6.1** | Guideline for health data holders on making personal and non-personal electronic health data available for reuse | https://tehdas.eu/wp-content/uploads/2025/09/draft-guideline-for-health-data-holders-on-making-personal-and-non-personal-electronic-health-data-available-for-reuse.pdf |
| **M6.2** | Draft guideline for data users on good application and access practice | https://tehdas.eu/wp-content/uploads/2025/01/2025-01-20-tehdas2-milestone-6.2.pdf |
| **D7.1** | Guideline on how to use data in a secure processing environment | https://tehdas.eu/wp-content/uploads/2025/07/d7.1-guideline-on-how-to-use-data-in-a-secure-processing-environment.pdf |

## Digital Permit Schema

The permit schema is in `schema/permit.schema.json` (JSON Schema draft 2020-12). It is derived from the TEHDAS2 D6.3 Annex 9 paper permit template, keeping only fields strictly required for machine-readable verification and SPE access control.

### Legal Basis Values (Art. 54(1))

The `legalBasis` field is an enum restricted to the permitted purposes under EHDS Art. 53(1), expressed as Article 54(1) sub-references:

- `Art. 54(1)(a)` — public interest / public or occupational health
- `Art. 54(1)(b)` — policy-making and regulatory activities
- `Art. 54(1)(c)` — statistics
- `Art. 54(1)(d)` — education or teaching activities
- `Art. 54(1)(e)` — scientific research related to health or care
- `Art. 54(1)(f)` — improvement of delivery of care / optimisation of treatment

## Cryptographic Signing

- Algorithm: **Ed25519** via `@noble/ed25519` (pure JS, no Web Crypto API dependency)
- Key format: JWK (OKP, `crv: Ed25519`)
- Public key published at: `.well-known/jwks.json` (RFC 7517 + RFC 8037 compliant)
- Signature covers a canonical payload — a deterministic subset of permit fields
- Base64url encoding (RFC 4648 §5, no padding)

## Security Constraints

- The private key file (`src/assets/keys/*.private.json`) must **never** be committed to a public repository
- The key bundled in this repo is an **example key only** for development and demonstration
- Distribute the real signing key separately alongside the application binary

## Tech Stack

| Layer | Technology |
|---|---|
| Shell | Electron 33 |
| UI | React 18 + Vite 6 |
| Crypto | @noble/ed25519 + @noble/hashes |
| Packaging | electron-builder |
| Dev port | 5174 (validator uses 5173) |
