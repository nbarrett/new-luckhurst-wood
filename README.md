# New Luckhurst Wood

A readable, unofficial companion to Forestry England’s New Luckhurst Wood consultation in Smarden, Kent.

The official pack is a Citizen Space page plus three PDFs, including an A0 exhibition set. This site cuts that material into boards, a zoomable design plan, report sections and the 21 written responses.

**Live site:** https://nbarrett.github.io/new-luckhurst-wood/

Official sources stay on [forestryengland.uk](https://www.forestryengland.uk/woodland-creation/new-luckhurst) and [the consultation portal](https://consult.forestryengland.uk/forest-districts/nluckhurstw/).

## Neighbour diary

Photos live in the `nbarrett-luckhurst-wood` S3 bucket (`eu-west-1`), not in git. A dedicated IAM user (`luckhurst-wood-user`) can only read and write that bucket. Site credentials sit in `.env` (gitignored). Create or rotate them with:

```bash
npm run photos:setup-s3
```

That uses the parent AWS keys from the ngx-ramblers secrets file, then writes a Luckhurst-only access key into `.env`. The same values are stored as GitHub Actions secrets on the repo and on the `diary` and `github-pages` environments. A copy also lives outside this repo at `ngx-ramblers/non-vcs/secrets/secrets.new-luckhurst-wood.env`.

To pull new stills from the Apple Photos “Luckhurst” album and ingest them:

```bash
npm run photos:from-album
```

Drop phone photos (JPEG or HEIC) into `public/photos/`, then:

```bash
npm run photos
```

That converts them, shrinks to 2560px JPEG, names them `YYYY-MM-DD-HHMM-uuid8.jpg`, uploads them to S3 under `diary/`, updates `src/content.ts`, and empties the drop folder. A file whose id is already in the diary is re-exported from the original (so a second drop replaces a soft copy). Existing captions stay. Write a short `body` on a day in `content.ts` if you want a sentence under the date.

To push the local `public/assets/diary/` cache to S3 without ingesting new files:

```bash
npm run photos:push
```

## Local preview

```bash
npm install
npm run dev
```

## Hosting

Pushes to `main` build with Vite and publish `dist` to GitHub Pages, same pattern as [tasmania-2027-itinerary](https://github.com/nbarrett/tasmania-2027-itinerary).
