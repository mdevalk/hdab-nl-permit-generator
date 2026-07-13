# HDAB-NL Permit Generator

A desktop application for issuing, signing and exporting EHDS health data access permits on behalf of the Health Data Access Body — Netherlands (HDAB-NL).

Built with Electron, React and Vite.

## Overview

Under the European Health Data Space (EHDS) regulation, Health Data Access Bodies (HDABs) are responsible for granting organisations access to health data for secondary use. This application allows HDAB-NL officers to:

- Fill in all permit fields (data user, data holder, SPE operator, legal basis, datasets, conditions)
- Cryptographically sign the permit with the HDAB-NL Ed25519 private key
- Export the signed permit as a self-contained JSON file

The exported permit file can be verified by any party using the public key published in the HDAB-NL JWKS endpoint.

## Cryptographic Signing

Permits are signed using Ed25519 (via [@noble/ed25519](https://github.com/paulmillr/noble-ed25519)). The signature covers a deterministic canonical payload — a fixed subset of the permit fields that represent the access grant. Fields that can change post-issuance (e.g. revocation status) are intentionally excluded from the canonical payload.

The issuer's public key is published at:

```
.well-known/jwks.json
```

This follows the convention that the issuing authority publishes its own public keys.

## Private Key

> **Security notice:** The private key file (`src/assets/keys/*.private.json`) must **never** be committed to a public repository. Distribute it separately alongside the application binary.

The key is loaded at runtime from `src/assets/keys/hdab-nl-signing-key-2025-v1.private.json` (JWK format).

## Permit Schema

The JSON Schema for EHDS permits is in `schema/permit.schema.json` (JSON Schema draft 2020-12). An example permit is in `examples/EHDS-2024-NL-00142.json`.

## Development

```bash
npm install
npm run dev
```

## Building

```bash
npm run build          # current platform
npm run build:win      # Windows (NSIS + MSI)
npm run build:mac      # macOS (DMG + PKG)
npm run build:linux    # Linux (AppImage + DEB + RPM)
```

## Stack

| Layer | Technology |
|---|---|
| Shell | Electron 33 |
| UI | React 18 + Vite 6 |
| Crypto | @noble/ed25519 + @noble/hashes |
| Packaging | electron-builder |

## License

MIT — see [LICENSE](LICENSE).
