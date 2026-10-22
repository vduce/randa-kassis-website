# Production preparation and local preview

Branch: `production-prep/20261022`. Production content is authoritative. DEV test records are excluded.

Production was deployed on 22 October 2026. See [the deployment record](DEPLOYED-20261022.md) for the live configuration and verification; the sections below document the local preparation and preview.

## Current preview

- Public site: `http://localhost:3040/`
- Admin: `http://localhost:3040/admin`
- Runtime: Node.js `22.23.3`, production mode, bound to `127.0.0.1`.
- Private configuration: `.env.production-preview.local` (ignored by Git, permissions `0600`). It contains a local-only admin account and the production Bunny **read-only** key. Keep this file private.
- The server reads published metadata from `https://randakassis.com/metadata`, and Markdown from production storage zone `randa-kassis-website`, root `MDcontent/public`. Images/PDFs/videos continue to use their production CDN URLs.
- Both the server and UI reject content mutations in this preview. Tests for upload/edit/delete use disposable local fixtures and a mock storage origin.

Run from the repository root:

```sh
npm run build:production-preview
npm run start:production-preview
npm run verify:production-preview
```

The preview build is in `build-production/`; it is separate from the existing DEV build. The build wrapper blocks secrets from every CRA environment file, including a legacy `.env` loaded after the selected profile. Do not upload the private preview environment or treat this read-only profile as the final writable production configuration.

## Metadata already prepared and uploaded

`metadata/` contains the four indexes extracted from the current production bundle:

| Index | Entries |
| --- | ---: |
| articles.json | 52 |
| encounterAndDialogue.json | 60 |
| politicians.json | 108 |
| essayistandcritics.json | 32 |

They were installed as a new directory at `/home/randakas/public_html/metadata`. The existing production `index.html` and root `.htaccess` were verified unchanged, and the production Node application remains stopped. These are published content indexes, not credentials or private configuration. The local public pages and editor read the uploaded indexes through the local server, so no browser CORS workaround is required.

`snapshot.json` records the source bundle, counts and checksums. `npm run prepare:production` refreshes the local snapshot from the actual public production site; it does not upload files or write to Bunny. The metadata-only ZIP is generated under `.production-preview/`.

## Preserving the currently published content

The live production site still reads Markdown from Krystal. Four documents differ from Bunny's copies. Their current live versions are saved in `content-overrides/` and take precedence in both the local website and editor:

- `encounters/ed1.md`
- `encounters/ed4.md`
- `gallery/myeyes/myeyes1.md`
- `gallery/myeyes/myeyes5.md`

All other expected Markdown files were verified against production Bunny. Production SEO tags, two JSON-LD blocks, icons and the reviewed movement-link correction are preserved in `public/index.html` and its assets.

Before a later writable production deployment, reconcile these four files with Bunny using the captured checksums and a backup. Then clear `CONTENT_OVERRIDE_DIR` and `METADATA_SOURCE_URL`, point `METADATA_DIR` at the writable hosted indexes, and set `CONTENT_READ_ONLY=false`. An override directory or remote metadata source automatically keeps mutations disabled, even if the explicit read-only flag is omitted.

## Admin changes and recovery

Upload now uses the configured storage backend and updates the metadata index for indexed categories. Metadata failures are reported as partial failures; the editor stays open for retry instead of claiming a complete save.

Deletion removes only the selected document. Other filenames and public IDs remain stable; navigation follows the remaining metadata records. `.id-highwater.json` prevents deleted public IDs from being reused by future uploads. Keep this file when backing up or deploying metadata.

All storage/index mutations share a filesystem lock. Deletion saves the original document and index in a private recovery journal before making changes, restores them if a storage or metadata step fails, and blocks editing if recovery fails. Set `CONTENT_BACKUP_DIR` outside the web root. A process crash leaves `.mutation.lock` for deliberate inspection. Restore and verify the journal's files and metadata before manually clearing a recovery marker or stale lock; do not simply delete the lock to force writes through.

## Still required for the eventual production release

Repair/recreate the missing production Node app directory and virtual environment, select `server.js`, install runtime dependencies, configure fresh production admin credentials/session secret and the production write key, resolve the four preserved files, and align Passenger routing with `public_html`. Preserve existing site assets and canonical hostname behavior. Create a current private rollback backup before activation.

The existing `krystal-dev-deploy.py` remains DEV-only. No production application deployment, process start, or production Bunny write was performed during local preparation.

## Maintenance release prepared locally

See [MAINTENANCE-RUNBOOK.md](MAINTENANCE-RUNBOOK.md) for the approved-window procedure, verification and rollback. The [client notice](client-notice.html) proposes a 30-minute allowance with date/time pending approval. The [maintenance screen](maintenance/index.html) is self-contained. Production activation is deliberately stopped pending owner approval.
