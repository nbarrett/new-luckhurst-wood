---
name: luckhurst-photos
description: Sync New Luckhurst Wood diary stills and videos from Apple Photos using on-site GPS and the Luckhurst album, then ingest to S3. Use when asked to sync the diary, pull new Luckhurst photos or videos, ingest from Photos, run /luckhurst-photos, or update the neighbour diary from Apple Photos.
---

# Luckhurst diary photo sync

Works in any agent. Run from the `new-luckhurst-wood` repo root. Do not push unless asked.

## Command

```bash
npm run photos:sync
```

That is `scripts/sync-luckhurst-photos.mjs` then `scripts/ingest-photos.mjs`. Needs macOS, Photos, `sqlite3`, `avconvert` and `qlmanage` (both ship with macOS), and AWS credentials in `.env`. No ffmpeg.

The quick GPS route copies the Photos database, which needs Full Disk Access for the terminal running it. The Claude desktop app's Terminal panel does not have it. Without it the sync asks Photos itself for each item's date and location (about 40 seconds over the whole library) and exports the hits through Photos by id, so on-site shots still come through.

## What it selects

Union of:

1. Stills and videos in the Apple Photos album **Luckhurst**
2. Stills and videos in the Photos library taken on or after the newest diary day whose GPS falls inside the walking area in `scripts/luckhurst-geo.mjs` (worked out from where the album photos were taken; not the planting boundary in `src/site-boundary.json`). Places listed in `LUCKHURST_GPS_EXCLUDE` in `.env` (home) are left out. Keep coordinates like that out of the repo: it is public.

Skip anything already in `public/assets/diary/` (matched by date-time, including ±1 hour; stills against `.jpg`, videos against `.mp4`). Skip names and stamps in `scripts/diary-skip.mjs` (close shots of a child, and the 8 August photo that was not on site).

On-site GPS is read from a copy of `~/Pictures/Photos Library.photoslibrary/database/Photos.sqlite`. Do not query the live sqlite in place. Copy originals for GPS hits from `Photos Library.photoslibrary/originals/`. Album hits still export through Photos.

Many walks have no GPS. The album is still required.

## Videos

- Album stills export as originals; album videos export as Photos shows them, so trims and camera effects (slow motion) are kept. `.aae` sidecars are deleted.
- Live Photo motion clips (a `.mov` with the same name as a still) are not diary videos and are dropped.
- The video date comes from Photos via `public/photos/.video-stamps.json`, written by the sync and removed by ingest. Exported files lose their own creation date.
- Ingest converts with `avconvert` preset `Preset1280x720` (H.264, SDR, GPS stripped) to `public/assets/diary/<stamp>.mp4`, uploads it to `diary/video/`, and uploads a Quick Look frame as the poster to `diary/poster/<stamp>.jpg`.
- In the diary a video slide shows its poster with a play button; tap, Enter or Space plays it.

## Publishing without a deploy

Ingest uploads the full diary list to `diary/index.json` on S3 (no-cache). The site reads it when it loads, so new photos and removals show on the live site straight away, with no commit or Pages deploy. `src/content.ts` is still rewritten and is the fallback if the list cannot be fetched; day titles and notes written there win over the list's once deployed.

## After ingest

- Report added count, days, and newest date
- Leave `src/content.ts` dirty for review
- If new stills or videos show close identifiable pictures of a child, list them and wait before they stay in the diary. For videos, look at the poster frame (`qlmanage -t` on the `.mp4`) and say that only the first frame was checked
- Do not delete other photos unless they are named

## Deleting

Add the stamp and original filename to `scripts/diary-skip.mjs`. Remove the file from S3 (`diary/` and `diary/fit/` for a still; `diary/video/` and `diary/poster/` for a video) and from the local diary cache, then run `npm run photos:sync` so the S3 list and `src/content.ts` no longer list the file.
