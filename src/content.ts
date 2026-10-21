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

function shots(date: string, files: string[]): DiaryPhoto[] {
  return files.map((file) => ({
    src: `${import.meta.env.BASE_URL}assets/diary/${file}`,
    alt: `New Luckhurst Wood, ${date}`
  }));
}

/** Newest first. Every file dropped in public/photos. */
export const diary: DiaryEntry[] = [
  {id: "2026-10-17", date: "2026-10-17", title: "17 October", body: "Evening from across the road.", photos: shots("17 October 2026", ["2026-10-17-1708-62f873be.jpg","2026-10-17-1708-e146d25f.jpg","2026-10-17-1711-6d42b074.jpg"])},
  {id: "2026-10-14", date: "2026-10-14", title: "14 October", body: "", photos: shots("14 October 2026", ["2026-10-14-1650-1aa20f3a.jpg"])},
  {id: "2026-10-13", date: "2026-10-13", title: "13 October", body: "", photos: shots("13 October 2026", ["2026-10-13-1645-5de35132.jpg","2026-10-13-1645-7c9ea987.jpg","2026-10-13-1645-d840919a.jpg","2026-10-13-1651-8f461fe1.jpg","2026-10-13-1657-d2e6a508.jpg"])},
  {id: "2026-10-11", date: "2026-10-11", title: "11 October", body: "", photos: shots("11 October 2026", ["2026-10-11-0103-f9d5ceea.jpg","2026-10-11-0125-f7e0be5f.jpg"])},
  {id: "2026-10-10", date: "2026-10-10", title: "10 October", body: "Tracks, machines and the fields.", photos: shots("10 October 2026", ["2026-10-10-0922-1ef47736.jpg","2026-10-10-0926-012a18ab.jpg","2026-10-10-0926-c46b7dc8.jpg","2026-10-10-0931-ae6b9942.jpg","2026-10-10-0932-886ae319.jpg","2026-10-10-0938-625930f5.jpg","2026-10-10-1611-70225f3d.jpg","2026-10-10-1617-fa8cf171.jpg","2026-10-10-1632-47a1c266.jpg"])},
  {id: "2026-10-04", date: "2026-10-04", title: "4 October", body: "", photos: shots("4 October 2026", ["2026-10-04-1738-9574962c.jpg","2026-10-04-1739-a1b99b9f.jpg","2026-10-04-1740-49fe8f63.jpg"])},
  {id: "2026-09-30", date: "2026-09-30", title: "30 September", body: "", photos: shots("30 September 2026", ["2026-09-30-0646-8dc56cf4.jpg"])},
  {id: "2026-09-22", date: "2026-09-22", title: "22 September", body: "", photos: shots("22 September 2026", ["2026-09-22-1638-3061246e.jpg"])},
  {id: "2026-09-17", date: "2026-09-17", title: "17 September", body: "Sunset, plant and the new track.", photos: shots("17 September 2026", ["2026-09-17-1745-f6407f66.jpg","2026-09-17-1750-1bf9ac6a.jpg","2026-09-17-1753-60ae308d.jpg","2026-09-17-1758-dc95a820.jpg","2026-09-17-1759-bc753503.jpg"])},
  {id: "2026-09-16", date: "2026-09-16", title: "16 September", body: "", photos: shots("16 September 2026", ["2026-09-16-1713-65eaff5e.jpg"])},
  {id: "2026-09-15", date: "2026-09-15", title: "15 September", body: "The first forest track going in.", photos: shots("15 September 2026", ["2026-09-15-1740-31fc0d29.jpg","2026-09-15-1741-6d60ce3a.jpg","2026-09-15-1743-49edfd32.jpg","2026-09-15-1743-57f86a1d.jpg","2026-09-15-1744-c90ac39a.jpg","2026-09-15-1745-4eb6d633.jpg","2026-09-15-1745-5ada607e.jpg","2026-09-15-1745-f3097621.jpg","2026-09-15-1747-d4b80064.jpg","2026-09-15-1749-6c057536.jpg","2026-09-15-1758-d7467ea7.jpg","2026-09-15-1805-1aa1390b.jpg"])},
  {id: "2026-09-14", date: "2026-09-14", title: "14 September", body: "Plant arriving on the fields.", photos: shots("14 September 2026", ["2026-09-14-1725-5a2c40a7.jpg"])},
  {id: "2026-09-11", date: "2026-09-11", title: "11 September", body: "", photos: shots("11 September 2026", ["2026-09-11-1604-32bf605d.jpg","2026-09-11-1610-66075f0b.jpg","2026-09-11-1610-9b043319.jpg","2026-09-11-1610-d2401576.jpg","2026-09-11-1611-c83937a6.jpg","2026-09-11-1616-417798fb.jpg","2026-09-11-1617-de07b241.jpg"])},
  {id: "2026-09-09", date: "2026-09-09", title: "9 September", body: "", photos: shots("9 September 2026", ["2026-09-09-1758-09742526.jpg","2026-09-09-1800-6a6b4427.jpg","2026-09-09-1800-92a0915f.jpg","2026-09-09-1807-6c286198.jpg","2026-09-09-1810-378a1574.jpg"])},
  {id: "2026-09-08", date: "2026-09-08", title: "8 September", body: "", photos: shots("8 September 2026", ["2026-09-08-1744-f705f60e.jpg","2026-09-08-1745-6c3a25dd.jpg","2026-09-08-1746-b70f15e2.jpg","2026-09-08-1747-90fa2840.jpg","2026-09-08-1751-86160b4f.jpg","2026-09-08-1753-c86a3889.jpg","2026-09-08-1759-21716ddf.jpg","2026-09-08-1818-bd87de36.jpg","2026-09-08-1818-cde1c0f0.jpg"])},
  {id: "2026-09-07", date: "2026-09-07", title: "7 September", body: "", photos: shots("7 September 2026", ["2026-09-07-1803-7d203204.jpg","2026-09-07-1804-25ccff70.jpg","2026-09-07-1807-38c2bb8d.jpg","2026-09-07-1807-9e17294d.jpg"])},
  {id: "2026-09-02", date: "2026-09-02", title: "2 September", body: "", photos: shots("2 September 2026", ["2026-09-02-1755-c833fe0d.jpg","2026-09-02-1756-531cd996.jpg","2026-09-02-1758-96b4e8ec.jpg"])},
  {id: "2026-08-26", date: "2026-08-26", title: "26 August", body: "", photos: shots("26 August 2026", ["2026-08-26-1817-2c8650a4.jpg","2026-08-26-1817-a0495a6a.jpg","2026-08-26-1817-a4c459d3.jpg"])},
  {id: "2026-08-24", date: "2026-08-24", title: "24 August", body: "", photos: shots("24 August 2026", ["2026-08-24-1813-d8a8ca34.jpg","2026-08-24-1820-67cb4478.jpg"])},
  {id: "2026-08-21", date: "2026-08-21", title: "21 August", body: "", photos: shots("21 August 2026", ["2026-08-21-1925-4d30e910.jpg"])},
  {id: "2026-08-16", date: "2026-08-16", title: "16 August", body: "", photos: shots("16 August 2026", ["2026-08-16-1757-cb301632.jpg","2026-08-16-1800-f46b239e.jpg","2026-08-16-1804-aa54b3b6.jpg","2026-08-16-1819-c46ced6e.jpg","2026-08-16-1857-8ba68668.jpg","2026-08-16-1859-7a7e97aa.jpg","2026-08-16-1922-19d771bb.jpg","2026-08-16-1922-3b81313b.jpg","2026-08-16-1922-41abb363.jpg"])},
  {id: "2026-08-12", date: "2026-08-12", title: "12 August", body: "", photos: shots("12 August 2026", ["2026-08-12-2002-8ddf1088.jpg","2026-08-12-2002-9761bca0.jpg","2026-08-12-2005-82e0dfb0.jpg"])},
  {id: "2026-08-11", date: "2026-08-11", title: "11 August", body: "", photos: shots("11 August 2026", ["2026-08-11-1800-6579e0dd.jpg","2026-08-11-1801-856ce2d1.jpg","2026-08-11-1817-4c44f162.jpg","2026-08-11-1818-bae6c7e9.jpg"])},
  {id: "2026-08-10", date: "2026-08-10", title: "10 August", body: "", photos: shots("10 August 2026", ["2026-08-10-1811-1aec47e2.jpg","2026-08-10-1812-69cc6a54.jpg","2026-08-10-1817-d7b54175.jpg","2026-08-10-1821-499536d8.jpg","2026-08-10-1833-57d84f5c.jpg","2026-08-10-1835-96a27b99.jpg","2026-08-10-1839-b421b630.jpg"])},
  {id: "2026-07-15", date: "2026-07-15", title: "15 July", body: "", photos: shots("15 July 2026", ["2026-07-15-1801-e2e1745b.jpg","2026-07-15-1828-aa0151ec.jpg","2026-07-15-1909-744f0f8a.jpg","2026-07-15-1937-15fd13ec.jpg","2026-07-15-1954-34bf72be.jpg"])},
  {id: "2026-06-25", date: "2026-06-25", title: "25 June", body: "", photos: shots("25 June 2026", ["2026-06-25-1759-b1534d6b.jpg","2026-06-25-1759-c0fcf825.jpg","2026-06-25-1915-75aa7fb8.jpg","2026-06-25-1948-075e5f53.jpg","2026-06-25-1948-72a6657b.jpg","2026-06-25-1949-8c382b59.jpg"])},
  {id: "2026-06-18", date: "2026-06-18", title: "18 June", body: "", photos: shots("18 June 2026", ["2026-06-18-1802-9d9e013f.jpg","2026-06-18-1900-3e5d7b67.jpg","2026-06-18-1901-2c66b6fb.jpg"])},
  {id: "2026-05-22", date: "2026-05-22", title: "22 May", body: "", photos: shots("22 May 2026", ["2026-05-22-0818-cf312000.jpg"])},
  {id: "2026-05-19", date: "2026-05-19", title: "19 May", body: "", photos: shots("19 May 2026", ["2026-05-19-1807-fb52eb0e.jpg"])},
  {id: "2026-05-05", date: "2026-05-05", title: "5 May", body: "", photos: shots("5 May 2026", ["2026-05-05-1247-984fa1ff.jpg"])},
  {id: "2026-05-04", date: "2026-05-04", title: "4 May", body: "", photos: shots("4 May 2026", ["2026-05-04-1738-4dddec5c.jpg"])},
  {id: "2026-04-22", date: "2026-04-22", title: "22 April", body: "", photos: shots("22 April 2026", ["2026-04-22-1739-f248356e.jpg","2026-04-22-1837-7f3571b8.jpg"])},
  {id: "2026-04-16", date: "2026-04-16", title: "16 April", body: "", photos: shots("16 April 2026", ["2026-04-16-1733-6ba79133.jpg"])},
  {id: "2026-04-13", date: "2026-04-13", title: "13 April", body: "", photos: shots("13 April 2026", ["2026-04-13-1900-4e035ab5.jpg","2026-04-13-1913-2ca1327c.jpg","2026-04-13-1916-3693a298.jpg"])},
  {id: "2026-04-10", date: "2026-04-10", title: "10 April", body: "", photos: shots("10 April 2026", ["2026-04-10-1732-d99889c4.jpg","2026-04-10-1829-73dd99ed.jpg","2026-04-10-1832-5ab5c23e.jpg","2026-04-10-1836-96729565.jpg","2026-04-10-1842-61fac197.jpg"])}
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

export function to(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (path === "/" || path === "") {
    return `${base}/`;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function parsePath(pathname: string): Route {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  let path = pathname;
  if (base && (path === base || path.startsWith(`${base}/`))) {
    path = path.slice(base.length);
  }
  const parts = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const view = parts[0] || "";
  const raw = parts[1] || "";
  if (view === "panels") {
    const id = Number(raw) || 1;
    return {view: "panels", id: Math.min(8, Math.max(1, id))};
  }
  if (view === "design") {
    return {view: "design"};
  }
  if (view === "report") {
    return {view: "report", id: raw || "summary"};
  }
  if (view === "issues") {
    const id = Number(raw) || 1;
    return {view: "issues", id: Math.min(21, Math.max(1, id))};
  }
  if (view === "diary") {
    return {view: "diary", id: raw || diary[0]?.id || ""};
  }
  if (view === "faq") {
    return {view: "faq"};
  }
  if (view === "sources") {
    return {view: "sources"};
  }
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
