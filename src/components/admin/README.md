# Admin panel

`/admin` redirects to the dashboard and requires a server-validated login. `AuthContext` reads `/api/admin/session`, posts credentials to `/api/admin/login`, and clears the session through `/api/admin/logout`. The server issues a signed, HttpOnly, SameSite cookie with a 12-hour lifetime. Legacy localStorage sessions do not grant access.

Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, and `ADMIN_ORIGIN` on the server. Existing server-side `REACT_APP_ADMIN_*` values remain a migration fallback. No admin or storage credentials are required in the public build.

Every storage operation and metadata mutation requires authentication. Mutations additionally require the admin request header and a permitted request origin. Storage paths are restricted to Markdown files in the configured Randa content directories. Folder permission prompts apply only to explicitly configured local storage mode; Bunny failures offer Retry.

Run `node --test server/admin.test.cjs` for isolated API checks. See the root README for Krystal deployment and rollback guidance.
