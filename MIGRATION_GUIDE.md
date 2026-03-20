# Technical Migration Guide

Use this guide to ensure all features work correctly after moving the project out of Firebase Studio.

## 1. Firebase Client SDK
The file `src/firebase/config.ts` contains the public configuration. If you create a NEW Firebase project, update this file with the new keys.

## 2. Genkit AI Flows
All AI logic is located in `src/ai/flows/`. These use the `@genkit-ai/google-genai` plugin. Ensure your `GEMINI_API_KEY` is valid and has sufficient quota for:
- Training Module Generation
- Phishing Analysis
- Threat Scenario Simulation
- AI Tutor Chat

## 3. PayPal Live Integration
The project is configured for **Live Mode**. 
- The checkout logic is in `src/app/checkout/paypal/page.tsx`.
- The fulfillment logic (updating the user to 'paid' status) happens in the `onApprove` callback.

## 4. Tiered Access Logic
The `src/components/ads/ad-banner.tsx` component handles the display of ads. It checks the `accountType` field in the Firestore `users` collection.
- `accountType: "free"` -> Shows AdBanner
- `accountType: "paid"` -> Hides AdBanner

## 5. Security Rules
The `firestore.rules` file is production-ready. It uses a tiered RBAC (Role-Based Access Control) system based on the `user_roles` collection.

## 6. Multi-language Support
Translations are managed in `src/locales/`. To add a new language:
1. Create a new JSON file (e.g., `de.json`).
2. Update the `supportedLocales` array in `src/context/LocaleContext.tsx`.
