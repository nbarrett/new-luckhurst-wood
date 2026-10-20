import "./styles.css";
import {
  diary,
  faqs,
  formatDiaryDate,
  issues,
  panels,
  parseHash,
  reportSections,
  sources,
  type Route
} from "./content";
import {mountMap} from "./map";

const appEl = document.querySelector<HTMLElement>("#app");
if (!appEl) throw new Error("#app missing");
const app = appEl;

function navLink(href: string, label: string, current: boolean): string {
  return `<a href="${href}" ${current ? 'aria-current="page"' : ""}>${label}</a>`;
}

function chrome(route: Route, body: string): string {
  const view = route.view;
  return `
    <a class="skip" href="#main">Skip to content</a>
    <header class="topbar">
      <a class="brand" href="#/">
        <span class="mark">FE</span>
        <span>New Luckhurst Wood</span>
      </a>
      <nav aria-label="Primary">
        ${navLink("#/", "Overview", view === "home")}
        ${navLink("#/panels/1", "Boards", view === "panels")}
        ${navLink("#/design", "Design plan", view === "design")}
        ${navLink("#/report/summary", "Report", view === "report")}
        ${navLink("#/issues/1", "Responses", view === "issues")}
        ${navLink("#/diary", "Diary", view === "diary")}
        ${navLink("#/faq", "FAQ", view === "faq")}
        ${navLink("#/sources", "Sources", view === "sources")}
      </nav>
    </header>
    <div id="main">${body}</div>
    <footer>
      <div class="wrap" style="padding-top:0">
        Independent reading copy of Forestry England’s New Luckhurst consultation,
        built so boards, the design plan and the 42-page report can be opened one section at a time.
        Original documents remain on
        <a href="${sources.consult}">consult.forestryengland.uk</a>.
      </div>
    </footer>`;
}

function home(): string {
  return `
    <section class="hero" style="background-image:linear-gradient(180deg, rgba(30,37,34,.12), rgba(30,37,34,.82)), url('./assets/hero-pond.jpg')">
      <div>
        <div class="kicker">Forestry England · Smarden, Kent</div>
        <h1>New Luckhurst Wood, readable</h1>
        <p class="lede">The official consultation lives in a Citizen Space page and three PDFs, one of them an A0 exhibition pack. This site takes the same material and turns it into pages you can actually move through on a phone or a desk.</p>
        <p><a class="btn" href="#/panels/1">Open the exhibition boards</a>
           <a class="btn ghost" href="#/diary">Neighbour diary</a></p>
      </div>
    </section>
    <div class="wrap">
      <div class="stats">
        <div class="stat"><b>8</b> exhibition boards, one screen each</div>
        <div class="stat"><b>42</b> report pages, grouped by heading</div>
        <div class="stat"><b>21</b> issues with Forestry England’s reply</div>
        <div class="stat"><b>Winter 2026/27</b> target first planting</div>
      </div>
      <p class="disclaimer">This is an unofficial explainer. Wording is condensed from Forestry England’s published PDFs (May 2026). If a detail matters legally, use the original files.</p>
      <div class="grid">
        <article class="card">
          <a class="cover" href="#/panels/1">
            <img class="thumb" src="./assets/panel-01.jpg" alt="Exhibition board introducing New Luckhurst Wood">
            <div class="pad">
              <div class="kicker">The hard PDF</div>
              <h2>Eight A0 boards</h2>
              <p>The 23 MB consultation pack is landscape poster-size. Here each board is a page, with a short annotation so you do not have to pinch-zoom a whole hall display.</p>
            </div>
          </a>
        </article>
        <article class="card">
          <a class="cover" href="#/design">
            <img class="thumb" src="./assets/design-plan.jpg" alt="New Luckhurst design plan">
            <div class="pad">
              <div class="kicker">May 2026</div>
              <h2>Final design plan</h2>
              <p>The A3 ArcGIS plan, zoomable, next to a simple location map of the two parcels either side of Bethersden Road.</p>
            </div>
          </a>
        </article>
      </div>
      <h2>Why this format</h2>
      <p>Attaching a 23 megabyte poster PDF and a 42-page Word export is a poor way to let a parish read a woodland. People need a contents list, short pages, and the official answer sitting next to the question they actually asked.</p>
      <div id="map" role="img" aria-label="Indicative map of New Luckhurst Wood near Smarden"></div>
      <p class="kicker" style="margin-top:10px">Indicative outline only · OSM basemap</p>
      <h2>From across the road</h2>
      <p>The house opposite the site is keeping a photo diary as the fields become woodland. New pictures drop into <code>public/assets/diary/</code> and a short entry in <code>src/content.ts</code>.</p>
      <p><a class="btn" href="#/diary">Open the diary</a></p>
    </div>`;
}

function panelsView(id: number): string {
  const panel = panels.find((p) => p.id === id) ?? panels[0];
  const prev = id > 1 ? id - 1 : 8;
  const next = id < 8 ? id + 1 : 1;
  return `
    <div class="wrap">
      <div class="layout">
        <nav class="side" aria-label="Boards">
          ${panels
            .map(
              (p) =>
                navLink(`#/panels/${p.id}`, `${p.id}. ${p.title}`, p.id === id)
            )
            .join("")}
        </nav>
        <article>
          <div class="kicker">${panel.kicker}</div>
          <h1>${panel.title}</h1>
          <p>${panel.summary}</p>
          <div class="viewer">
            <img src="./assets/panel-${String(id).padStart(2, "0")}.jpg" alt="${panel.title} exhibition board">
          </div>
          <ul class="notes">${panel.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
          <div class="pager">
            <a class="btn ghost" href="#/panels/${prev}">Previous</a>
            <a class="btn" href="#/panels/${next}">Next board</a>
          </div>
        </article>
      </div>
    </div>`;
}

function designView(): string {
  return `
    <div class="wrap">
      <div class="kicker">Design plan · May 2026</div>
      <h1>The planting plan, one page at a time</h1>
      <p>Official A3 drawing from ArcGIS. Scroll and pinch inside the frame. Species, tracks, wet woodland and research plots are on the drawing; the notes below are the written design changes after consultation.</p>
      <div class="viewer">
        <img src="./assets/design-plan.jpg" alt="New Luckhurst Wood design plan">
      </div>
      <ul class="notes">
        <li>New pedestrian entrance north of Bethersden Road.</li>
        <li>Wavy 10–20 m river buffer, widened after Natural England’s advice.</li>
        <li>Elm resistant to Dutch elm disease, for white-letter hairstreak.</li>
        <li>No public car park; locked gates on forest tracks.</li>
      </ul>
      <p><a class="btn ghost" href="${sources.design}">Original 3.6 MB PDF</a></p>
    </div>`;
}

function reportView(id: string): string {
  const section = reportSections.find((s) => s.id === id) ?? reportSections[0];
  return `
    <div class="wrap">
      <div class="layout">
        <nav class="side" aria-label="Report">
          ${reportSections
            .map((s) => navLink(`#/report/${s.id}`, s.title, s.id === section.id))
            .join("")}
          ${navLink("#/issues/1", "5. Responses to issues", false)}
        </nav>
        <article>
          <div class="kicker">Consultation report · May 2026</div>
          <h1>${section.title}</h1>
          ${section.body.map((p) => `<p>${p}</p>`).join("")}
        </article>
      </div>
    </div>`;
}

function issuesView(id: number): string {
  const current = issues.find((i) => i.id === id) ?? issues[0];
  return `
    <div class="wrap">
      <div class="layout">
        <nav class="side" aria-label="Issues">
          ${issues
            .map((i) =>
              navLink(`#/issues/${i.id}`, `${i.id}. ${i.theme}`, i.id === id)
            )
            .join("")}
        </nav>
        <article>
          <div class="kicker">Issue ${current.id} of 21 · ${current.theme}</div>
          <div class="issue">
            <h1>${current.question}</h1>
            <p>${current.answer}</p>
          </div>
          <div class="pager">
            <a class="btn ghost" href="#/issues/${id > 1 ? id - 1 : 21}">Previous</a>
            <a class="btn" href="#/issues/${id < 21 ? id + 1 : 1}">Next issue</a>
          </div>
        </article>
      </div>
    </div>`;
}

function diaryView(id: string): string {
  const entry = diary.find((d) => d.id === id) ?? diary[0];
  if (!entry) {
    return `<div class="wrap"><h1>Diary</h1><p>No entries yet.</p></div>`;
  }
  return `
    <div class="wrap">
      <div class="layout">
        <nav class="side" aria-label="Diary dates">
          ${diary
            .map((d) =>
              navLink(
                `#/diary/${d.id}`,
                `${formatDiaryDate(d.date)}`,
                d.id === entry.id
              )
            )
            .join("")}
        </nav>
        <article>
          <div class="kicker">Neighbour diary</div>
          <h1>${entry.title}</h1>
          <p class="lede">${formatDiaryDate(entry.date)}</p>
          <p>${entry.body}</p>
          <div class="photos">
            ${entry.photos
              .map(
                (p) =>
                  `<figure><img src="${p.src}" alt="${p.alt}"><figcaption>${p.alt}</figcaption></figure>`
              )
              .join("")}
          </div>
          <p class="disclaimer">Add the next visit: put a JPEG in <code>public/assets/diary/</code>, then append an object to the <code>diary</code> array in <code>src/content.ts</code>. Newest entries go at the top.</p>
        </article>
      </div>
    </div>`;
}

function faqView(): string {
  return `
    <div class="wrap">
      <h1>Questions people keep asking</h1>
      ${faqs
        .map(
          (f) => `<div class="issue"><h2>${f.q}</h2><p>${f.a}</p></div>`
        )
        .join("")}
    </div>`;
}

function sourcesView(): string {
  return `
    <div class="wrap">
      <h1>Where this came from</h1>
      <p>Every page is a reading copy of Forestry England’s published consultation. Use these links if you need the signed PDFs.</p>
      <ul>
        <li><a href="${sources.official}">Official woodland page</a></li>
        <li><a href="${sources.consult}">Citizen Space consultation</a></li>
        <li><a href="${sources.panels}">Exhibition boards (23 MB PDF)</a></li>
        <li><a href="${sources.design}">Design plan (3.6 MB PDF)</a></li>
        <li><a href="${sources.report}">Consultation report (1.4 MB PDF)</a></li>
      </ul>
      <p class="disclaimer">Photos of the Smarden fields are Forestry England’s, used here as already published on forestryengland.uk. Map outline is indicative, not a legal boundary.</p>
    </div>`;
}

function render(route: Route): string {
  if (route.view === "panels") return chrome(route, panelsView(route.id));
  if (route.view === "design") return chrome(route, designView());
  if (route.view === "report") return chrome(route, reportView(route.id));
  if (route.view === "issues") return chrome(route, issuesView(route.id));
  if (route.view === "diary") return chrome(route, diaryView(route.id));
  if (route.view === "faq") return chrome(route, faqView());
  if (route.view === "sources") return chrome(route, sourcesView());
  return chrome(route, home());
}

function paint(): void {
  const route = parseHash(location.hash);
  app.innerHTML = render(route);
  const mapEl = document.querySelector<HTMLElement>("#map");
  if (mapEl) mountMap(mapEl);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", paint);
paint();
