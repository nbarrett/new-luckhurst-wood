import {join} from "node:path";
import {loadEnvFile, root} from "./s3-env.mjs";

// Where diary photos are actually taken. Worked out from the GPS of the
// Luckhurst album (Apr-Nov 2026): 5th-95th percentile was lat 51.1272-51.1350,
// lon 0.6835-0.6986, widened a little to catch the edges of the walks.
// This is not the planting boundary in src/site-boundary.json, which the map draws.
const WALK_AREA = {
  minLat: 51.1265,
  maxLat: 51.137,
  minLon: 0.6815,
  maxLon: 0.7005
};

// Places inside the walking area that are never diary shots (home, for one).
// Kept in .env so they stay out of this public repo:
//   LUCKHURST_GPS_EXCLUDE="lat,lon,radiusMetres;lat,lon,radiusMetres"
function exclusions() {
  const raw = process.env.LUCKHURST_GPS_EXCLUDE || loadEnvFile(join(root, ".env")).LUCKHURST_GPS_EXCLUDE || "";
  return raw
    .split(";")
    .map((part) => part.split(",").map(Number))
    .filter((parts) => parts.length === 3 && parts.every(Number.isFinite))
    .map(([lat, lon, radius]) => ({lat, lon, radius}));
}

const excluded = exclusions();

function metresBetween(lat1, lon1, lat2, lon2) {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(a));
}

export function bbox() {
  return {...WALK_AREA};
}

export function excludedPlace(lat, lon) {
  return excluded.some((place) => metresBetween(lat, lon, place.lat, place.lon) <= place.radius);
}

export function insideSite(lat, lon) {
  const box = WALK_AREA;
  const inBox = lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon;
  return inBox && !excludedPlace(lat, lon);
}
