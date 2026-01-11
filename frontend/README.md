# Health Wallet — Frontend

## Project purpose
Health Wallet is the client application for managing personal health data: user authentication and profiles, uploading and downloading health reports, tracking vitals, and sharing reports with other users.

## Tech stack
- Vite + React
- Tailwind CSS + shadcn-ui components
- Redux Toolkit for state management
- Axios for API calls
- TypeScript tooling configuration present, project code uses JavaScript/JSX

## Run locally
1. Install dependencies from the `frontend` folder:

```bash
npm install
```

2. Create a `.env` in `frontend/` (optional) to point to the backend API:

```
VITE_API_URL=http://localhost:3001/api
```

3. Start the dev server:

```bash
npm run dev
```

The app will run via Vite (default port shown in terminal). Ensure the backend is running and `VITE_API_URL` targets it.

## Pages overview
- `Index` — Landing/marketing page.
- `Login` / `Register` — Authentication pages.
- `Dashboard` — Main authenticated view with summaries.
- `Reports` — List, search, filter, download, delete reports.
- `Upload` — Upload a new health report (file + metadata).
- `Shared` — Reports shared with you and those you shared.
- `Vitals` — List and create vitals records.
- `NotFound` — 404 fallback.

## State management
The app uses Redux Toolkit (see `src/store/index.js`) with slices:
- `auth` — holds `user`, `profile`, `isAuthenticated`, and loading state (`src/store/slices/authSlice.js`).
- `reports`, `vitals`, `sharing` — separate slices manage their respective collections and UI loading/errors.

Components use standard React-Redux hooks (`useDispatch`, `useSelector`) and small custom hooks in `src/hooks/` for convenience.

## API integration
All HTTP interactions use the shared Axios instance at `src/lib/api.js` which:
- Reads `VITE_API_URL` (defaults to `http://localhost:3001/api`).
- Adds a `Authorization: Bearer <token>` header from `localStorage` when present.
- Intercepts `401/403` responses to clear auth and redirect to `/login`.

Front-end components call endpoints under `/api/*` via this `api` client (example: `/api/auth`, `/api/reports`, `/api/vitals`, `/api/sharing`).

## Authentication flow
- Users register or login via `/api/auth` endpoints; backend returns a JWT and basic user/profile data.
- The app stores the JWT (in `localStorage`) and the `auth` slice holds the user/profile.
- The `api` Axios client attaches the JWT to requests; protected UI routes use client-side checks (e.g., `ProtectedRoute` component) against the `auth` state.
- On token expiration or auth error, the interceptor clears stored auth data and navigates to `/login`.

## Future scope and notable constraints
- Viewer role: the backend and client enforce a `viewer` role that is read-only (no uploads or deletes). This is intentional for access control and can be extended in future scope to allow role customization or finer permissions.
- Vitals association: vitals are currently scoped to the authenticated user profile. Future scope could include tagging vitals to related profiles, family linking, or richer metadata.

## Key files
- API client: [src/lib/api.js](src/lib/api.js)
- Store: [src/store/index.js](src/store/index.js)
- Auth slice: [src/store/slices/authSlice.js](src/store/slices/authSlice.js)
- Routes/components: `src/pages/` (see `src/pages/Reports.jsx`, `src/pages/Vitals.jsx`, etc.)

If you'd like, I can add example curl commands or a Postman collection for the most-used flows (login, upload report, create vital). Which would you prefer next?
