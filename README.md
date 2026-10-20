# New Luckhurst Wood

A readable, unofficial companion to Forestry England’s New Luckhurst Wood consultation in Smarden, Kent.

The official pack is a Citizen Space page plus three PDFs, including an A0 exhibition set. This site cuts that material into boards, a zoomable design plan, report sections and the 21 written responses.

**Live site:** https://nbarrett.github.io/new-luckhurst-wood/

Official sources stay on [forestryengland.uk](https://www.forestryengland.uk/woodland-creation/new-luckhurst) and [the consultation portal](https://consult.forestryengland.uk/forest-districts/nluckhurstw/).

## Neighbour diary

Photographs from the house opposite the site go in `public/assets/diary/`. Then add a newest-first object to the `diary` array in `src/content.ts`:

```ts
{
  id: "2026-11-02-tracks",
  date: "2026-11-02",
  title: "Tracks going in",
  body: "What you can see from Bethersden Road today.",
  photos: [{ src: "./assets/diary/2026-11-02-tracks.jpg", alt: "New forest track" }]
}
```

## Local preview

```bash
npm install
npm run dev
```

## Hosting

Pushes to `main` build with Vite and publish `dist` to GitHub Pages, same pattern as [tasmania-2027-itinerary](https://github.com/nbarrett/tasmania-2027-itinerary).
