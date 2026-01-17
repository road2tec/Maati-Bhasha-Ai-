# MaatiBhasha AI

A Next.js app that provides AI-powered Marathi dialect translation. The project was originally implemented with Firebase and has been migrated to use MongoDB Atlas for authentication and user management.

---

## Features

- Translate Standard Marathi to regional dialects.
- Speech-to-text input (mic support).
- User authentication (register, login, logout).
- Admin panel for user management (block/unblock, delete, role management).
- Chatbot and translation UI components.

---

## Quick Links

- Local dev server: `http://localhost:9002`
- Test MongoDB connection: `GET /api/test-db`

---

## Requirements

- Node.js >= 18
- npm
- A MongoDB Atlas cluster (connection URI)

---

## Environment Variables

Create a `.env` file (or update the existing one) with these values:

```env
GEMINI_API_KEY=your_google_genai_key_or_similar
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DB_NAME=MaatiBhashaAI
JWT_SECRET=your_jwt_secret_here
```

Notes:
- Do NOT commit `.env` to version control.
- Example of the MongoDB URI format:
	`mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority`

---

## Install

```bash
npm install
```

---

## Run (development)

```bash
npm run dev
```

By default the app is configured to run on port `9002` (see `package.json`).

---

## API Endpoints (important ones)

- `POST /api/auth/register` — Register a new user (expects `{ email, password, username }`)
- `POST /api/auth/login` — Login (expects `{ email, password }`)
- `POST /api/auth/logout` — Logout (clears auth cookie)
- `GET /api/auth/me` — Get current user (uses cookie-based JWT)
- `GET /api/users` — (Admin) List users
- `PATCH /api/users` — (Admin) Update user block status
- `DELETE /api/users` — (Admin) Delete a user
- `GET /api/test-db` — Test MongoDB connection (added for debugging)

These endpoints are implemented as Next.js route handlers under `src/app/api/`.

---

## Auth & Sessions

- Authentication uses JWT stored in an HTTP-only cookie named `auth-token`.
- JWT creation/verification is in `src/lib/auth.ts`.
- The app-level React context is `src/contexts/auth-context.tsx` which exposes `useAuth()`.

---

## MongoDB Integration

- MongoDB connection helper: `src/lib/mongodb.ts` which uses the `mongodb` driver and reads `MONGODB_URI` and `MONGODB_DB_NAME`.
- Database helper functions are in `src/lib/db-operations.ts`.
- Collections used:
	- `users` — stores user documents (created on-demand)

If you want to change the collection or DB name, update `MONGODB_DB_NAME` in your `.env`.

---

## Migration Notes (Firebase → MongoDB)

- The Firebase-specific codebase remained in `src/firebase/`, but active UI/routes were migrated to use the MongoDB-based `AuthProvider` and `useAuth()`.
- Header, Translator page, Admin page, Login/Register forms were updated to use `useAuth()`.
- You may safely remove the `src/firebase/` directory and uninstall `firebase` from `package.json` if Firebase is no longer required.

To remove Firebase and its code:

```bash
npm uninstall firebase
# then delete src/firebase folder and any remaining imports referring to it
```

---

## Troubleshooting

- If you see `Internal server error` during register/login:
	- Check the server terminal for logs. Detailed logs were added to `src/app/api/auth/login/route.ts` and `src/app/api/auth/register/route.ts`.
	- Test DB connection: `GET /api/test-db` in your browser.
	- Verify `.env` values are correct and the app was restarted after changes.

- If the app reports `useFirebase must be used within a FirebaseProvider`:
	- Make sure components are not importing `useFirebase` anymore. The codebase now uses `useAuth()` from `src/contexts/auth-context.tsx`.

---

## Testing the DB connection

Start the dev server and open:

```
http://localhost:9002/api/test-db
```

You should see a JSON response confirming the DB connection. If it fails, check the server console for the detailed error logged by `src/lib/mongodb.ts`.

---

## Contributing

- Create a feature branch, run the app locally, and open a PR with a description of the change.
- Run `npm run lint` and `npm run typecheck` before submitting a PR.

---

## License

This project does not include a license by default. Add one if you plan to open-source it.

---

## Contacts & Credits

Maintainer: Your team

If you want, I can also:
- Remove all remaining Firebase code
- Add CI checks for lint/typecheck
- Add tests for API endpoints

