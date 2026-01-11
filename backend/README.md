# Health Vault — Backend

## Project overview
A small Express.js API that powers the Health Vault application. It provides user authentication, profile management, file-backed health report uploads, vitals tracking, and simple sharing of reports. The project uses sql.js (SQLite compiled to WASM) and persists the database to a local file.

## Tech stack
- Node.js + Express
- sql.js (SQLite in WASM)
- JWT authentication (`jsonwebtoken`)
- Password hashing with `bcryptjs`
- File uploads with `multer`
- Utilities: `uuid`, `dotenv`, `cors`

## Quick setup
1. From the `backend` directory install dependencies:

```bash
npm install
```

2. Create a `.env` file in `backend/` with at minimum:

```
JWT_SECRET=your-very-secret-key
# optional
JWT_EXPIRES_IN=7d
PORT=3001
UPLOAD_DIR=./uploads
```

3. Start the server:

```bash
npm run dev   # or `npm start` for production mode`
```

The server will initialize the database (`database/health_vault.db`) and create an uploads directory if missing.

## Environment variables
- `JWT_SECRET` (required): secret used to sign and verify JWTs. Server exits if missing.
- `JWT_EXPIRES_IN` (optional): token lifetime (default: `7d`).
- `PORT` (optional): server port (default: `3001`).
- `UPLOAD_DIR` (optional): directory where uploaded report files are stored (default: `backend/uploads`).

## Database summary
The app uses sql.js and persists to `database/health_vault.db`. Tables created at startup:
- `users` — authentication records: `id`, `email`, `password_hash`, `created_at`.
- `profiles` — user profiles: `id`, `user_id` (links `users.id`), `full_name`, `email`, `role` (`owner`|`viewer`), `avatar_url`, timestamps.
- `health_reports` — uploaded reports: `id`, `user_id`, `title`, `report_type`, `report_date`, `file_path`, `file_name`, `file_size`, `notes`, timestamps.
- `vitals` — recorded vitals: `id`, `user_id`, `vital_type`, `value`, `unit`, `recorded_at`, `notes`, timestamps.
- `shared_reports` — sharing records: `id`, `report_id`, `owner_id`, `shared_with_email`, `shared_with_user_id`, `access_type` (`read`), `created_at`, `expires_at`.

Indexes are created on several foreign keys and email fields for query performance.

## API endpoints (summary)
All API routes are mounted under `/api`.

Auth
- `POST /api/auth/register` — { email, password, fullName } → creates user+profile, returns `{ user, token }`.
- `POST /api/auth/login` — { email, password } → returns `{ user, profile, token }`.
- `GET /api/auth/me` — Bearer token → returns current user and profile info.

Profiles
- `GET /api/profiles/:userId` — authenticated; users can only view their own profile.
- `GET /api/profiles/email/:email` — authenticated; returns `{ user_id, email }` used for sharing lookups.
- `PUT /api/profiles/:userId` — authenticated; users can update `full_name` and `avatar_url` on their profile.

Reports
- `GET /api/reports` — authenticated; optional query filters: `report_type`, `startDate`, `endDate`, `searchQuery`.
- `GET /api/reports/shared` — authenticated; reports shared with the user.
- `POST /api/reports` — authenticated; multipart form with `file` + fields `title`, `report_type`, `report_date`, `notes`. Viewers are not allowed to upload.
- `GET /api/reports/download/:id` — authenticated; download report if owner or shared with user.
- `DELETE /api/reports/:id` — authenticated; owner-only (and viewers cannot delete) — deletes DB record and file.

Vitals
- `GET /api/vitals` — authenticated; optional filters: `vital_type`, `startDate`, `endDate`.
- `POST /api/vitals` — authenticated; { vital_type, value, unit, recorded_at?, notes? } — viewers cannot create.
- `DELETE /api/vitals/:id` — authenticated; deletes a vital belonging to the user.

Sharing
- `GET /api/sharing/shared-by-me` — authenticated; list of shares created by the user.
- `GET /api/sharing/shared-with-me` — authenticated; list of shares where current user is recipient.
- `POST /api/sharing` — authenticated; { report_id, email } — share an owned report with an email address.
- `DELETE /api/sharing/:id` — authenticated; revoke a share (owner only).

Notes:
- Many endpoints enforce role-based restrictions via checks against the `profiles` table (`role` = `owner` or `viewer`).
- File uploads are limited to images/PDFs and 10MB by default.

## Authentication flow
- Registration and login endpoints create/verify credentials in the `users` table. Passwords are hashed using `bcryptjs`.
- On successful register/login the server issues a JWT (signed with `JWT_SECRET`) containing `{ id, email }` and optionally expires per `JWT_EXPIRES_IN`.
- Protected endpoints expect an `Authorization: Bearer <token>` header. The `authenticateToken` middleware verifies the token and sets `req.user` to the decoded payload.
- Routes use `req.user.id` to scope queries and enforce ownership and role-based authorization.

## File storage
Uploaded report files are saved under `UPLOAD_DIR` (default `backend/uploads`) organized by `userId` subfolders. The DB stores `file_path` relative to the upload directory.

## Where to look in code
- Server entry: [server.js](server.js)
- Routes: [routes/auth.js](routes/auth.js), [routes/profiles.js](routes/profiles.js), [routes/reports.js](routes/reports.js), [routes/vitals.js](routes/vitals.js), [routes/sharing.js](routes/sharing.js)
- DB wrapper/init: [database/db.js](database/db.js), [database/init.js](database/init.js)
- Auth middleware: [middleware/auth.js](middleware/auth.js)

If you want, I can: run the server locally, add example requests, or extend the README with example curl requests. Which would you prefer next?
