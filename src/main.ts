import "./styles.css";
import {
  diary,
  faqs,
  formatDiaryDate,
  issues,
  panels,
  parsePath,
  reportSections,
  sources,
  to,
  type Route
} from "./content";
import {mountMap} from "./map";

const appEl = document.querySelector<HTMLElement>("#app");
if (!appEl) throw new Error("#app missing");
const app = appEl;

function navLink(href: string, label: string, current: boolean): string {
  return `<a href="${href}" ${current ? 'aria-current="page"' : ""}>${label}</a>`;
}

function asset(file: string): string {
  return `${import.meta.env.BASE_URL}${file.replace(/^\.\//, "")}`;
}

const WIDTH_KEY = "luckhurst-page-width";

function isFullWidth(): boolean {
  return document.documentElement.classList.contains("full-width");
}

function applyWidth(full: boolean): void {
  document.documentElement.classList.toggle("full-width", full);
  localStorage.setItem(WIDTH_KEY, full ? "full" : "readable");
  window.dispatchEvent(new Event("luckhurst-width"));
}

function chrome(route: Route, body: string): string {
  const view = route.view;
  const full = isFullWidth();
  return `
    <a class="skip" href="#main">Skip to content</a>
    <header class="topbar">
      <div class="bar-inner">
        <a class="brand" href="${to("/")}">
          <img class="logo" src="${asset("assets/fe-logo.png")}" alt="Forestry England" width="218" height="80">
          <span class="site-name">New Luckhurst Wood</span>
        </a>
        <nav aria-label="Primary">
          ${navLink(to("/"), "Overview", view === "home")}
          ${navLink(to("/panels/1"), "Boards", view === "panels")}
          ${navLink(to("/design"), "Design plan", view === "design")}
          ${navLink(to("/report/summary"), "Report", view === "report")}
          ${navLink(to("/issues/1"), "Responses", view === "issues")}
          ${navLink(to("/diary"), "Diary", view === "diary")}
          ${navLink(to("/faq"), "FAQ", view === "faq")}
          ${navLink(to("/sources"), "Sources", view === "sources")}
        </nav>
        <button type="button" class="width-toggle" id="width-toggle" aria-pressed="${full}">
          ${full ? "Readable width" : "Full width"}
        </button>
      </div>
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
    <section class="hero" style="background-image:linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.45)), url('${asset("assets/hero-pond.jpg")}')">
      <div class="hero-copy">
        <p class="slab">New Luckhurst Wood</p>
        <p class="lede">Smarden, Kent. A readable copy of Forestry England’s consultation, design plan and neighbour diary.</p>
        <p><a class="btn" href="${to("/panels/1")}">Exhibition boards</a>
           <a class="btn ghost" href="${to("/diary")}">Neighbour diary</a></p>
      </div>
    </section>
    <div class="wrap">
      <div class="stats">
        <a class="stat" href="${to("/panels/1")}"><b>8</b> exhibition boards, one screen each</a>
        <a class="stat" href="${to("/report/summary")}"><b>42</b> report pages, grouped by heading</a>
        <a class="stat" href="${to("/issues/1")}"><b>21</b> issues with Forestry England’s reply</a>
        <a class="stat" href="${to("/faq")}"><b>Winter 2026/27</b> target first planting</a>
      </div>
      <p class="disclaimer">This is an unofficial explainer. Wording is condensed from Forestry England’s published PDFs (May 2026). If a detail matters legally, use the original files.</p>
      <div class="grid">
        <article class="card">
          <a class="cover" href="${to("/panels/1")}">
            <img class="thumb" src="${asset("assets/panel-01.jpg")}" alt="Exhibition board introducing New Luckhurst Wood">
            <div class="pad">
              <div class="kicker">The hard PDF</div>
              <h2>Eight A0 boards</h2>
              <p>The 23 MB consultation pack is landscape poster-size. Here each board is a page, with a short annotation so you do not have to pinch-zoom a whole hall display.</p>
            </div>
          </a>
        </article>
        <article class="card">
          <a class="cover" href="${to("/design")}">
            <img class="thumb" src="${asset("assets/design-plan.jpg")}" alt="New Luckhurst design plan">
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
      <p><a class="btn" href="${to("/diary")}">Open the diary</a></p>
    </div>`;
}

function issuesNav(id: number): string {
  const groups = issues.reduce<{theme: string; items: typeof issues}[]>((acc, issue) => {
    const last = acc[acc.length - 1];
    if (last && last.theme === issue.theme) {
      return [...acc.slice(0, -1), {...last, items: [...last.items, issue]}];
    }
    return [...acc, {theme: issue.theme, items: [issue]}];
  }, []);
  return groups
    .map(
      (group) =>
        `<p class="side-group">${group.theme}</p>${group.items
          .map((issue) =>
            navLink(to(`/issues/${issue.id}`), `${issue.id}. ${issue.question}`, issue.id === id)
          )
          .join("")}`
    )
    .join("");
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
                navLink(to(`/panels/${p.id}`), `${p.id}. ${p.title}`, p.id === id)
            )
            .join("")}
        </nav>
        <article>
          <div class="kicker">${panel.kicker}</div>
          <h1>${panel.title}</h1>
          <p>${panel.summary}</p>
          <div class="viewer">
            <img src="${asset(`assets/panel-${String(id).padStart(2, "0")}.jpg`)}" alt="${panel.title} exhibition board">
          </div>
          <ul class="notes">${panel.notes.map((n) => `<li>${n}</li>`).join("")}</ul>
          <div class="pager">
            <a class="btn ghost" href="${to(`/panels/${prev}`)}">Previous</a>
            <a class="btn" href="${to(`/panels/${next}`)}">Next board</a>
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
      <p>Official A3 drawing from ArcGIS. The whole plan fits on this screen.</p>
      <div class="viewer">
        <img src="${asset("assets/design-plan.jpg")}" alt="New Luckhurst Wood design plan">
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
            .map((s) => navLink(to(`/report/${s.id}`), s.title, s.id === section.id))
            .join("")}
          ${navLink(to("/issues/1"), "5. Responses to issues", false)}
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
          ${issuesNav(id)}
        </nav>
        <article>
          <div class="kicker">Issue ${current.id} of 21 · ${current.theme}</div>
          <div class="issue">
            <h1>${current.question}</h1>
            <p>${current.answer}</p>
          </div>
          <div class="pager">
            <a class="btn ghost" href="${to(`/issues/${id > 1 ? id - 1 : 21}`)}">Previous</a>
            <a class="btn" href="${to(`/issues/${id < 21 ? id + 1 : 1}`)}">Next issue</a>
          </div>
        </article>
      </div>
    </div>`;
}

const film = diary
  .slice()
  .reverse()
  .flatMap((d) => d.photos.map((p) => ({...p, date: d.date, day: d.title})));

function shortDiaryDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  });
}

type TimelineMark = {date: string; first: number; pct: number};

function timelineMarks(): TimelineMark[] {
  const days = [...new Set(film.map((p) => p.date))];
  return days.map((d) => {
    const first = film.findIndex((p) => p.date === d);
    const pct = (first / Math.max(1, film.length - 1)) * 100;
    return {date: d, first, pct};
  });
}

function spacedMarks(marks: TimelineMark[], minPct: number): TimelineMark[] {
  if (marks.length === 0) {
    return [];
  }
  const last = marks[marks.length - 1];
  const chosen = [marks[0]];
  marks.slice(1, -1).forEach((mark) => {
    const prev = chosen[chosen.length - 1];
    if (mark.pct - prev.pct >= minPct && last.pct - mark.pct >= minPct) {
      chosen.push(mark);
    }
  });
  const prev = chosen[chosen.length - 1];
  if (last.pct - prev.pct >= minPct * 0.55) {
    chosen.push(last);
  } else if (prev.date !== last.date) {
    chosen[chosen.length - 1] = last;
  }
  return chosen;
}

function fillScrubLabels(goIndex: (i: number) => void): void {
  const host = document.getElementById("scrub-labels");
  const scrub = document.getElementById("scrub");
  if (!host || !scrub) {
    return;
  }
  const width = scrub.clientWidth || 320;
  const minPct = Math.max(11, (72 / width) * 100);
  const labels = spacedMarks(timelineMarks(), minPct);
  host.innerHTML = labels
    .map((mark, i) => {
      const edge = i === 0 ? " start" : i === labels.length - 1 ? " end" : "";
      return `<button type="button" class="scrub-label${edge}" data-jump="${mark.first}" style="left:${mark.pct}%">${shortDiaryDate(mark.date)}</button>`;
    })
    .join("");
  host.querySelectorAll<HTMLElement>(".scrub-label").forEach((label) => {
    label.addEventListener("click", () => goIndex(Number(label.dataset.jump)));
  });
}

function diaryView(_id: string): string {
  const slides = film
    .map(
      (p, idx) => `
      <figure class="slide" data-i="${idx}" data-date="${p.date}">
        <img src="${p.src}" alt="${p.alt}" draggable="false">
      </figure>`
    )
    .join("");
  const days = [...new Set(film.map((p) => p.date))];
  const ticks = days
    .map((d) => {
      const first = film.findIndex((p) => p.date === d);
      const pct = (first / Math.max(1, film.length - 1)) * 100;
      return `<button type="button" class="tick" data-jump="${first}" data-date="${d}" style="left:${pct}%" aria-label="${formatDiaryDate(d)}"></button>`;
    })
    .join("");
  return `
    <div class="cinema">
      <div class="cinema-meta">
        <p class="cinema-kicker">Neighbour diary · Smarden</p>
        <p class="cinema-date" id="cinema-date">${formatDiaryDate(film[0].date)}</p>
        <p class="cinema-count" id="cinema-count">1 / ${film.length}</p>
      </div>
      <button type="button" class="cinema-arrow left" id="cinema-prev" aria-label="Earlier">‹</button>
      <button type="button" class="cinema-arrow right" id="cinema-next" aria-label="Later">›</button>
      <div class="cinema-track" id="cinema-track" tabindex="0">
        <div class="cinema-film" id="cinema-film">${slides}</div>
      </div>
      <div class="cinema-bar" id="cinema-bar">
        <p class="bar-hint">Drag this timeline</p>
        <div class="scrub-labels" id="scrub-labels"></div>
        <div class="scrub" id="scrub" role="slider" aria-label="Diary timeline" tabindex="0">
          <div class="scrub-fill" id="scrub-fill"></div>
          <div class="scrub-knob" id="scrub-knob"></div>
          <div class="scrub-days">${ticks}</div>
        </div>
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

let diaryKeys: ((e: KeyboardEvent) => void) | undefined;
let diaryResize: (() => void) | undefined;

function bindDiaryStage(): void {
  const track = document.querySelector<HTMLElement>("#cinema-track");
  const strip = document.querySelector<HTMLElement>("#cinema-film");
  const dateEl = document.querySelector<HTMLElement>("#cinema-date");
  const countEl = document.querySelector<HTMLElement>("#cinema-count");
  if (!track || !strip || !dateEl || !countEl) return;
  const slides = Array.from(strip.querySelectorAll<HTMLElement>(".slide"));
  let x = 0;
  let vx = 0;
  let dragging = false;
  let last = 0;
  let raf = 0;

  const maxX = (): number => Math.max(0, strip.scrollWidth - track.clientWidth);

  const apply = (): void => {
    const limit = maxX();
    if (x > 0) x = 0;
    if (x < -limit) x = -limit;
    strip.style.transform = `translate3d(${x}px, 0, 0)`;
    const mid = track.getBoundingClientRect().left + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    const shot = film[best];
    if (!shot) return;
    dateEl.textContent = formatDiaryDate(shot.date);
    countEl.textContent = `${best + 1} / ${film.length}`;
    document.querySelectorAll(".tick").forEach((t) => {
      const j = Number((t as HTMLElement).dataset.jump);
      t.classList.toggle("on", film[j]?.date === shot.date);
    });
    const fill = document.getElementById("scrub-fill");
    const knob = document.getElementById("scrub-knob");
    const pct = limit === 0 ? 0 : Math.min(100, (-x / limit) * 100);
    if (fill) fill.style.width = `${pct}%`;
    if (knob) knob.style.left = `${pct}%`;
  };

  const nudge = (dx: number): void => {
    x += dx;
    apply();
  };

  const goIndex = (i: number): void => {
    const n = Math.max(0, Math.min(slides.length - 1, i));
    const slide = slides[n];
    const mid = track.clientWidth / 2;
    x = -(slide.offsetLeft + slide.offsetWidth / 2 - mid);
    apply();
  };

  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    last = e.clientX;
    vx = 0;
    track.setPointerCapture(e.pointerId);
    track.classList.add("dragging");
    cancelAnimationFrame(raf);
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - last;
    last = e.clientX;
    vx = dx;
    nudge(dx);
  });
  const endDrag = (): void => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove("dragging");
    const coast = (): void => {
      vx *= 0.94;
      if (Math.abs(vx) < 0.4) return;
      nudge(vx);
      raf = requestAnimationFrame(coast);
    };
    raf = requestAnimationFrame(coast);
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  track.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      nudge(-(e.deltaY + e.deltaX));
    },
    {passive: false}
  );

  document.getElementById("cinema-prev")?.addEventListener("click", () => nudge(track.clientWidth * 0.7));
  document.getElementById("cinema-next")?.addEventListener("click", () => nudge(-track.clientWidth * 0.7));
  document.querySelectorAll<HTMLElement>(".tick").forEach((tick) => {
    tick.addEventListener("click", () => goIndex(Number(tick.dataset.jump)));
  });
  fillScrubLabels(goIndex);

  const scrub = document.getElementById("scrub");
  if (scrub) {
    let scrubbing = false;
    const fromPointer = (clientX: number): void => {
      const rect = scrub.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      x = -ratio * maxX();
      apply();
    };
    scrub.addEventListener("pointerdown", (e) => {
      scrubbing = true;
      scrub.setPointerCapture(e.pointerId);
      fromPointer(e.clientX);
    });
    scrub.addEventListener("pointermove", (e) => {
      if (!scrubbing) return;
      fromPointer(e.clientX);
    });
    scrub.addEventListener("pointerup", () => {
      scrubbing = false;
    });
  }

  if (diaryKeys) window.removeEventListener("keydown", diaryKeys);
  diaryKeys = (e: KeyboardEvent) => {
    if (!document.querySelector("#cinema-track")) return;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      nudge(-Math.round(track.clientWidth * 0.55));
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      nudge(Math.round(track.clientWidth * 0.55));
    }
  };
  window.addEventListener("keydown", diaryKeys);
  if (diaryResize) {
    window.removeEventListener("resize", diaryResize);
    window.removeEventListener("luckhurst-width", diaryResize);
  }
  diaryResize = () => {
    fillScrubLabels(goIndex);
    apply();
  };
  window.addEventListener("luckhurst-width", diaryResize);
  window.addEventListener("resize", diaryResize);
  apply();
}

function consumeLegacyHash(): void {
  const hash = location.hash.replace(/^#/, "");
  if (hash.startsWith("/")) {
    history.replaceState(null, "", to(hash));
  }
}

function paint(): void {
  const route = parsePath(location.pathname);
  app.innerHTML = render(route);
  const mapEl = document.querySelector<HTMLElement>("#map");
  if (mapEl) mountMap(mapEl);
  bindDiaryStage();
  document.getElementById("width-toggle")?.addEventListener("click", () => {
    applyWidth(!isFullWidth());
    const btn = document.getElementById("width-toggle");
    if (btn) {
      const full = isFullWidth();
      btn.setAttribute("aria-pressed", String(full));
      btn.textContent = full ? "Readable width" : "Full width";
    }
  });
  window.scrollTo(0, 0);
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }
  const link = target.closest("a");
  if (!link || link.target === "_blank") {
    return;
  }
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  const url = new URL(link.href, location.origin);
  if (url.origin !== location.origin) {
    return;
  }
  if (url.hash && url.pathname === location.pathname) {
    return;
  }
  const root = import.meta.env.BASE_URL.replace(/\/$/, "") || "";
  if (root && url.pathname !== root && !url.pathname.startsWith(`${root}/`)) {
    return;
  }
  event.preventDefault();
  if (url.pathname !== location.pathname) {
    history.pushState(null, "", url.pathname);
    paint();
  }
});

applyWidth(localStorage.getItem(WIDTH_KEY) !== "readable");
consumeLegacyHash();
window.addEventListener("popstate", paint);
paint();
