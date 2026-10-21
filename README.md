# Randa Kassis website

React (Create React App) renders the public website and `/admin`. Express in `server.js` serves `build/`, the writable JSON indexes in `metadata/`, and the authenticated Bunny Storage proxy. Markdown lives in the `parallelglobe` storage zone under `public/public/`; images, videos and PDFs use the separate Randa media CDN. Keep this shared storage root scoped to Randa content.

## Local commands

- `npm install --legacy-peer-deps` installs the existing React dependency tree.
- `npm run build` creates a build with root-relative asset URLs and removes credentials from CRA's public environment.
- `node server.js` serves the compiled app and APIs (use Node.js 20, matching Krystal).
- `node --test server/admin.test.cjs` checks login, request protection, path restrictions and metadata writes using isolated fixtures and a mock storage server.

`npm start` runs only CRA; it does not run Express. Prefer the compiled app for deployment validation.

## Configuration

Keep secrets in the server `.env` or hosting environment, outside Git and browser bundles:

```dotenv
BUNNY_STORAGE_ZONE=parallelglobe
BUNNY_STORAGE_API_KEY=<storage-zone-password>
BUNNY_STORAGE_ENDPOINT=https://storage.bunnycdn.com
BUNNY_CONTENT_ROOT=public/public
ADMIN_EMAIL=<existing-admin-email>
ADMIN_PASSWORD=<admin-password>
ADMIN_SESSION_SECRET=<random-server-secret>
ADMIN_ORIGIN=https://dev.randakassis.com
```

Legacy `REACT_APP_ADMIN_*` and `REACT_APP_BUNNY_STORAGE_*` values are accepted by the server during migration. Do not embed those secrets in a React build. The build wrapper blanks sensitive `REACT_APP_*` values even if they exist in a legacy local `.env`.

Public build settings are optional: `REACT_APP_PROXY_URL` (API origin; blank means same origin), `REACT_APP_METADATA_URL` (defaults to the API origin plus `/metadata`), `REACT_APP_CONTENT_CDN` (defaults to `https://pgcdn.b-cdn.net/public/public`), `REACT_APP_STORAGE_MODE=bunny`, and `REACT_APP_BUNNY_CONTENT_ROOT=public/public`. Server settings require a restart; public build settings require a rebuild.

## Krystal DEV deployment

The Node.js application root is `/home/randakas/dev.randakassis.com`, startup file `server.js`, Node.js 20, production mode. Passenger manages the process. Deploy `server.js`, `server/adminAuth.js` and the compiled `build/` together. Existing runtime dependencies are Express, CORS and dotenv. Preserve the hosting `.htaccess` Passenger configuration.

Before replacement, make a private backup outside the document root of `build/`, `server.js`, `server/`, `.env`, `.htaccess`, and `metadata/`. Never overwrite the live `metadata/` indexes with the repository or build copies. Block direct Apache access to server code, configuration, logs, archives and dotfiles, and set metadata responses to revalidate. Restart the Node app after replacement.

Verify `/metadata/api/health`, the four metadata indexes, `/articles`, article details, the other three indexed sections, and direct `/admin/dashboard` navigation. Log in again after replacing the legacy browser-only sessions. Authenticated storage lists must return the existing files; anonymous storage operations and metadata writes must return 401. Rollback uses the private backup, preserving live content.

Lists render metadata immediately. They no longer wait for every Markdown file in a category to download. Detail pages fetch Markdown from the configured content CDN. CDN caching can still affect when an edited Markdown document becomes visible.
