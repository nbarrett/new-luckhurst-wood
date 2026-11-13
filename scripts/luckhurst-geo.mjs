import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {join} from "node:path";

const root = join(fileURLToPath(new URL("..", import.meta.url)));
const boundary = JSON.parse(readFileSync(join(root, "src/site-boundary.json"), "utf8"));

export const polygon = boundary.polygon;
const PAD = 0.0018;

export function bbox() {
  const lats = polygon.map((p) => p[0]);
  const lons = polygon.map((p) => p[1]);
  return {
    minLat: Math.min(...lats) - PAD,
    maxLat: Math.max(...lats) + PAD,
    minLon: Math.min(...lons) - PAD,
    maxLon: Math.max(...lons) + PAD
  };
}

export function insideSite(lat, lon) {
  const box = bbox();
  return lat >= box.minLat && lat <= box.maxLat && lon >= box.minLon && lon <= box.maxLon;
}
