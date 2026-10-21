# New Luckhurst Wood

A readable, unofficial companion to Forestry England’s New Luckhurst Wood consultation in Smarden, Kent.

The official pack is a Citizen Space page plus three PDFs, including an A0 exhibition set. This site cuts that material into boards, a zoomable design plan, report sections and the 21 written responses.

**Live site:** https://nbarrett.github.io/new-luckhurst-wood/

Official sources stay on [forestryengland.uk](https://www.forestryengland.uk/woodland-creation/new-luckhurst) and [the consultation portal](https://consult.forestryengland.uk/forest-districts/nluckhurstw/).

## Neighbour diary

Drop phone photos (JPEG or HEIC) into `public/photos/`, then:

```bash
npm run photos
```

That converts them, skips duplicates, shrinks to 1600px JPEG, names them `YYYY-MM-DD-HHMM-uuid8.jpg` under `public/assets/diary/`, updates `src/content.ts`, and empties the drop folder. Existing captions stay. Write a short `body` on a day in `content.ts` if you want a sentence under the date.

## Local preview

```bash
npm install
npm run dev
```

## Hosting

Pushes to `main` build with Vite and publish `dist` to GitHub Pages, same pattern as [tasmania-2027-itinerary](https://github.com/nbarrett/tasmania-2027-itinerary).
