# Production maintenance release

**Owner-approved deployment: user authorized proceeding now on 22 October 2026, allowing approximately one hour of downtime. Maintenance page must show no duration, contact button or email address.**

Approved allowance: approximately 60 minutes. At minute 45, choose verified reopening or rollback. This is a planning allowance, not a guarantee. If recovery cannot finish within the allowance, keep the maintenance page active and update the owner before the window ends. No temporary public preview hostname is required.

## Exact target and scope

- Website: `https://randakassis.com`; `www` will redirect to this canonical hostname.
- Krystal account: `randakas`, cPanel host `p119.lon.krystal.io`.
- Document root: `/home/randakas/public_html`.
- Production Node app root: `/home/randakas/randa-kassis-website`; Node `22.23.3`, production mode, startup `server.js`.
- Bunny zone: `randa-kassis-website`, root `MDcontent/public`, endpoint `https://storage.bunnycdn.com`.
- Hosted metadata: `/home/randakas/public_html/metadata`; 52 articles, 60 encounters, 108 politicians, 32 critics. Keep `.id-highwater.json` and all private recovery markers if they exist later.
- The current production app entry is stopped and references `app.js`; its app directory and virtual environment were missing at inspection. Repairing this hosting configuration is an explicit deployment step. Actual Krystal Passenger startup cannot be proven by a local test.
- DEV test entries `ed61.md` and `po109.md` are excluded. Existing production content is authoritative.

## Prepared artifacts

`python3 scripts/package-production.py` creates `.production-release/randa-production-<UTC>.zip`, its SHA256 sidecar and `latest.json` on the preparation computer. This ZIP contains the application build, minimal pinned runtime package/lock, guarded maintenance scripts, four reviewed content copies, metadata references and this runbook. It contains no credentials and no `node_modules`. Metadata references are outside the installed payload and are never blindly copied over live indexes.

Private `.env.production-release.local` is separate, ignored by Git, mode `0600`. It contains the existing production Bunny write key and fresh proposed admin credentials/session secret. It has not been uploaded or activated. It initially holds editing with `CONTENT_READ_ONLY=true`. Do not send this file to the client, commit it, put it in the public web root, or reuse the preview credentials.

Client materials: `client-notice.html`, `maintenance/index.html`, and `.production-release/client/maintenance-preview.jpg`. Date/start time are deliberately unconfirmed. These can be shared without the release configuration.

## Before the approved window

1. Obtain the owner's approval and stop editorial/file-manager changes for the window. Confirm the owner is reachable for progress updates. No email is sent automatically.
2. Recheck the live index and metadata against `release-manifest.json`; scripts refuse a changed baseline. If anything changed since preparation, rebuild/review before starting.
3. Check cPanel access, Python 3, Node 22 availability, free disk for a full `public_html` backup, and a writable account-private release directory. The recorded stopped/missing Node configuration needs review in cPanel before activation; do not alter the running DEV app.
4. After approval, upload/extract the release ZIP under `/home/randakas/releases/`, **not** into `public_html`. Verify the ZIP SHA256 against the local sidecar, then run `sha256sum -c SHA256SUMS` inside its extracted directory. All must pass.
5. Run `python3 production-window.py plan`. This is read-only. Keep the private env file ready for transfer to the app root after installation. Ensure enough time remains for startup repair and rollback; defer the window if access/disk prerequisites fail.

## Minutes 0–5: backup and maintenance

From the extracted release directory, only after approval:

```sh
python3 production-window.py begin --approved-window
```

The script verifies production index/metadata checksums, makes a private full website copy under `/home/randakas/randa-production-window/website-before`, records the original routing checksum, installs the branded maintenance page and enables the `.randa-maintenance` flag. Existing window state is never overwritten. Archive any historical state only after deliberately reviewing it.

Check root, `/articles`, `/admin` and an API request from a normal browser/network request: **503**, the branded page, `Retry-After: 600`, and `Cache-Control: no-store`. Confirm HTTPS still works on apex and www. If the page is not correct, restore the original `.htaccess` from the private backup before attempting application installation.

The private `operator-token` file permits verification requests via `X-Randa-Release-Check` while visitors see maintenance. It does not grant admin access. Never print or publish that token, put it in a URL, or share it with the client. ACME renewal paths remain accessible.

## Minutes 5–45: install and verify

```sh
python3 production-window.py install --approved-window
```

This validates payload checksums, backs up any existing app directory, installs Node files outside the web root, and copies only build assets into `public_html`. It moves the old API directory to the private backup only if that directory still contains nothing beyond `.htaccess`. It records each replaced web asset before copying so an interrupted install can be rolled back. It preserves hosted metadata and legacy content.

1. Privately copy `.env.production-release.local` to `/home/randakas/randa-kassis-website/.env`, permissions `0600`. Never use the DEV or preview env. Keep `CONTENT_READ_ONLY=true` initially.
2. In cPanel **Setup Node.js App**, select only the stopped production entry for `randakassis.com/`. Set application root `randa-kassis-website`, startup `server.js`, Node 22.23.3 and production mode. Save/repair the entry so cPanel creates its Node virtual environment and `node_modules` symlink. Check the activation command shown by cPanel. Do not guess a virtualenv path and do not delete/recreate the app blindly. If cPanel cannot repair it promptly, use the rollback path for this window and resolve hosting separately.
3. Use that displayed environment activation command, `cd /home/randakas/randa-kassis-website`, and run `npm ci --omit=dev --ignore-scripts --no-audit --no-fund` against the shipped pinned runtime lock. It installs only Express, CORS, dotenv and their dependencies. Start the production entry. Check its stderr without printing secrets. Immediately check that public requests still return maintenance; if cPanel has displaced the guard, restore the guard at the top before continuing.
4. From the release directory, reconcile only the four reviewed Markdown files. Both commands verify hashes; `apply` backs up originals and attempts conditional restoration on failure. Any unexpected content change stops the operation.

```sh
python3 sync-production-content.py check
python3 sync-production-content.py apply --approved-window
python3 production-window.py routing --approved-window
```

The final routing preserves cPanel-managed Passenger blocks, protects private/legacy admin paths, directs API requests to Node, fixes real legacy-directory collisions such as `/articles/`, and keeps the maintenance guard first. The four copies preserve currently published wording while moving reads to Bunny. The site reads Markdown through `/api/content`, so Bunny edge cache purging is not required for these application reads.

5. Read-only checks first: storage health reports the correct zone/root, metadata is reachable, and the new pages render behind the operator header. In the private app env, change only `CONTENT_READ_ONLY=true` to `false`; keep `METADATA_SOURCE_URL` and `CONTENT_OVERRIDE_DIR` empty. Restart only the production app. The public maintenance guard must remain active throughout.
6. Run the read-only verification script. It logs in with the private admin configuration, checks its secure cookie/session and Bunny listing, verifies unchanged metadata counts/hashes and the four preserved documents, checks installed assets and public routes, and proves unauthenticated writes are rejected. It does not upload/delete sample production content.

```sh
python3 verify-production-release.py
```

A passing run writes a private, five-minute verification receipt. Review website layout/images and admin listing via controlled operator access to the same production hostname. The runtime was locally tested; production CRUD has not been exercised on real editorial content. Avoid test articles in production. If a media URL fails or an admin/content check is unresolved, do not reopen.

## Minute 45: go/no-go, then reopen or roll back

If all checks passed and there are no unresolved errors:

```sh
python3 production-window.py open --approved-window
```

The script requires the recent receipt and matching installed index/routing hashes before removing the maintenance flag. Verify homepage, `/articles/`, a detail page, images, `/admin` and metadata normally without the operator header. Check www redirects correctly. Notify the owner of completion through the agreed human communication channel. Keep private backups and monitor the app; no automatic cleanup runs.

If startup, content or authentication remains unresolved at minute 45, begin rollback. Do not spend the remaining allowance debugging an uncertain launch.

## Rollback

Keep/restore the maintenance flag while rolling back. Stop only the production Node app in cPanel. cPanel may rewrite routing, so recheck maintenance after that action. Do not stop DEV.

If content reconciliation ran, restore its four original Bunny objects conditionally while maintenance remains active:

```sh
python3 sync-production-content.py rollback --approved-window
```

If this reports a concurrent change or corrupt backup, do not overwrite the object. Preserve the backup and resolve explicitly; inform the owner if the window will extend.

Then restore the prior public assets and routing:

```sh
python3 production-window.py rollback --approved-window
```

This restores only the web assets touched by deployment, restores the old API directory, and switches the old `.htaccess` back last. It does not reset current metadata, delete published documents, remove private backups or change DEV. The new app directory remains outside the web root for diagnosis, with its process stopped. The old site again reads its unchanged Krystal Markdown.

Verify the original bundle `/static/js/main.a416ffed.js`, homepage/details/images and HTTPS before declaring recovery complete. If a rollback command is blocked, use the recorded private backup and inspect the stated mismatch; never unzip a stale full backup over newer content.

## Evidence and limits

Local checks cover the production build, exact runtime dependency installation on Node 22.23.3, read-only production content preview, and actual Apache maintenance/HTTP status/header/rollback behavior. They do not prove Krystal's stopped Passenger app will start successfully; that must pass inside the approved maintenance window. A local Apache test does not replace the live 503 check.

Reference documentation: [Apache custom errors](https://httpd.apache.org/docs/current/en/custom-error.html), [Krystal Node.js setup](https://help.krystal.io/nodejs/node-js-app-setup-guide), [CloudLinux Node.js Selector](https://docs.cloudlinux.com/cloudlinuxos/command-line_tools/).
