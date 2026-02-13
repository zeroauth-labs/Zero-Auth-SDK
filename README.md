# Zero Auth SDK 📦
[![Organization](https://img.shields.io/badge/Organization-zeroauth--labs-blue.svg)](https://github.com/zeroauth-labs)

A lightweight Frontend SDK to integrate **Zero Auth** into any web application in minutes.

## ✨ Features
- **Ready-to-use Modals**: Built-in QR code display and status handling.
- **Simple API**: Promise-based verification flow.
- **Framework Agnostic**: Works with React, Vue, Svelte, or vanilla JS.

## 🚀 Quick Start (Draft)

```typescript
import { ZeroAuth } from '@zeroauth-labs/sdk';

const verifier = new ZeroAuth({
  relayUrl: 'https://relay.zeroauth.app'
});

const result = await verifier.verify({
  claims: ['age_over_18'],
  verifier_name: 'My Cool App'
});

if (result.success) {
  console.log('Verified!', result.proof);
}
```

## 🏗️ Technical Flow
1. **`verify()`**: Calls the Relay to create a session.
2. **UI**: Opens a modal with the generated QR code.
3. **Poll**: Repeatedly checks the Relay for session status updates.
4. **Resolve**: Returns the ZK proof payload once the wallet has submitted it.

## 🛠️ Development
- **Build Tool**: Vite / Microbundle
- **Language**: TypeScript

---
Built by [Zero Auth Labs](https://github.com/zeroauth-labs)
