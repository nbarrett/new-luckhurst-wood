export type Route =
  | {view: "home"}
  | {view: "panels"; id: number}
  | {view: "design"}
  | {view: "report"; id: string}
  | {view: "issues"; id: number}
  | {view: "diary"; id: string}
  | {view: "faq"}
  | {view: "sources"};

export type DiaryPhoto = {
  src: string;
  alt: string;
};

export type DiaryEntry = {
  id: string;
  date: string;
  title: string;
  body: string;
  photos: DiaryPhoto[];
};

/** Newest first. Drop files in public/assets/diary/ then add a row here. */
export const diary: DiaryEntry[] = [
  {
    id: "2026-waiting-for-planting",
    date: "2026-10-20",
    title: "From the house opposite",
    body: "I live across the road from the new woodland. This diary is for photographs of the fields as they become New Luckhurst Wood: grass, tracks, guards, the first trees, and whatever the seasons do after that. New pictures go in as they are taken.",
    photos: [
      {
        src: "./assets/hero-fields.jpg",
        alt: "Uncut fields at the New Luckhurst site with existing woodland behind"
      }
    ]
  },
  {
    id: "2026-official-pond",
    date: "2026-05-20",
    title: "The land as Forestry England showed it",
    body: "Forestry England’s own photograph of the wildlife pond and mature trees, published on the official woodland page. A useful baseline before planting in winter 2026/27.",
    photos: [
      {
        src: "./assets/hero-pond.jpg",
        alt: "Wildlife pond at the New Luckhurst woodland creation site"
      }
    ]
  }
];

export const sources = {
  consult: "https://consult.forestryengland.uk/forest-districts/nluckhurstw/",
  official: "https://www.forestryengland.uk/woodland-creation/new-luckhurst",
  report:
    "https://consult.forestryengland.uk/forest-districts/nluckhurstw/results/newluckhurstwoodconsultationreport-final1.pdf",
  design:
    "https://consult.forestryengland.uk/forest-districts/nluckhurstw/results/fewp_efd_new_l01fnewluckhurstdesignplan.pdf",
  panels:
    "https://consult.forestryengland.uk/forest-districts/nluckhurstw/supporting_documents/smaller20260209_new-luckhurst-consultation-panels-v5-compresspdf"
};

export const panels = [
  {
    id: 1,
    title: "Growing the nation’s forests",
    kicker: "Board 1 of 8",
    summary:
      "Forestry England is creating New Luckhurst Wood on former farmland in Smarden, near Ashford. Public comments on the draft design helped shape the planting plan now going to the Forestry Commission.",
    notes: [
      "Nature for Climate Fund woodland, with public access once planted.",
      "Mix of broadleaf and conifer, chosen for soil, pests and a changing climate.",
      "Aims: wildlife habitat, carbon, low-key recreation, and a future timber crop."
    ]
  },
  {
    id: 2,
    title: "Where the woodland sits",
    kicker: "Board 2 of 8",
    summary:
      "The site lies south of Smarden, split by Bethersden Road, with Hemsted Forest and other woods nearby. It sits in a landscape of fields, hedges, streams and public footpaths.",
    notes: [
      "Two parcels: a larger southern block and a smaller northern block.",
      "Public rights of way already cross the land (AW197 and AW198).",
      "Context map: roads, railways, rivers, SSSI and existing woodland."
    ]
  },
  {
    id: 3,
    title: "What is already here",
    kicker: "Board 3 of 8",
    summary:
      "Surveys recorded mature oaks on old field lines, watercourses, ponds, listed buildings nearby, culverts and the existing footpath network. Those features stay in the design.",
    notes: [
      "Line of mature oaks is a distinctive landscape remnant.",
      "Pook Lane and Bethersden Road bound and cut the site.",
      "Buffers keep hedges, streams and ponds as wildlife corridors."
    ]
  },
  {
    id: 4,
    title: "The planting design",
    kicker: "Board 4 of 8",
    summary:
      "Compartments mix wet woodland, low-density broadleaf, mixed conifer and broadleaf, and Forest Research trials. Access tracks are for future management, not visitor parking.",
    notes: [
      "Forest Research trial plots test less common broadleaved species.",
      "Low-density planting and rides keep open structure for birds and views.",
      "Locked gates at forest tracks; no public car park is planned."
    ]
  },
  {
    id: 5,
    title: "North of Bethersden Road",
    kicker: "Board 5 of 8",
    summary:
      "The smaller northern parcel is reached on foot. After consultation, Forestry England added a new pedestrian entrance so this block is easier to enter from the road.",
    notes: [
      "Public footpath continues through the northern woodland.",
      "New entrance is one of the design changes made after the 2026 consultation.",
      "Still no visitor parking: access is meant to be local and on foot."
    ]
  },
  {
    id: 6,
    title: "South of the road: habitats",
    kicker: "Board 6 of 8",
    summary:
      "The main block uses wet woodland along water, mixed productive woodland further in, seasonal scrapes, and shrub edges. Open rides keep light on ponds and farmland-bird habitat.",
    notes: [
      "Wavy 10–20 m river buffer, widened after Natural England’s comments.",
      "Less planting on the south side of ponds so they stay lit.",
      "Species include oak, hornbeam, willow, aspen, sweet chestnut and Douglas fir."
    ]
  },
  {
    id: 7,
    title: "Wildlife, water and neighbours",
    kicker: "Board 7 of 8",
    summary:
      "The layout keeps views from neighbouring homes, protects species-rich hedges, and leaves space for otter, great crested newt, turtle dove and farmland birds as the wood grows.",
    notes: [
      "Kent and Medway Local Nature Recovery Strategy informed the mix of habitats.",
      "IDB-maintained watercourses: 8 m clear zone and consent for new culverts.",
      "Dogs welcome; keep them on leads near ponds because of otters."
    ]
  },
  {
    id: 8,
    title: "What happens next",
    kicker: "Board 8 of 8",
    summary:
      "The public consultation ran 9 February to 8 March 2026. Plans are going to the Forestry Commission for regulatory review. Planting is aimed at winter 2026/27.",
    notes: [
      "26 written responses, including Natural England, the Environment Agency and Historic England.",
      "Drop-in at Smarden Charter Hall on 26 February 2026.",
      "Official updates: forestryengland.uk/woodland-creation/new-luckhurst."
    ]
  }
];

export const reportSections = [
  {
    id: "summary",
    title: "1. Executive summary",
    body: [
      "Between 9 February and 8 March 2026 Forestry England consulted on draft designs for New Luckhurst Wood, on land it has bought in Smarden, near Ashford.",
      "26 individual responses arrived, including 6 from organisations. Many were broadly supportive; others were negative, asked questions or made suggestions.",
      "After that feedback, the design now includes a new pedestrian entrance north of Bethersden Road; locally grown Dutch-elm-disease-resistant elm for white-letter hairstreak; and a wavy 10–20 m river buffer instead of a straight 10 m strip.",
      "The next step is Forestry Commission regulatory review, then planting."
    ]
  },
  {
    id: "about",
    title: "2. About the consultation",
    body: [
      "The former agricultural land will be mixed conifer and broadleaf, chosen to cope with future climate, open to the public, useful for wildlife, and in time a source of British timber.",
      "Objectives: resilient timber; a mosaic of high forest, low-density woodland, wet woodland and open space; quiet walking; carbon; and research trials of less common broadleaves.",
      "Early engagement asked for community planting, parking thoughts, mixed species and wildlife-led design. The public round then ran for four weeks with online materials, posters, parish noticeboards and a drop-in on 26 February 2026 at Smarden Charter Hall."
    ]
  },
  {
    id: "feedback",
    title: "3. What people said",
    body: [
      "Analysts coded 61 comments across 9 themes. The largest pile was general support (14). Horse-riding, cycling and dogs drew 6 concerns. Water and flood management drew 11 comments. Trees and planting drew mixed questions.",
      "Support sounded like: “We are supportive of the proposals”; “I think this is a fabulous initiative”; “Fully support these proposals.”",
      "Concerns focused on the lack of horse-riding and cycling routes, and on sweet chestnut and Douglas fir sitting awkwardly with some local landscape advice. Some worried wet woodland might stay too dry under current drainage."
    ]
  },
  {
    id: "stakeholders",
    title: "4. Stakeholder replies",
    body: [
      "British Horse Society: no car park limits who can use the wood; a riding loop off Bethersden Road would help local riders.",
      "East Kent Public Rights of Way: pleased AW197 and AW198 keep natural surfaces; routes cannot be moved without permission.",
      "Environment Agency: no flood-risk objection in principle; asked about Local Nature Recovery Strategy, soil, conifers and IDB/KCC engagement.",
      "Historic England: no comment on surrounding heritage assets.",
      "Kent County Council LLFA: supports wet-woodland buffers; IDB consent needed for the central watercourse; KCC consent elsewhere.",
      "Medway IDB: supportive; nothing in the 8 m maintained-channel zone without consent.",
      "Natural England: generally supportive; asked for more open space for skylarks, light on ponds, and native broadleaf near the water."
    ]
  }
];

export const issues = [
  {
    id: 1,
    theme: "Fencing and gates",
    question: "Fence the whole site instead of individual tree guards?",
    answer:
      "Fencing will surround compartments, not the whole wood, so wildlife and people can still move. Fenced areas stay as small as they can be, with tubes and stakes where a fence would not work."
  },
  {
    id: 2,
    theme: "Fencing and gates",
    question: "Horse stiles to keep cars and motorbikes out?",
    answer:
      "There will be no public parking. Only maintenance vehicles use the two tracked entrances, and those gates will be locked."
  },
  {
    id: 3,
    theme: "Footpaths",
    question: "Reroute the northern footpath to the other side of the brook?",
    answer:
      "Public footpaths will not be moved. That sits with the council. The Public Rights of Way team was consulted."
  },
  {
    id: 4,
    theme: "Footpaths",
    question: "Is there an access point north of Bethersden Road?",
    answer: "Yes. A new pedestrian entrance was added after the consultation."
  },
  {
    id: 5,
    theme: "Footpaths",
    question: "Has the southern bridleway moved?",
    answer:
      "The Public Rights of Way team supplied definitive maps. Planting will follow those alignments."
  },
  {
    id: 6,
    theme: "Horses, bikes, dogs",
    question: "Dedicated horse-riding and cycling loops?",
    answer:
      "Trees Programme funding does not cover bridle gates or new surfaced trails, so those routes are not in this scheme. Bedgebury is the nearby Forestry England site that does offer them."
  },
  {
    id: 7,
    theme: "Horses, bikes, dogs",
    question: "A dedicated dog-walking area?",
    answer:
      "Dogs are welcome. There is no fenced dog field. Owners follow the Forest Dog Code; leads near ponds because of otters."
  },
  {
    id: 8,
    theme: "Wildlife",
    question: "Use hydrology and woody material to restore the stream?",
    answer:
      "Stream buffers stay unplanted so ancient-woodland plants and otters keep the corridor. Wet woodland, riparian shrubs and reused ditch plants help filter water. Species under consideration include rushes, ramsons, cuckoo flower and lords-and-ladies."
  },
  {
    id: 9,
    theme: "Wildlife",
    question: "How does this meet the Local Nature Recovery Strategy?",
    answer:
      "The plan was checked against Kent and Medway LNRS: more canopy, naturally regenerating scrub, cleaner water, restored habitats and better connectivity for otter, turtle dove, nightingale, great crested newt, adder and fritillary butterflies."
  },
  {
    id: 10,
    theme: "Name and community",
    question: "Why New Luckhurst Wood?",
    answer: "The land was once part of New Luckhurst Farm. The name is the farm’s, not an existing wood’s."
  },
  {
    id: 11,
    theme: "Name and community",
    question: "A community planting day?",
    answer:
      "Long-term volunteering is limited by capacity. A planting day may be considered around year two or three once the wood can take it."
  },
  {
    id: 12,
    theme: "Trees",
    question: "Sweet chestnut and Douglas fir against local character advice?",
    answer:
      "A landscape and visual appraisal found a neutral or beneficial effect. Sweet chestnut is already at home in Kent. Douglas fir is in small areas for high-quality timber. Natural England is supportive."
  },
  {
    id: 13,
    theme: "Trees",
    question: "How will the ground be prepared?",
    answer:
      "The fields are in grass. Before planting, a machine opens small bare patches. Grass between rows is cut, with targeted herbicide where grass would smother young trees."
  },
  {
    id: 14,
    theme: "Trees",
    question: "More open space for skylark, linnet and yellowhammer?",
    answer:
      "Rides and buffers stay. The stream buffer grew from 10 m to about 20 m. Hedgerows, shrubs and a mix of wet and mixed woodland keep farmland birds as the canopy closes and later thins."
  },
  {
    id: 15,
    theme: "Water",
    question: "Keep the south side of ponds open for light?",
    answer: "Planting on the south side of ponds is reduced so water stays lit."
  },
  {
    id: 16,
    theme: "Water",
    question: "Native broadleaf next to the watercourse?",
    answer:
      "The river edge is now a wavy 10–20 m buffer so shrubs and ground flora already on the banks can colonise, with dappled shade rather than a hard line of trees."
  },
  {
    id: 17,
    theme: "Water",
    question: "IDB consent for culverts?",
    answer:
      "Yes. The central watercourse sits with Upper Medway IDB. New culverts and anything in the 8 m maintained strip need IDB consent; other watercourses need Kent County Council land-drainage consent."
  },
  {
    id: 18,
    theme: "Water",
    question: "Work with river and wildlife partners?",
    answer:
      "Forestry England has said it will keep talking to organisations such as drainage boards and nature bodies as the scheme moves into regulation and planting."
  },
  {
    id: 19,
    theme: "Water",
    question: "Soil condition and ground works?",
    answer:
      "Soil surveys informed species choice. Ground work is light: grass cover now, then planting notches, not wholesale soil stripping."
  },
  {
    id: 20,
    theme: "Water",
    question: "Will proposed wet woodland be too dry?",
    answer:
      "Wet woodland is placed along existing water and low ground. Drainage changes that affect IDB channels need consent; the design keeps those corridors wet rather than draining them harder."
  },
  {
    id: 21,
    theme: "Water",
    question: "Water meadows or other flood systems?",
    answer:
      "The chosen tools are riparian wet woodland, scrapes and buffers, not a full water-meadow system. Flood-risk bodies had no in-principle objection if consents are followed."
  }
];

export const faqs = [
  {
    q: "When will works start?",
    a: "Initial planting is aimed at winter 2026/27, after Forestry Commission review."
  },
  {
    q: "Will it be open to the public?",
    a: "Yes. After planting it will be dedicated under the Countryside and Rights of Way Act. No car park is planned; arrive on existing footpaths."
  },
  {
    q: "Will it become timber?",
    a: "After about 20–25 years some trees will be thinned for sustainable timber and to keep the wood healthy."
  },
  {
    q: "Which trees?",
    a: "Willow, aspen, oak, hornbeam, plus shrubs such as hazel, hawthorn, dogwood and wild cherry. The full mix can also include alder, lime, walnut, wild service, red oak, black poplar, Douglas fir and sweet chestnut."
  }
];

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#/, "").replace(/^\/+/, "");
  const [view, raw] = h.split("/");
  if (view === "panels") {
    const id = Number(raw) || 1;
    return {view: "panels", id: Math.min(8, Math.max(1, id))};
  }
  if (view === "design") return {view: "design"};
  if (view === "report") return {view: "report", id: raw || "summary"};
  if (view === "issues") {
    const id = Number(raw) || 1;
    return {view: "issues", id: Math.min(21, Math.max(1, id))};
  }
  if (view === "diary") return {view: "diary", id: raw || diary[0]?.id || ""};
  if (view === "faq") return {view: "faq"};
  if (view === "sources") return {view: "sources"};
  return {view: "home"};
}

export function formatDiaryDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
}
