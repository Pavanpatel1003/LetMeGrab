# LetMeGrab

LetMeGrab is a responsive product catalog workspace for small business owners. It helps organize product names, categories, descriptions, images, and prices. It is not an ecommerce, ordering, payments, delivery, or stock-tracking system.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Scripts

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production bundle in `dist/`.
- `npm run preview` serves the production bundle locally.
- `npm test` runs the Vitest suite once.

## Included workflows

- Create an account, sign in, remember a session, and log out.
- View dashboard summaries and recently added products.
- Add, edit, search, sort, filter, and delete products.
- Upload optional JPG, PNG, or WebP product images up to 3 MB. Image blobs are stored in IndexedDB, not as base64 in LocalStorage.
- Add, rename, and delete categories. When a category has products, choose another category or Uncategorized before deleting it.
- Update profile and business preferences, choose currency and theme, export JSON/CSV, and clear the current account catalog.

## Local demo data

User accounts, profile settings, categories, and product records are stored in this browser. Each account uses a separate catalog key, but data does not synchronize between browsers, devices, or different people. Existing prototype data is migrated on first launch: the old plaintext password is converted to a salted PBKDF2 hash, and old product records are assigned to the first migrated account.

Authentication is demonstration-only. Passwords are hashed with Web Crypto and are not stored as plaintext, but browser storage is controlled by the user and is not a secure identity system. Before handling real accounts, replace `authService.js` with a server-side authentication service, use secure server-managed sessions, and move catalog data to a database. The forgot-password action is intentionally informational because this local app has no email service.

## Data model

Products are stored with `id`, `name`, `categoryId`, `price`, `image`, `description`, `createdAt`, and `updatedAt`. Categories have `id`, `name`, and `createdAt`. Product image blobs are keyed in IndexedDB; exported JSON includes product records but not image file contents.