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

// ── CSV PARSER ───────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n').filter(l=>l.trim());
  if (!lines.length) return [];
  const hdrs = parseRow(lines[0]);
  return lines.slice(1).map(line=>{
    const vals = parseRow(line);
    const obj = {};
    hdrs.forEach((h,i)=>{ obj[h.trim()]=(vals[i]||'').trim(); });
    return obj;
  }).filter(row=>{
    const b=(row['Brand']||'').trim(), c=(row['Code']||'').trim();
    return (b||c) && !/^\d+$/.test(b);
  });
}

function parseRow(line) {
  const res=[]; let cur='', inQ=false;
  for (let i=0;i<line.length;i++) {
    const c=line[i];
    if(c==='"'){if(inQ&&line[i+1]==='"'){cur+='"';i++;}else inQ=!inQ;}
    else if(c===','&&!inQ){res.push(cur);cur='';}
    else cur+=c;
  }
  res.push(cur); return res;
}

function slug(str) {
  return (str||'').toLowerCase()
    .replace(/[àáâãäå]/g,'a').replace(/[èéêë]/g,'e').replace(/[ìíîï]/g,'i')
    .replace(/[òóôõö]/g,'o').replace(/[ùúûü]/g,'u').replace(/ñ/g,'n')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
LM.slug = slug;

// ── YEAR NORMALIZATION ────────────────────────────────────────
// "2024/2026" → "2024" (pick earlier)
// "201X" → "2010s" (display bucket)
// "~7" or raw numbers → keep as-is for display, mark as unknown for charts
function normalizeYear(y) {
  if (!y) return y;
  // "2024/2026" style — pick earliest clean 4-digit year
  if (y.includes('/')) {
    const parts = y.split('/').map(p=>p.trim()).filter(p=>/^\d{4}$/.test(p));
    if (parts.length) return parts.sort()[0];
  }
  // "201X" → map to "2015" (midpoint), tagged for display as "201X"
  if (/^201X$/i.test(y)) return '201X'; // keep as display label
  return y;
}

// Copper is a valid color — normalize common aliases
function normalizeColor(c) {
  // No normalisation needed — just pass through
  return c;
}

// ── LOAD ─────────────────────────────────────────────────────
LM.load = async function() {
  if (LM._loaded) return LM._data;
  const [csvText, descs, cfg] = await Promise.all([
    fetch(LM.basePath()+'data/collection.csv').then(r=>{ if(!r.ok)throw new Error('CSV missing'); return r.text(); }),
    LM.loadDescriptions(),
    LM.loadConfig(),
  ]);

  const raw = parseCSV(csvText);
  LM._data = raw.map((row,idx)=>{
    let carYear = (row['Car Year']||'').trim();

    // ── CARYEAR OVERRIDES ─────────────────────────────────────
    // To revert any of these, comment out or change the value.
    // Urus: force 2017 (production launch) instead of 2012 (concept year in CSV)
    if ((row['Model']||'').toLowerCase().includes('urus') && carYear === '2012') carYear = '2017';
    // ──────────────────────────────────────────────────────────
    const brand   = (row['Brand']||'').trim().replace(/\s+/g,' ');
    const model   = (row['Model']||'').trim().replace(/\s+/g,' ');
    if (!brand && !model) return null;
    const code  = (row['Code']||'').trim();
    const notes = (row['Notes']||'').trim();
    const desc  = descs[code] || {};

    // funny: only from descriptions.json funny:true — NOT auto-detected from notes
    const funny = desc.funny === true;
    // showNote: only show note badge if descriptions.json says showNote:true
    const showNote = desc.showNote === true;

    const cat = detectCategory(brand, model, notes, code);

    const isLamborghini = brand.toLowerCase().replace(/\s+/g,' ').startsWith('lamborghini');
    const cleanModel = model.replace(/\s+Tractor[s]?$/i,'').replace(/\s+Traktor[s]?$/i,'').trim();
    const displayName = cleanModel || brand;

    const isDeutzFahr = cleanModel.toLowerCase().includes('deutz fahr') || cleanModel.toLowerCase().includes('deutz-fahr');
    const isDucati    = cleanModel.toLowerCase().includes('ducati');
    const isRelatedByNote = (notes || '').toLowerCase().includes('(related)');
    const fullName = (isLamborghini && cleanModel && !isDeutzFahr && !isDucati && !isRelatedByNote)
      ? `Lamborghini ${cleanModel}`.replace(/\s+/g,' ')
      : (cleanModel || brand);

    const autographed = desc.autographed === true;
    const special     = desc.special === true;
    const milestone   = desc.milestone || null;
    const isConcept   = desc.concept === true;
    const isOneOff    = desc.oneoff === true;
    const isFewOff    = desc.fewoff === true;

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
      searchText: [brand,cleanModel,row['Scale'],row['Color'],row['Maker']||row['Manufacturer'],code,carYear,
        autographed?'autographed':'', special?'special':'', milestone||'',
        isConcept?'concept':'', isOneOff?'oneoff one-off':'', isFewOff?'fewoff few-off':''].join(' ').toLowerCase(),
      yearAdded: (row['Year']||'').trim(), // separate field for Year Added filtering
    };
  }).filter(Boolean);

  LM._loaded = true;
  return LM._data;
};

LM.byCategory   = cat  => (LM._data||[]).filter(i=>i.category===cat);
LM.byCode       = code => (LM._data||[]).find(i=>i.code===code);
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
      year:        item.yearAdded||'',  // legacy alias from old links
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

LM.groupByFamily = items => {
  const map={};
  items.forEach(item=>{ const k=item.family||item.displayName; (map[k]=map[k]||[]).push(item); });
  return map;
};

// ── SORTING ───────────────────────────────────────────────────
const PROD_FAM_ORDER = [
  '350 GT','400 GT','Miura','Espada','Faena','Islero','Jarama',
  'Countach','Urraco','Silhouette','Jalpa','LM002','Diablo','Murciélago',
  'Gallardo','Aventador','Huracán','Urus','Revuelto','Temerario',
];

// Sort by carYear (numeric, unknown/missing goes last)
function sortByCarYear(names, groups) {
  return [...names].sort((a,b)=>{
    const ay = parseInt((groups[a]?.[0]?.carYear)||'0') || 9999;
    const by = parseInt((groups[b]?.[0]?.carYear)||'0') || 9999;
    return ay - by;
  });
}

LM.sortFamilies = (names, cat, groups) => {
  if (cat === 'production') {
    return [...names].sort((a,b)=>{
      const ai=PROD_FAM_ORDER.indexOf(a), bi=PROD_FAM_ORDER.indexOf(b);
      if(ai!==-1&&bi!==-1) return ai-bi;
      if(ai!==-1) return -1; if(bi!==-1) return 1;
      // Unknown production families: sort by carYear
      const ay=parseInt((groups?.[a]?.[0]?.carYear)||'0')||9999;
      const by=parseInt((groups?.[b]?.[0]?.carYear)||'0')||9999;
      return ay-by;
    });
  }
  // For all other categories: sort by carYear
  return sortByCarYear(names, groups||{});
};

// ── STATS ─────────────────────────────────────────────────────
LM.stats = function() {
  const d = LM._data||[];
  const count = key=>{ const m={}; d.forEach(i=>{const v=i[key]||'Unknown';m[v]=(m[v]||0)+1;}); return Object.entries(m).sort((a,b)=>b[1]-a[1]); };
  const fm={}; d.forEach(i=>{fm[i.family]=(fm[i.family]||0)+1;});
  const prices=d.map(i=>parseFloat((i.price||'').replace(/[$~,\s]/g,''))).filter(n=>!isNaN(n)&&n>0);

  // Year added — sort chronologically, handle 201X
  const yearMap={}; d.forEach(i=>{
    let v=i.year||'Unknown';
    // 201X counts as years 2011-2019, show in chart as distributed
    // For display: show it as a note
    yearMap[v]=(yearMap[v]||0)+1;
  });
  const byYear=Object.entries(yearMap).sort((a,b)=>{
    const av=a[0]==='201X'?'2015':a[0].replace(/[^0-9]/g,'').slice(0,4)||'9999';
    const bv=b[0]==='201X'?'2015':b[0].replace(/[^0-9]/g,'').slice(0,4)||'9999';
    return parseInt(av)-parseInt(bv);
  });
  // Clean years for chart: 4-digit 2010-2030, treat 201X as distributed across range
  const cleanYears = byYear.filter(([y])=>/^\d{4}$/.test(y)&&+y>=2010&&+y<=2030);
  // 201X note: extract count
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
    avgPrice:(prices.reduce((s,p)=>s+p,0)/prices.length).toFixed(2),
    priceCount:prices.length,
  };
};

// ── FAMILY DESCRIPTIONS ───────────────────────────────────────
LM.FAMILY_DESC = {
  '350 GT': 'The car that started it all. The 350 GT was Lamborghini\'s first production vehicle, launched in 1964 to challenge Ferrari on the road. Its 3.5-litre V12, designed by Giotto Bizzarrini, set the template for every Lamborghini that followed. The GTV prototype came first in 1963, and the family expanded with the GTS and the Touring-bodied 3500 GTZ.',
  '400 GT': 'The 400 GT refined and expanded the original formula with a longer wheelbase 2+2 configuration, a larger 4.0-litre V12, and some of the most elegant coachwork of the 1960s. The Monza and Flying Star II variants were one-off coachbuilt specials on this platform.',
  'Miura': 'Arguably the most beautiful car ever made and arguably the world\'s first supercar. The Miura debuted at the 1966 Geneva Motor Show with a mid-mounted transverse V12, years ahead of Ferrari and Porsche. The P400, P400 S and P400 SV variants represent a continuous evolution of the design. The Jota was a homologation racing special, and the SVJ and Roadster were coachbuilt one-offs.',
  'Espada': 'A genuine four-seater grand tourer with a full-length V12, the Espada was Lamborghini\'s most commercially successful model of its era, produced across three series from 1968 to 1978.',
  'Faena': 'A unique one-off coachbuilt Espada variant, the Faena was created by Bertone with a distinctive fastback body. One of the rarest Lamborghinis in existence.',
  'Islero': 'The Islero was the spiritual successor to the 400 GT — a discreet, understated gran turismo that Ferruccio Lamborghini personally favoured. The Islero S of 1969 added more power and detail refinements.',
  'Jarama': 'Named after the Spanish racing circuit, the Jarama was a 2+2 GT that replaced the Islero in 1970. The SVR variant was a rare competition special.',
  'Urraco': 'Lamborghini\'s attempt at a more accessible, mid-engined sports car. The Urraco used a transverse V8 and was produced in several variants including the P250, P300, and the Rally edition.',
  'Countach': 'The Countach redefined what a supercar could look like. Designed by Marcello Gandini, its wedge profile and scissor doors became the defining poster car of an entire generation. From the bare LP400 prototype to the 25th Anniversary, the Countach evolved continuously while staying unmistakably itself. The LPI 800-4 of 2021 was a tribute revival built on the Sián platform.',
  'Silhouette': 'The Silhouette was a targa-topped mid-engined sports car based on the Urraco, a transitional model that led directly to the Jalpa.',
  'Jalpa': 'The last V8 Lamborghini until the Urus, the Jalpa was a mid-engined targa roadster produced from 1981 to 1988 — a more affordable entry into the Lamborghini family during a difficult decade for the company.',
  'LM002': 'Long before the SUV was fashionable, Lamborghini built the LM002 — a massive military-derived off-roader with a Countach V12 under the bonnet. Only 301 were made.',
  'Diablo': 'The Diablo was the car that carried Lamborghini into the 1990s and proved the company could survive new ownership under Chrysler. Fast, dramatic, and constantly evolving, the Diablo family spans road cars, racing versions, and unique specials across its twelve-year run.',
  'Murciélago': 'The Murciélago was the first Lamborghini developed under Audi ownership and the first to feature all-wheel drive as standard. The LP640 and LP670-4 SV pushed the design to its absolute limits before giving way to the Aventador.',
  'Gallardo': 'The best-selling Lamborghini of all time, with over 14,000 made between 2003 and 2013. The Gallardo democratised the brand without compromising its character, spawned an enormous family of variants, and underpinned the Super Trofeo racing series.',
  'Aventador': 'The Aventador arrived in 2011 with a naturally aspirated 6.5-litre V12 at a time when the rest of the industry was going turbocharged. It was the last of the truly analogue Lamborghini supercars — raw, loud, and uncompromising. The SVJ set a Nürburgring production car lap record, and the Ultimae closed out the lineage in 2021.',
  'Huracán': 'The Huracán replaced the Gallardo in 2014 and immediately became the definitive mid-engined Lamborghini. Lighter, sharper, and more versatile than its predecessor, it spawned rear-wheel drive variants, the brutal Performante, the elegant Tecnica, and the adventurous Sterrato — an off-road capable supercar.',
  'Urus': 'The Urus made Lamborghini\'s most controversial and most commercially important decision: an SUV. Since its launch in 2018 it has doubled the company\'s annual production volume and funded the next generation of V12 supercars.',
  'Revuelto': 'The successor to the Aventador, the Revuelto is Lamborghini\'s first hybrid production car — a 1015 hp V12 PHEV that represents the company\'s step into the electrified era without abandoning the naturally aspirated engine.',
  'Temerario': 'The Temerario replaces the Huracán with a twin-turbocharged V8 hybrid powertrain — the first turbocharged mid-engine Lamborghini. A new chapter.',
  'Veneno': 'One of the most extreme Lamborghinis ever made. Only three roadsters and four coupés exist, each individually numbered. Based on the Aventador, the Veneno is an exercise in aerodynamic sculpture and exclusivity.',
  'Centenario': 'Built to celebrate the centenary of Ferruccio Lamborghini\'s birth in 1963, only 40 Centenarios were made — 20 coupés and 20 roadsters, each one already spoken for before the car was revealed.',
  'Sián': 'The Sián was Lamborghini\'s first electrified model, using a supercapacitor hybrid system alongside the Aventador\'s V12. Its name means "flash of lightning" in Bolognese dialect.',
  'Reventón': 'Inspired by the world of fighter jets, the Reventón was a limited edition of just 20 units based on the Murciélago LP640. The roadster followed in 2009 with a run of only 15 cars.',
  'Sesto Elemento': 'A track-only marvel built almost entirely from carbon fibre. The Sesto Elemento weighed just 999 kg with a 570 hp V10 — a power-to-weight ratio of 1.75 kg per hp. Only 20 were made.',
  'Invencible': 'The Invencible and its open-top sibling the Autentica were unveiled in 2023 as the last naturally aspirated V12 Lamborghinis — two unique one-offs built on the Aventador platform to close out an era.',
  'Autentica': 'The open-top companion to the Invencible. One car, one owner, one era ending.',
  'Egoista': 'A one-off concept designed as the ultimate expression of Lamborghini\'s DNA: single-seat, extreme, and uncompromising. Revealed in 2013 for the company\'s 50th anniversary.',
  'Terzo Millennio': 'A forward-looking concept co-developed with MIT, the Terzo Millennio explored the possibilities of electric supercars with energy storage in the carbon fibre structure itself.',
  'Lambo V12 Vision GT': 'The Lamborghini Lambo V12 Vision Gran Turismo was a concept car created exclusively for Gran Turismo Sport in 2019, featuring extreme aerodynamic bodywork and a naturally aspirated V12 engine producing over 800 hp. A real-life full-scale model was later built and displayed at the Lamborghini Museum.',
  'Marzal': 'A dramatic 1967 show car by Marcello Gandini featuring gull-wing doors and a full-width glass cabin. Prince Rainier and Princess Grace of Monaco drove it as the pace car at the Monaco Grand Prix.',
  'Estoque': 'A 2008 concept saloon — Lamborghini\'s answer to the Porsche Panamera. Never produced, but influential in pointing toward the Urus.',
  'Asterion': 'A 2014 hybrid grand tourer concept that foreshadowed the Sián. Never produced.',
  'Lanzador': 'Unveiled in 2023, the Lanzador is Lamborghini\'s concept for a fully electric 2+2 ultra-GT — a glimpse at the fourth model line to follow the Urus.',
  'Acosta': 'A 2006 concept that previewed what became the Gallardo LP570-4 Spyder Performante.',
  'Genesis': 'A one-off concept created in 1988 exploring alternative body styles for a Countach-era platform.',
  'Marco Polo': 'A 1982 show car exploring Lamborghini\'s potential outside the supercar segment.',
  'Portofino': 'A 1987 concept for a mid-engined 2+2, designed by ItalDesign.',
  'Raptor Zagato': 'A 1996 one-off coachbuilt Diablo by Zagato — one of the most dramatic interpretations of the Lamborghini platform.',
  'Konrad WSC': 'The Konrad Motorsport WSC racing programme used Lamborghini V12 power in the early 1990s prototype racing scene.',
  'SC63': 'Lamborghini\'s first factory-backed GT racing car in decades, competing in the WEC and IMSA series from 2024.',
  'Ducati Streetfighter V4': 'The Ducati Streetfighter V4 Lamborghini is a limited special edition motorcycle created in collaboration between Ducati and Lamborghini, featuring Huracán STO-inspired livery and carbon components.',
  'BMW M1': 'The BMW M1 was co-developed with Lamborghini before financial difficulties ended the partnership. Early production was completed at Sant\'Agata Bolognese, making it a genuine piece of Lamborghini history.',
  'Audi R8': 'The Audi R8 shares its platform, V10 engine, and manufacturing facility with the Lamborghini Gallardo/Huracán — a direct product of the Audi-Lamborghini relationship.',
  'Dodge Viper': 'The Dodge Viper\'s V10 engine was developed with input from Lamborghini engineers following Chrysler\'s ownership of the Sant\'Agata company in the late 1980s.',
  'MCA Centenaire': 'The MCA Centenaire was a one-off concept built for the centenary of the French automobile.',
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
  return null; // no color match
};

// Determine if a color is light (needs dark text)
LM.isLightColor = function(hex) {
  if (!hex) return false;
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return (r*299+g*587+b*114)/1000 > 145;
};

// ── TAG RENDERING ────────────────────────────────────────────
LM.milestoneLabel = {
  '1st':'🥇 1st Model','2nd':'🥈 2nd Model','3rd':'🥉 3rd Model',
  '100th':'💯 100th Model','200th':'⭐ 200th Model','300th':'🔥 300th Model','400th':'👑 400th Model',
};

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
