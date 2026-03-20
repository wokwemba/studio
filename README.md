# CyberGuard Studio - Project Handover

CyberGuard is an AI-powered cybersecurity platform that bridges the gap between individual education and enterprise protection.

## 🚀 Getting Started in a New Environment

### 1. Installation
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file and add the following:
- `NEXT_PUBLIC_FIREBASE_CONFIG`: Your client-side Firebase configuration.
- `PAYPAL_CLIENT_ID`: Your PayPal REST API Client ID.
- `GEMINI_API_KEY`: Your Google AI Studio API key for Genkit.

### 3. Firebase Setup
- Enable **Firestore** and **Authentication** in the Firebase Console.
- Deploy the security rules found in `firestore.rules`.
- Ensure the `User` document structure matches the schema in `docs/backend.json`.

### 4. Development
```bash
npm run dev
```

## 🛠 Project Architecture
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Firebase Auth & Firestore
- **AI Engine**: Genkit v1.x (Google Generative AI)
- **Payments**: PayPal JavaScript SDK
