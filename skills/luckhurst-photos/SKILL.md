---
name: luckhurst-photos
description: Sync New Luckhurst Wood diary stills from Apple Photos using on-site GPS and the Luckhurst album, then ingest to S3. Use when asked to sync the diary, pull new Luckhurst photos, ingest from Photos, run /luckhurst-photos, or update the neighbour diary from Apple Photos.
---

# Luckhurst diary photo sync

Works in any agent. Run from the `new-luckhurst-wood` repo root. Do not push unless asked.

## Command

```bash
npm run photos:sync
```

That is `scripts/sync-luckhurst-photos.mjs` then `scripts/ingest-photos.mjs`. Needs macOS, Photos, `sqlite3`, and AWS credentials in `.env`.

## What it selects

Union of:

1. Stills in the Apple Photos album **Luckhurst**
2. Stills in the Photos library whose GPS falls inside the padded woodland box from `src/site-boundary.json` (`scripts/luckhurst-geo.mjs`)

Skip videos. Skip anything already in `public/assets/diary/` (matched by date-time, including ±1 hour). Skip names and stamps in `scripts/diary-skip.mjs` (close shots of a child, and the 8 August photo that was not on site).

On-site GPS is read from a copy of `~/Pictures/Photos Library.photoslibrary/database/Photos.sqlite`. Do not query the live sqlite in place. Copy originals for GPS hits from `Photos Library.photoslibrary/originals/`. Album hits still export through Photos.

Many walks have no GPS. The album is still required.

## After ingest

- Report added count, days, and newest date
- Leave `src/content.ts` dirty for review
- If new stills are close identifiable pictures of a child, list them and wait before they stay in the diary
- Do not delete other photos unless they are named

## Deleting

Add the stamp and original filename to `scripts/diary-skip.mjs`, remove the JPEG from S3 (`diary/` and `diary/fit/`) and from the local diary cache, then ingest or edit `src/content.ts` so the day no longer lists the file.
