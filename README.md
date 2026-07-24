# DeepLink Menu Web

Customer-facing digital restaurant menus built with Next.js, React, Tailwind
CSS, and Firebase Firestore.

## Routes

- `/` — DeepLink landing page
- `/menu/[businessId]` — a restaurant's live menu

## Firestore data

The menu reads:

- `businesses/{businessId}`
- `businesses/{businessId}/menuItems`

A business must have `subscription.status` set to `active` and an unexpired
`subscription.expiresAt` value before its menu is displayed.

The browser-side subscription check is a presentation control, not a security
boundary. The included `firestore.rules` independently restrict menu-item reads
to active subscriptions, block public business collection enumeration, and
preserve authenticated owner access.

## Development

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run lint
npm test
npm run build
```

Validate and deploy the Firestore rules with the Firebase CLI:

```bash
firebase emulators:exec --only firestore "npm test"
firebase emulators:exec --only firestore "npm run test:rules"
firebase deploy --only firestore:rules
```

The Firebase web configuration in `lib/firebase.js` identifies the public
Firebase project. Firebase web API keys are not server secrets; access control
must be implemented with Firestore Security Rules and, where appropriate,
Firebase App Check.
