# CLAUDE.md

## 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No “flexibility” or “configurability” that wasn’t requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: “Would a senior engineer say this is overcomplicated?” If yes, simplify.

## 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Don’t “improve” adjacent code, comments, or formatting.
- Don’t refactor things that aren’t broken.
- Match existing style, even if you’d do it differently.
- If you notice unrelated dead code, mention it — don’t delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don’t remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user’s request.

## Regulatory Context

This project is an open-source, community-driven desktop application for Health Data Access
Bodies (HDABs) to issue, sign and export digital data access permits under the EHDS regulation.
Always use the **final** Regulation numbering, not the draft-proposal numbering.

The digital permit is a machine-readable, cryptographically signed JSON document (Ed25519)
that authorises a health data user to process specific datasets in a Secure Processing
Environment (SPE). The permit schema is derived from TEHDAS2 D6.3 Annex 9, keeping only
fields strictly required for machine-readable verification and SPE access control.

### EHDS Legal Text

- **Regulation (EU) 2025/327** establishing the European Health Data Space (EHDS) —
  <https://eur-lex.europa.eu/eli/reg/2025/327/oj/eng>
  - Relevant part: **Chapter IV — Secondary use of electronic health data** (Articles 51–80).
  - Key articles used in this codebase: Art. 53 (purposes for secondary use), Art. 54
    (legal basis values for `legalBasis` field), Art. 67 (health data access applications),
    Art. 68 (data permit), Art. 73 (secure processing environment).

### TEHDAS2 Documentation

- **D6.3 — Guideline for HDABs on the procedures and formats for data access** (contains
  **Annex 9** — data permit template, and **Annex 10** — data request approval template;
  primary reference for the digital permit schema) —
  <https://tehdas.eu/wp-content/uploads/2025/09/draft-guideline-for-health-data-access-bodies-on-the-procedures-and-formats-for-data-access.pdf>
- **D6.2 — Guideline for data users on good application and access practice** —
  <https://tehdas.eu/wp-content/uploads/2025/10/d6.2-guideline-for-data-users-on-good-application-and-access-practice.pdf>
- **D7.1 — Guideline on how to use data in a secure processing environment** —
  <https://tehdas.eu/wp-content/uploads/2025/07/d7.1-guideline-on-how-to-use-data-in-a-secure-processing-environment.pdf>

### Cryptographic Signing

- Algorithm: **Ed25519** via `@noble/ed25519` (pure JS, no Web Crypto API dependency)
- Key format: JWK (OKP, `crv: Ed25519`)
- Public key published at `.well-known/jwks.json` (RFC 7517 + RFC 8037 compliant)
- Signature covers a canonical payload — a deterministic subset of permit fields
- Base64url encoding (RFC 4648 §5, no padding)
- The private key file (`src/assets/keys/*.private.json`) must **never** be committed to a
  public repository; the bundled key is an **example key only**
