# HDAB-NL Permit Generator

A cross-platform desktop application for issuing, signing and exporting EHDS health data access permits on behalf of the Health Data Access Body — Netherlands (HDAB-NL). Built with Electron, React, and Vite.

## Overview

Under the European Health Data Space (EHDS) regulation, Health Data Access Bodies (HDABs) are responsible for granting organisations access to health data for secondary use. This application allows HDAB-NL officers to:

- Fill in all permit fields (data user, data holder, SPE operator, legal basis, datasets, conditions)
- Cryptographically sign the permit with the HDAB-NL Ed25519 private key
- Export the signed permit as a self-contained JSON file

The exported permit file can be verified by any party using the public key published in the HDAB-NL JWKS endpoint.

## Features

- **Ed25519 signing** — signs permits with the HDAB-NL private key using `@noble/ed25519`; no dependency on the Web Crypto API
- **Canonical payload** — the signature covers a deterministic, fixed subset of permit fields; fields that can change post-issuance (e.g. revocation state) are excluded
- **JSON export** — produces a self-contained, portable permit file ready for distribution
- **Multi-platform builds** — packages for Windows (NSIS/MSI), macOS (DMG/PKG), and Linux (AppImage/DEB/RPM)

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- The HDAB-NL signing key (see [Private Key](#private-key) below)

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

This starts the Vite dev server on port 5173 and launches Electron pointing at it.

### Build a distributable

```bash
npm run build          # current platform
npm run build:win      # Windows
npm run build:mac      # macOS
npm run build:linux    # Linux
```

## Cryptographic Signing

Permits are signed using Ed25519 (via [@noble/ed25519](https://github.com/paulmillr/noble-ed25519)). The canonical payload — the object that is actually signed — covers: `permitId`, `issuedAt`, `expiresAt`, `issuerKid`, `dataUser`, `dataHolder`, `speOperator`, `purpose`, `legalBasis`, `dataCategories`, `datasets`, and `conditions`.

The issuer's public key is published at `.well-known/jwks.json` following the convention that an issuing authority publishes its own public keys.

## Private Key

> **Security notice:** The private key file (`src/assets/keys/*.private.json`) must **never** be committed to a public repository. Distribute it separately alongside the application binary.

The key bundled in this repository (`src/assets/keys/hdab-nl-signing-key-2025-v1.private.json`) is an **example key only**. It is included solely to allow the application to run out of the box for development and demonstration purposes.

The key is loaded at runtime from `src/assets/keys/hdab-nl-signing-key-2025-v1.private.json` (JWK format, OKP/Ed25519).

## Permit Schema

The JSON Schema for EHDS permits is in `schema/permit.schema.json` (JSON Schema draft 2020-12). An example permit is in `examples/EHDS-2024-NL-00142.json`.

## Project Structure

```
├── electron/
│   └── main.cjs                          # Electron main process
├── examples/
│   └── EHDS-2024-NL-00142.json           # Example signed permit
├── schema/
│   └── permit.schema.json                # JSON Schema for EHDS permits
├── src/
│   ├── App.jsx                           # Root component
├── assets/
│   │   └── keys/
│   │       └── *.private.json            # Signing key (not committed to public repos)
│   ├── components/
│   │   └── PermitForm.jsx                # Permit creation form
│   └── services/
│       └── permitGeneratorService.js     # Ed25519 signing and JSON export
└── package.json
```

## License

MIT — see [LICENSE](LICENSE).
