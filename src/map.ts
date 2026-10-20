import L from "leaflet";
import "leaflet/dist/leaflet.css";

let map: L.Map | undefined;

const site: L.LatLngExpression[] = [
  [51.1238, 0.6895],
  [51.1248, 0.6978],
  [51.1212, 0.7004],
  [51.1186, 0.6962],
  [51.1194, 0.6888]
];

export function mountMap(el: HTMLElement): void {
  if (map) {
    map.remove();
    map = undefined;
  }
  map = L.map(el, {scrollWheelZoom: false, attributionControl: true}).setView(
    [51.122, 0.694],
    14
  );
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  const poly = L.polygon(site, {
    color: "#008847",
    weight: 2,
    fillColor: "#008847",
    fillOpacity: 0.28
  }).addTo(map);
  poly.bindPopup("New Luckhurst Wood (indicative boundary for this explainer)");
  map.fitBounds(poly.getBounds().pad(0.35));
  setTimeout(() => map?.invalidateSize(), 80);
}
