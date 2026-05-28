/* ============================================================
   DATA.JS — LAMBOMODELS
   Columns: CarYear, Brand, Model, Scale, Color, Maker,
            Year(added), Code, Price, Notes
   ============================================================ */
window.LM = window.LM || {};

LM.CAT_ORDER = ['production','concepts','oneoffs','racing','trattori','motorcycles','related'];
LM.CAT_META = {
  production:  { label:'Production Models',      short:'Production',   desc:'Road cars produced and sold by Automobili Lamborghini.' },
  concepts:    { label:'Concepts & Prototypes',   short:'Concepts',     desc:'Show cars, design studies and prototypes that never reached production.' },
  oneoffs:     { label:'Few-Offs & One-Offs',     short:'One-Offs',     desc:'Hyper-limited bespoke commissions and ultra-rare special editions.' },
  racing:      { label:'Race Cars',               short:'Racing',       desc:'Dedicated motorsport entries, F1 engines and genuine racing machines.' },
  trattori:    { label:'Lamborghini Trattori',    short:'Trattori',     desc:'The agricultural origins — tractors from the original Lamborghini business.' },
  motorcycles: { label:'Lamborghini Motorcycles', short:'Motorcycles',  desc:'Two-wheeled machinery bearing the Lamborghini name.' },
  related:     { label:'Related Cars',            short:'Related',      desc:'Vehicles connected through designers, engineering or shared Lamborghini DNA.' },
};

// ── FAMILY MAP ──────────────────────────────────────────────
// Order matters: more specific first
const FAMILY_MAP = [
  ['350 GTV',  '350 GT'], ['350 GTS',  '350 GT'], ['3500 GTZ', '350 GT'],
  ['400 GT',   '400 GT'], ['4000 GT',  '400 GT'],
  ['Aventador','Aventador'],
  ['Countach', 'Countach'],
  ['Diablo',   'Diablo'],       // catches Diablo P132 too
  ['Gallardo', 'Gallardo'],
  ['Huracan',  'Huracán'], ['Huracán','Huracán'],
  ['Murcielago','Murciélago'], ['Murciélago','Murciélago'],
  ['Urus',     'Urus'],
  ['Miura',    'Miura'],
  ['Veneno',   'Veneno'],
  ['Espada',   'Espada'],
  ['Faena',    'Faena'],        // Faena is its own family, NOT Espada
  ['Reventon', 'Reventón'], ['Reventón','Reventón'],
  ['Sian',     'Sián'], ['Sián','Sián'],
  ['Islero',   'Islero'],
  ['Jarama',   'Jarama'],
  ['Urraco',   'Urraco'],
  ['Centenario','Centenario'],
  ['Sesto',    'Sesto Elemento'],
  ['Portofino','Portofino'],
  ['Egoista',  'Egoista'],
  ['Terzo',    'Terzo Millennio'],
  ['Concept S','Concept S'],
  ['Revuelto', 'Revuelto'],
  ['Temerario','Temerario'],
  ['Invencible','Invencible'],
  ['Autentica','Autentica'],
  ['SC18',     'SC18'],
  ['SC20',     'SC20'],
  ['SC63',     'SC63'],
  ['Silhouette','Silhouette'],
  ['Jalpa',    'Jalpa'],
  ['LM002',    'LM002'],
  ['Marzal',   'Marzal'],
  ['Bravo',    'Bravo'],
  ['Cheetah',  'Cheetah'],
  ['Athon',    'Athon'],
  ['Acosta',   'Acosta'],
  ['Asterion', 'Asterion'],
  ['Estoque',  'Estoque'],
  ['Lanzador', 'Lanzador'],
  ['Cala',     'Cala'],
  ['Canto',    'Canto'],
  ['Essenza',  'Essenza SCV12'],
  ['Raptor',   'Raptor Zagato'],
  ['Marco Polo','Marco Polo'],
  ['Genesis',  'Genesis'],
  ['P140',     'P140'],
  ['V12 Vision','Lambo V12 Vision GT'],
  ['Konrad',   'Konrad WSC'],
  ['Dodge Viper','Dodge Viper'],
  ['BMW M1',   'BMW M1'],
  ['Audi R8',  'Audi R8'],
  ['MCA',      'MCA Centenaire'],
  ['Ducati',   'Ducati Streetfighter V4'],
];

function getFamily(model) {
  if (!model) return model;
  const m = model.toLowerCase();
  for (const [key, fam] of FAMILY_MAP) {
    if (m.includes(key.toLowerCase())) return fam;
  }
  return model;
}

// ── CATEGORY DETECTION ──────────────────────────────────────
// Related car codes — these are in the CSV with Brand "Lamborghini" but are
// actually related cars. Detect by code prefix.
const RELATED_CODES = ['RelAudi','RelBMW','RelMCA','RelDod'];

// Production-only families: these names always = production, even with police/GT3/etc variants
const PRODUCTION_FAMILIES = [
  'aventador','countach','diablo','gallardo','huracan','huracán',
  'murcielago','murciélago','urus','miura','islero','jarama',
  'espada','faena','urraco','silhouette','jalpa','lm002',
  '350 gt','400 gt','revuelto','temerario',
];

// True one-offs/few-offs — NOT production
const ONEOFF_NAMES = [
  'sesto elemento','veneno','centenario','sc18','sc20','sián','sian',
  'invencible','autentica','essenza','reventón','reventon',
];

// True racing-only (F1 engines, Konrad WSC, SC63)
const TRUE_RACING = [
  'konrad wsc','sc63','lc89','lc90','lambo 291','lambo291','formula 1',
];

const CONCEPT_NAMES = [
  'marzal','bravo','cheetah','athon','marco polo','portofino','genesis',
  'p140','p132','cala','acosta','canto','concept s','estoque','asterion',
  'terzo millennio','v12 vision','lanzador','raptor zagato','egoista',
];

function detectCategory(brand, model, notes, code) {
  const b = (brand || '').toLowerCase().trim().replace(/\s+/g,' ');
  const m = (model || '').toLowerCase().trim();
  const n = (notes || '').toLowerCase();
  const c = (code || '');

  if (b.includes('trattori') || m.includes('tractor') || m.includes('traktor')) return 'trattori';
  if (b.includes('ducati') || m.includes('ducati') || m.includes('streetfighter')) return 'motorcycles';
  if (b.includes('marini') || b.includes('oleodinamica') || b.includes('latinoamerica')) return 'related';

  // Related: detect by (Related) in notes OR by code prefix
  if (n.includes('(related)') || RELATED_CODES.some(prefix => c.startsWith(prefix))) return 'related';

  if (!b.includes('lamborghini')) return 'related';

  // Production families first
  for (const fam of PRODUCTION_FAMILIES) {
    if (m.startsWith(fam) || m.includes(fam)) return 'production';
  }
  for (const r of TRUE_RACING) { if (m.includes(r)) return 'racing'; }
  for (const k of ONEOFF_NAMES) { if (m.includes(k)) return 'oneoffs'; }
  for (const k of CONCEPT_NAMES) { if (m.startsWith(k) || m.includes(k)) return 'concepts'; }
  return 'production';
}

// ── YEAR NORMALIZATION ────────────────────────────────────────
function normalizeYear(y) {
  if (!y) return y;
  if (y.includes('/')) {
    const parts = y.split('/').map(p=>p.trim()).filter(p=>/^\d{4}$/.test(p));
    if (parts.length) return parts.sort()[0];
  }
  if (/^201X$/i.test(y)) return '201X';
  return y;
}

function normalizeColor(c) { return c; }

// ── PROD_FAM_ORDER ───────────────────────────────────────────
const PROD_FAM_ORDER = [
  '350 GT','400 GT','Miura','Espada','Faena','Islero','Jarama',
  'Countach','Urraco','Silhouette','Jalpa','LM002','Diablo','Murciélago',
  'Gallardo','Aventador','Huracán','Urus','Revuelto','Temerario',
];

function sortByCarYear(names, groups) {
  return [...names].sort((a,b)=>{
    const ay = parseInt((groups[a]?.[0]?.carYear)||'0') || 9999;
    const by = parseInt((groups[b]?.[0]?.carYear)||'0') || 9999;
    return ay - by;
  });
}

// ── CSV PARSER ────────────────────────────────────────────────
function parseRow(line) {
  const cols = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQ = !inQ; }
    else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
    else cur += ch;
  }
  cols.push(cur.trim());
  return cols;
}

function slug(s) {
  return (s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
LM.slug = slug;

// ── LOAD ─────────────────────────────────────────────────────
LM._data = null;
LM.load = async function() {
  if (LM._data) return LM._data;
  const [csvText, descs] = await Promise.all([
    fetch(LM.basePath()+'data/collection.csv').then(r=>{ if(!r.ok)throw new Error('CSV missing'); return r.text(); }),
    LM.loadDescriptions(),
  ]);
  const lines = csvText.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
  const hdrIdx = lines.findIndex(l=>l.toLowerCase().includes('car year'));
  if (hdrIdx < 0) throw new Error('CSV header not found');
  const headers = parseRow(lines[hdrIdx]);
  LM._data = lines.slice(hdrIdx+1).map((line,idx)=>{
    if (!line.trim()) return null;
    const vals = parseRow(line);
    const row = {};
    headers.forEach((h,i) => { row[h.trim()] = (vals[i]||'').trim(); });

    const brand = (row['Brand']||'').trim();
    const model = (row['Model']||'').trim();
    const notes = (row['Notes']||'').trim();
    const code  = (row['Code']||'').trim();

    // ── CARYEAR OVERRIDES ─────────────────────────────────────
    // To revert any of these, comment out or change the value.
    // Urus: force 2017 (production launch) instead of 2012 (concept year in CSV)
    let carYear = normalizeYear((row['Car Year']||'').trim());
    if ((row['Model']||'').toLowerCase().includes('urus') && carYear === '2012') carYear = '2017';
    // ──────────────────────────────────────────────────────────

    if (!brand && !model && !code) return null;
    const cat = detectCategory(brand, model, notes, code);
    const desc = descs[code] || {};
    const funny     = desc.funny === true;
    const showNote  = desc.showNote === true;
    const autographed = desc.autographed === true;
    const special     = desc.special === true;
    const milestone   = desc.milestone || null;
    const isConcept   = desc.concept === true;
    const isOneOff    = desc.oneoff === true;
    const isFewOff    = desc.fewoff === true;

    const isLamborghini = brand.toLowerCase().replace(/\s+/g,' ').startsWith('lamborghini');
    const cleanModel = model.replace(/\s+Tractor[s]?$/i,'').replace(/\s+Traktor[s]?$/i,'').trim();
    const displayName = cleanModel || brand;

    const isDeutzFahr = cleanModel.toLowerCase().includes('deutz fahr') || cleanModel.toLowerCase().includes('deutz-fahr');
    const isDucati    = cleanModel.toLowerCase().includes('ducati');
    const isRelatedByNote = (notes || '').toLowerCase().includes('(related)');
    const fullName = (isLamborghini && cleanModel && !isDeutzFahr && !isDucati && !isRelatedByNote)
      ? `Lamborghini ${cleanModel}`.replace(/\s+/g,' ')
      : (cleanModel || brand);

    return {
      carYear, brand, model: cleanModel,
      scale:        (row['Scale']||'').trim(),
      color:        normalizeColor((row['Color']||'').trim()),
      manufacturer: (row['Maker']||row['Manufacturer']||'').trim(),
      year:         normalizeYear((row['Year']||'').trim()),
      code, price:  (row['Price']||'').trim(),
      notes, funny, showNote, autographed, special, milestone,
      isConcept, isOneOff, isFewOff,
      category: cat,
      family: getFamily(cleanModel || brand),
      id: code || `LM${String(idx+1).padStart(3,'0')}`,
      displayName,
      fullName,
      yearAdded: (row['Year']||'').trim(),
      searchText: [brand,cleanModel,row['Scale'],row['Color'],row['Maker']||row['Manufacturer'],code,carYear,
        autographed?'autographed':'', special?'special':'', milestone||'',
        isConcept?'concept':'', isOneOff?'oneoff one-off':'', isFewOff?'fewoff few-off':''].join(' ').toLowerCase(),
    };
  }).filter(Boolean);
  return LM._data;
};

LM.byCode = code => (LM._data||[]).find(i=>i.code===code||i.id===code);

// ── SEARCH ───────────────────────────────────────────────────
LM.search = (q, filterKey) => {
  if (!q||q.length<1) return [];
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return (LM._data||[]).filter(item => {
    if (!filterKey || filterKey === 'all') {
      return terms.every(t => item.searchText.includes(t));
    }
    const fieldMap = {
      scale:       item.scale||'',
      color:       item.color||'',
      manufacturer:item.manufacturer||'',
      maker:       item.manufacturer||'',
      carYear:     item.carYear||'',
      yearAdded:   item.yearAdded||'',
      year:        item.yearAdded||'',
      autographed: item.autographed?'autographed':'',
      special:     item.special?'special':'',
      concept:     item.isConcept?'concept':'',
      oneoff:      item.isOneOff?'oneoff':'',
      fewoff:      item.isFewOff?'fewoff':'',
      milestone:   item.milestone||'',
      funny:       item.funny?'funny':'',
      category:    item.category||'',
      name:        (item.fullName||item.displayName||''),
      model:       (item.fullName||item.displayName||''),
      code:        item.code||'',
    };
    const val = (fieldMap[filterKey]||'').toString().toLowerCase();
    return terms.every(t => val.includes(t));
  });
};

// ── STATS ────────────────────────────────────────────────────
LM.stats = function() {
  const d = LM._data || [];
  const count = key => {
    const m = {};
    d.forEach(i => { const v=i[key]||'Unknown'; m[v]=(m[v]||0)+1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]);
  };
  const fm = {};
  d.forEach(i => { if(i.family) fm[i.family]=(fm[i.family]||0)+1; });
  const prices = d.map(i=>parseFloat((i.price||'').replace(/[^0-9.]/g,''))).filter(p=>!isNaN(p)&&p>0);
  const yearMap={};
  d.forEach(i=>{
    let v=i.year||'Unknown';
    yearMap[v]=(yearMap[v]||0)+1;
  });
  const byYear=Object.entries(yearMap).sort((a,b)=>{
    const av=a[0]==='201X'?'2015':a[0].replace(/[^0-9]/g,'').slice(0,4)||'9999';
    const bv=b[0]==='201X'?'2015':b[0].replace(/[^0-9]/g,'').slice(0,4)||'9999';
    return parseInt(av)-parseInt(bv);
  });
  const cleanYears=byYear.filter(([y])=>/^\d{4}$/.test(y)&&+y>=2010&&+y<=2040);
  const years201X = yearMap['201X']||0;
  return {
    total:d.length, byCategory:count('category'),
    byManufacturer:count('manufacturer'), byScale:count('scale'),
    byColor:count('color'), byYear, cleanYears, years201X,
    byCarYear:count('carYear'), byFamily:Object.entries(fm).sort((a,b)=>b[1]-a[1]),
    byModel:count('model'),
    uniqueFamilies:Object.keys(fm).length,
    uniqueManufacturers:new Set(d.map(i=>i.manufacturer).filter(Boolean)).size,
    uniqueColors:new Set(d.map(i=>i.color).filter(Boolean)).size,
    uniqueScales:new Set(d.map(i=>i.scale).filter(Boolean)).size,
    totalSpend:prices.reduce((s,p)=>s+p,0).toFixed(2),
    avgPrice:(prices.length?(prices.reduce((s,p)=>s+p,0)/prices.length):0).toFixed(2),
    priceCount:prices.length,
  };
};

// ── GROUP BY FAMILY ───────────────────────────────────────────
LM.groupByFamily = items => {
  const groups = {};
  items.forEach(item => {
    const f = item.family || item.displayName;
    (groups[f] = groups[f] || []).push(item);
  });
  return groups;
};

// ── FAMILY DESCRIPTIONS ───────────────────────────────────────
LM.FAMILY_DESC = {
  '350 GT':      'The 350 GT was Lamborghini\'s very first production car, introduced in 1964. It set the template for everything that followed — a front-mounted V12, grand touring proportions, and the ambition to challenge Ferrari on equal terms.',
  '400 GT':      'The 400 GT evolved the original formula with a larger 4.0-liter V12 and, in 2+2 form, genuine rear seats. It remains one of the most elegant and understated grand tourers of the 1960s.',
  'Miura':       'The Miura arrived in 1966 and redefined the supercar. Its transverse mid-mounted V12, curvaceous Bertone body, and sheer performance made it the template for every mid-engine exotic that followed.',
  'Espada':      'The Espada was Lamborghini\'s bold answer to the question of what a four-seat V12 GT should look like. Low, wide, and unmistakably Gandini-designed, it was produced for a decade in three series.',
  'Faena':       'The Faena was a one-off concept built on the Espada platform in 1978, showcasing a very different direction for the model. It remains one of the lesser-known chapters of Lamborghini\'s history.',
  'Islero':      'The Islero replaced the 400 GT as Lamborghini\'s front-engined V12 grand tourer in 1968. More understated than its contemporaries, it was reportedly Ferruccio Lamborghini\'s personal favourite.',
  'Jarama':      'The Jarama was the last of the classic front-engined V12 grand tourers from Lamborghini, produced from 1970 to 1976. Sharp Bertone styling and a powerful V12 made it a worthy final chapter for the formula.',
  'Countach':    'The Countach arrived in 1974 and immediately became the definitive poster car. Its wedge profile, scissor doors, and raw presence defined an era of automotive design and remained in production until 1990.',
  'Urraco':      'The Urraco was Lamborghini\'s attempt at a more accessible V8 sports car, introduced in 1970. Gandini\'s clean Bertone design and the compact mid-engine layout made it a forerunner of the later V8 models.',
  'Silhouette':  'The Silhouette evolved the Urraco into a sharper, more distinctive package in 1976, adding a targa roof and more aggressive styling. Only 54 examples were built, making it one of the rarest production Lamborghinis.',
  'Jalpa':       'The Jalpa was the last of the V8 mid-engine Lamborghinis, produced from 1981 to 1988. More usable and accessible than the Countach, it ended the classic V8 lineage that began with the Urraco.',
  'LM002':       'The LM002 was Lamborghini\'s unlikely but legendary off-roader, powered by the Countach\'s V12 engine. Built from 1986 to 1993, it predated the modern luxury SUV era by decades and remains utterly unique.',
  'Diablo':      'The Diablo succeeded the Countach in 1990 and took Lamborghini\'s flagship into a new era. Wider, faster, and more refined, it was produced through several major variants until 2001.',
  'Murciélago':  'The Murciélago arrived in 2001 under Audi ownership and brought new levels of engineering and build quality to Lamborghini\'s flagship. Its 6.5-liter V12 produced up to 670 horsepower in final LP 670-4 SuperVeloce form.',
  'Gallardo':    'The Gallardo was Lamborghini\'s most successful model of its era, produced from 2003 to 2013 in multiple variants. Its V10 engine and accessible character made it the everyday Lamborghini for a new generation.',
  'Aventador':   'The Aventador arrived in 2011 with a naturally aspirated 6.5-liter V12 producing 700 horsepower and a carbon fibre monocoque structure. It defined the flagship Lamborghini for over a decade.',
  'Huracán':     'The Huracán replaced the Gallardo in 2014 and became one of the best-selling Lamborghinis ever made. Its V10 engine, available in rear and all-wheel drive forms, powered an extensive family of variants.',
  'Urus':        'The Urus arrived in 2018 as Lamborghini\'s second production SUV, decades after the LM002. Its twin-turbocharged V8 and luxurious interior made it an instant commercial success.',
  'Revuelto':    'The Revuelto replaced the Aventador in 2023 with a new 6.5-liter V12 hybrid system producing 1,015 horsepower. It marked Lamborghini\'s transition into the electrified era while retaining the naturally aspirated V12.',
  'Temerario':   'The Temerario arrived in 2024 as the Huracán\'s successor, featuring a twin-turbocharged V8 hybrid system. It represented a new technical direction for the mid-engine Lamborghini.',
  'Veneno':      'The Veneno was a hyper-exclusive few-off built to celebrate Lamborghini\'s 50th anniversary in 2013. Just three coupes and nine roadsters were built, making it one of the rarest modern Lamborghinis.',
  'Centenario':  'The Centenario was produced in 2016 to mark the 100th birthday of Ferruccio Lamborghini. Forty examples were built — twenty coupes and twenty roadsters — each unique and personally specified.',
  'Sián':        'The Sián was Lamborghini\'s first electrified model, using a 48V mild hybrid system alongside the V12. Built in extremely limited numbers from 2020, it previewed the technology direction for the brand.',
  'Reventón':    'The Reventón was a 2007 ultra-limited edition based on the Murciélago, with a matte grey fighter jet-inspired body and just 20 examples produced. It began Lamborghini\'s era of hyper-exclusive special editions.',
  'Sesto Elemento': 'The Sesto Elemento was a track-only concept from 2010 showcasing Lamborghini\'s carbon fibre expertise. Its name means "sixth element" — carbon.',
  'Invencible':  'The Invencible is one of two final V12 one-off models built on the Aventador platform in 2023, marking the end of the naturally aspirated V12 era.',
  'Autentica':   'The Autentica is the second of two final V12 one-off Aventador-based models from 2023, the last naturally aspirated V12 Lamborghinis before the Revuelto.',
  'Egoista':     'The Egoista was a radical single-seat concept unveiled in 2013 to mark Lamborghini\'s 50th anniversary. Inspired by attack helicopters, it was designed purely as a statement of extreme design.',
  'Terzo Millennio': 'The Terzo Millennio was a 2017 concept developed with MIT, exploring electric supercars with energy storage in the carbon fibre body structure itself.',
  'Marzal':      'The Marzal was a striking 1967 concept by Marcello Gandini featuring a full glass gullwing canopy over all four seats. It directly influenced the production Espada.',
  'Asterion':    'The Asterion LPI 910-4 was a 2014 concept exploring a V10 hybrid powertrain, combining the Huracán\'s engine with electric motors for 910 horsepower.',
  'Estoque':     'The Estoque was a 2008 concept for a four-door luxury saloon, showing Lamborghini exploring the premium segment before the Urus.',
  'Lanzador':    'The Lanzador was revealed in 2023 as a preview of Lamborghini\'s upcoming fully electric ultra-GT model.',
  'Acosta':      'The Acosta is a 2024 concept exploring the next direction for a V10 mid-engine Lamborghini beyond the Huracán/Temerario era.',
  'Genesis':     'The Genesis was a 1988 concept by Italdesign showing an extreme mid-engine supercar on a Lamborghini V12 platform.',
  'Marco Polo':  'The Marco Polo was a 1982 concept study exploring a luxury grand touring format for Lamborghini.',
  'Cala':        'The Cala was a 1995 Italdesign concept exploring a potential entry-level V6 Lamborghini, though it never reached production.',
  'P140':        'The P140 was a 1992 concept by Lamborghini and Coggiola exploring a new generation of baby Lamborghini.',
  'Raptor Zagato': 'The Raptor was a 1996 one-off concept built by Zagato on a Diablo VT chassis, featuring dramatic carbon fibre bodywork.',
  'Konrad WSC':  'The Konrad Motorsport Lamborghini Diablo was entered in endurance racing events in the mid-1990s, representing one of Lamborghini\'s most serious motorsport efforts of the era.',
  'SC63':        'The SC63 is Lamborghini\'s hybrid LMDh prototype racing car, developed from 2023 for competition in IMSA and the World Endurance Championship.',
  'Ducati Streetfighter V4': 'The Ducati Streetfighter V4 Lamborghini is a special edition motorcycle produced in collaboration between Ducati and Lamborghini, blending the DNA of both Italian brands.',
  'BMW M1':      'The BMW M1 was designed by Giorgetto Giugiaro and partly developed with Lamborghini in the late 1970s, sharing production engineering expertise before the project moved fully in-house at BMW.',
  'Audi R8':     'The Audi R8 shares its DNA with the Lamborghini Gallardo, using the same platform and V10 engine family developed during the period of shared Audi/Lamborghini engineering.',
  'Dodge Viper': 'The Dodge Viper\'s original V10 engine was developed with significant input from Lamborghini engineers during the Chrysler ownership period in the late 1980s and early 1990s.',
  'MCA Centenaire': 'The MCA Centenaire is a French coachbuilt one-off based on a Lamborghini Murciélago LP640, created to mark the centenary of a French automobile club.',
};

// ── NAV HELPERS ───────────────────────────────────────────────
LM.markActiveNav = function() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
    a.classList.remove('active');
    const href = a.getAttribute('href') || '';
    const page = href.split('/').pop().split('?')[0];
    const curr = path.split('/').pop().split('?')[0] || 'index.html';
    if (page === curr || (curr === '' && page === 'index.html')) a.classList.add('active');
  });
};

LM.initHamburger = function() {
  const btn = document.querySelector('.hamburger');
  const menu = document.querySelector('.mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }));
};

// ── COLOR LOOKUP ─────────────────────────────────────────────
LM.colorFor = function(name) {
  const m = {
    'yellow':'#f5d000','gold':'#c8a030','orange':'#e86020','red':'#cc2020',
    'green':'#2a8030','blue':'#2050a0','white':'#d0ccc4','black':'#282828',
    'silver':'#909090','grey':'#686868','gray':'#686868','metallic':'#7a8898',
    'copper':'#b87333','purple':'#702a9a','brown':'#704020','pink':'#c04080',
    'beige':'#c8a878','tan':'#c8a878','cream':'#d4c89a','dark':'#282828',
    'light':'#a8a49c','bronze':'#9a6030','champagne':'#c8b870','turquoise':'#1a9a8a',
    'lime':'#80b820','cyan':'#1a9ab0','maroon':'#801028','navy':'#182060',
    'teal':'#1a7a7a','pearl':'#d8d4cc','anthracite':'#484848',
  };
  const c = (name||'').toLowerCase();
  for (const [k,v] of Object.entries(m)) if (c.includes(k)) return v;
  return null;
};

LM.isLightColor = function(hex) {
  if (!hex) return false;
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 145;
};

// ── MILESTONE LABELS ─────────────────────────────────────────
LM.milestoneLabel = {
  '1st':'🥇 1st Model','2nd':'🥈 2nd Model','3rd':'🥉 3rd Model',
  '100th':'💯 100th Model','200th':'⭐ 200th Model','300th':'🔥 300th Model','400th':'👑 400th Model',
};

// ── TAG RENDERING ────────────────────────────────────────────
LM.renderTags = function(item, base) {
  base = base || './';
  const tags = [];
  if (item.scale)       tags.push(`<a class="tag" href="${base}search.html?q=${encodeURIComponent(item.scale)}&filter=scale">${item.scale}</a>`);
  if (item.color) {
    const hex = LM.colorFor(item.color);
    const style = hex ? `style="background:${hex}18;border-color:${hex}44;"` : '';
    const dot   = hex ? `<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${hex};margin-right:5px;vertical-align:middle;flex-shrink:0;border:1px solid rgba(255,255,255,0.2);"></span>` : '';
    tags.push(`<a class="tag" href="${base}search.html?q=${encodeURIComponent(item.color)}&filter=color" ${style}>${dot}${item.color}</a>`);
  }
  if (item.manufacturer)tags.push(`<a class="tag" href="${base}search.html?q=${encodeURIComponent(item.manufacturer)}&filter=manufacturer">${item.manufacturer}</a>`);
  if (item.autographed) tags.push(`<a class="tag tag-autographed" href="${base}search.html?q=autographed&filter=autographed">✍ Autographed</a>`);
  if (item.special)     tags.push(`<a class="tag tag-special" href="${base}search.html?q=special&filter=special">★ Special</a>`);
  if (item.isConcept)   tags.push(`<a class="tag" href="${base}search.html?q=concept&filter=concept">Concept</a>`);
  if (item.isOneOff)    tags.push(`<a class="tag" href="${base}search.html?q=oneoff&filter=oneoff">One-Off</a>`);
  if (item.isFewOff)    tags.push(`<a class="tag" href="${base}search.html?q=fewoff&filter=fewoff">Few-Off</a>`);
  if (item.funny)       tags.push(`<a class="tag tag-funny" href="${base}search.html?q=funny+lambo&filter=funny">Funny Lambo</a>`);
  if (item.milestone) {
    const cls = `tag-${item.milestone}`;
    const lbl = LM.milestoneLabel[item.milestone] || item.milestone;
    tags.push(`<a class="tag ${cls}" href="${base}search.html?q=${encodeURIComponent(item.milestone)}&filter=milestone">${lbl}</a>`);
  }
  return tags.join('');
};

    const lbl = LM.milestoneLabel[item.milestone] || item.milestone;
    tags.push(`<a class="tag ${cls}" href="${base}search.html?q=${encodeURIComponent(item.milestone)}&filter=milestone">${lbl}</a>`);
  }
  return tags.join('');
};

// ── IMAGES ───────────────────────────────────────────────────
LM.heroImages    = (code,base)=>{ if(!code)return[]; base=base||LM.basePath(); return ['png','jpg','webp'].map(e=>base+'images/'+code+'.'+e); };
LM.previewImages = (key,base) =>{ base=base||LM.basePath(); const s=slug(key); return ['png','jpg','webp'].map(e=>base+'images/preview-'+s+'.'+e); };
LM.memoImage     = (name,base)=>{ base=base||LM.basePath(); const s=slug(name); return ['png','jpg','webp'].map(e=>base+'images/memo-'+s+'.'+e); };
LM.resolveImage  = cands=>new Promise(res=>{ let i=0; const t=()=>{ if(i>=cands.length){res(null);return;} const img=new Image(); img.onload=()=>res(cands[i]); img.onerror=()=>{i++;t();}; img.src=cands[i]; }; t(); });
LM.probeGallery  = async(code,base)=>{ if(!code)return[]; base=base||LM.basePath(); const found=[]; let i=1,misses=0; while(misses<2&&i<=30){ const hit=await LM.resolveImage(['jpg','png','webp'].map(e=>base+'images/'+code+'_'+i+'.'+e)); if(hit){found.push(hit);misses=0;}else misses++; i++; } return found; };

// ── MEMORABILIA ───────────────────────────────────────────────
LM.loadMemorabilia = async function() {
  if (LM._memo) return LM._memo;
  try {
    const r = await fetch(LM.basePath()+'data/memorabilia.csv');
    if (!r.ok) { LM._memo=[]; return []; }
    const text = await r.text();
    const lines = text.replace(/\r\n/g,'\n').split('\n').filter(l=>l.trim());
    // Skip first line "Memorabilia,," header, then real header
    const startLine = lines.findIndex(l=>l.toLowerCase().includes('lamborghini brand'));
    if (startLine<0) { LM._memo=[]; return []; }
    const hdrs = parseRow(lines[startLine]);
    LM._memo = lines.slice(startLine+1).map((line,i)=>{
      const vals=parseRow(line);
      const obj={};
      hdrs.forEach((h,j)=>{obj[h.trim()]=(vals[j]||'').trim();});
      const brand=(obj['Lamborghini Brand']||'').trim().replace(/\s+/g,' ');
      const name =(obj['Memorabilia type']||obj['Memorabilia Type']||'').trim();
      const price=(obj['Price']||'').trim();
      if(!brand&&!name) return null;
      return { brand, name, price, id:'memo-'+i, slug:slug(name) };
    }).filter(Boolean);
  } catch { LM._memo=[]; }
  return LM._memo;
};

// ── LAZY IMAGE OBSERVER ─────────────────────────────────────
// Call once per page — makes all lazy images fade in when they enter viewport
LM.initLazyImages = function() {
  if (!('IntersectionObserver' in window)) {
    // Fallback: just show all
    document.querySelectorAll('img[loading="lazy"]').forEach(img => img.classList.add('loaded'));
    return;
  }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        if (img.complete) img.classList.add('loaded');
        else img.addEventListener('load', () => img.classList.add('loaded'), {once:true});
        o.unobserve(img);
      }
    });
  }, {rootMargin:'200px'});
  document.querySelectorAll('img[loading="lazy"]').forEach(img => obs.observe(img));
};

// Also patch resolveImage so dynamically added lazy imgs get the observer
const _origResolve = LM.resolveImage;
LM.resolveImage = function(cands) {
  return _origResolve(cands).then(src => {
    if (src) {
      // When dynamically set via src, mark as loaded once it fires
      // (handled in each place that calls resolveImage by setting .loaded on load)
    }
    return src;
  });
};

// ── WALL PHOTO LIGHTBOX ──────────────────────────────────────
LM.initWallPhoto = function() {
  const section = document.querySelector('.wall-photo-section');
  if (!section) return;
  const img = section.querySelector('img');
  if (!img) return;
  section.addEventListener('click', () => {
    if (img.src) LM.openLightbox([img.src], 0);
  });
};

// ── PATH / NAV ────────────────────────────────────────────────
function getBase(){
  const path=window.location.pathname;
  // Find the last slash and return everything up to and including it
  return path.substring(0,path.lastIndexOf('/')+1);
}

// ── LIGHTBOX ──────────────────────────────────────────────────
LM.initLightbox=function(){ if(document.getElementById('lm-lb'))return; const el=document.createElement('div');el.id='lm-lb';el.innerHTML=`<button class="lb-close">✕</button><button class="lb-prev">‹</button><div class="lb-img-wrap"><img id="lb-img" src="" alt=""/></div><button class="lb-next">›</button><div class="lb-counter" id="lb-counter"></div>`; document.body.appendChild(el); el.addEventListener('click',e=>{if(e.target===el)LM.closeLightbox();}); el.querySelector('.lb-close').onclick=LM.closeLightbox; el.querySelector('.lb-prev').onclick=()=>LM.lightboxStep(-1); el.querySelector('.lb-next').onclick=()=>LM.lightboxStep(1); document.addEventListener('keydown',e=>{if(!document.getElementById('lm-lb').classList.contains('open'))return;if(e.key==='Escape')LM.closeLightbox();if(e.key==='ArrowLeft')LM.lightboxStep(-1);if(e.key==='ArrowRight')LM.lightboxStep(1);}); };
LM._lbImgs=[];LM._lbIdx=0;
LM.openLightbox=(imgs,idx)=>{LM._lbImgs=imgs;LM._lbIdx=idx||0;LM._lb();document.getElementById('lm-lb').classList.add('open');document.body.style.overflow='hidden';};
LM.closeLightbox=()=>{document.getElementById('lm-lb').classList.remove('open');document.body.style.overflow='';};
LM.lightboxStep=d=>{LM._lbIdx=(LM._lbIdx+d+LM._lbImgs.length)%LM._lbImgs.length;LM._lb();};
LM._lb=()=>{document.getElementById('lb-img').src=LM._lbImgs[LM._lbIdx];document.getElementById('lb-counter').textContent=LM._lbImgs.length>1?`${LM._lbIdx+1} / ${LM._lbImgs.length}`:'';const multi=LM._lbImgs.length>1;document.querySelector('.lb-prev').style.display=multi?'flex':'none';document.querySelector('.lb-next').style.display=multi?'flex':'none';};

// ── CONFIG / DESCRIPTIONS ─────────────────────────────────────
LM._cfg=null; LM.loadConfig=async function(){if(LM._cfg)return LM._cfg;try{const r=await fetch(LM.basePath()+'data/site-config.json');LM._cfg=r.ok?await r.json():{};}catch{LM._cfg={};}return LM._cfg;};
LM._descs=null; LM.loadDescriptions=async function(){if(LM._descs)return LM._descs;try{const r=await fetch(LM.basePath()+'data/descriptions.json');LM._descs=r.ok?await r.json():{};}catch{LM._descs={};}return LM._descs;};

// ── SHARED HTML ───────────────────────────────────────────────
LM.navHTML=base=>{base=base||'./';return`<nav class="nav"><div class="nav-inner"><a class="nav-logo" href="${base}index.html"><img src="${base}images/lambomodels-logo-clean.png" alt="LAMBOMODELS" class="nav-logo-img" onerror="this.src='${base}images/lambomodels-logo.png';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='flex';}"/><span class="nav-logo-text" style="display:none">LAMBOMODELS</span></a><ul class="nav-links"><li><a href="${base}index.html">Home</a></li><li><a href="${base}collection.html">Collection</a></li><li><a href="${base}stats.html">Statistics</a></li><li><a href="${base}memorabilia.html">Memorabilia</a></li><li><a href="${base}blog.html">Blog</a></li><li><a href="${base}about.html">About</a></li></ul><div class="nav-search"><input class="search-input" type="text" placeholder="Search…"/><button class="search-submit" aria-label="Search"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></button></div><button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button></div></nav><div class="mobile-menu"><a href="${base}index.html">Home</a><a href="${base}collection.html">Collection</a><a href="${base}stats.html">Statistics</a><a href="${base}memorabilia.html">Memorabilia</a><a href="${base}blog.html">Blog</a><a href="${base}about.html">About</a><div class="mobile-search"><input class="search-input" type="text" placeholder="Search…"/><button class="search-submit">→</button></div></div>`;};

function socialLink(base, href, name, iconFile, label) {
  const icon = `<img src="${base}images/${iconFile}" alt="" onerror="this.style.display='none'"/>`;
  return `<a href="${href}" target="_blank" rel="noopener">${icon}${label}</a>`;
}

LM.footerHTML=base=>{base=base||'./';return`<footer class="footer"><div class="container">
  <div class="footer-inner">
    <div class="footer-logo-wrap">
      <img src="${base}images/lambomodels-logo.png" alt="LAMBOMODELS" class="footer-logo-img" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>
      <div class="footer-logo" style="display:none;">LAMBOMODELS<span>The Lamborghini Model Collection</span></div>
    </div>
    <nav class="footer-links">
      <a href="${base}index.html">Home</a>
      <a href="${base}collection.html">Collection</a>
      <a href="${base}stats.html">Statistics</a>
      <a href="${base}memorabilia.html">Memorabilia</a>
      <a href="${base}blog.html">Blog</a>
      <a href="${base}about.html">About</a>
      <a href="${base}disclaimer.html" style="color:var(--text-muted);">Disclaimer</a>
    </nav>
    <div class="footer-social">
      ${socialLink(base,'https://www.instagram.com/lambomodels/','Instagram','instagram.png','Instagram')}
      ${socialLink(base,'https://x.com/lambomodels','X','x.png','X')}
      ${socialLink(base,'https://www.facebook.com/LAMBOMODELS/','Facebook','facebook.png','Facebook')}
      ${socialLink(base,'https://www.linkedin.com/in/lambo-models-30b062331/','LinkedIn','linkedin.png','LinkedIn')}
      <a href="mailto:lambomodels@gmail.com"><img src="${base}images/email.png" alt="" onerror="this.style.display='none'"/>Email</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span class="footer-copy">© LAMBOMODELS — The Lamborghini Model Collection</span>
    <a href="${base}disclaimer.html" class="footer-copy" style="text-decoration:none;transition:color 0.18s;" onmouseover="this.style.color='var(--yellow)'" onmouseout="this.style.color=''">lambomodels.com · Disclaimer</a>
  </div>
</div></footer>`;};
