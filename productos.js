/* ═══════════════════════════════════════════════════════════════════════
   productos.js  —  Eros Sex Shop
   Carga el catálogo en tiempo real desde Google Sheets (CSV publicado).
   Compatible con index.html y producto-detalle.html.
   ═══════════════════════════════════════════════════════════════════════ */

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlGP9xfgMe0OWCImNRql6Qsn_2mKFJxlV9wXw1D86N5-ZoF7n2kHvyacZjUXYcU1yRTLqKmsxmICWh/pub?output=csv';

/* ── Tiempo máximo de espera para el fetch (ms) ── */
const FETCH_TIMEOUT_MS = 8000;

/* ══════════════════════════════════════════════════════════════════════
   PARSER CSV  —  maneja comas dentro de comillas y saltos de línea
   ══════════════════════════════════════════════════════════════════════ */
function parseCSV(text) {
  const rows  = [];
  let row     = [];
  let cell    = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch   = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (ch === '"' && next === '"') { cell += '"'; i++; }      // "" → "
      else if (ch === '"')            { inQuote = false; }
      else                            { cell += ch; }
    } else {
      if      (ch === '"')  { inQuote = true; }
      else if (ch === ',')  { row.push(cell.trim()); cell = ''; }
      else if (ch === '\n') { row.push(cell.trim()); rows.push(row); row = []; cell = ''; }
      else if (ch === '\r') { /* ignorar */ }
      else                  { cell += ch; }
    }
  }
  /* última celda / fila */
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }

  return rows;
}

/* ══════════════════════════════════════════════════════════════════════
   CONVERSIÓN  —  filas CSV → objetos de producto
   Columnas esperadas en la hoja (fila 1 = encabezados):
   id | name | cat | price | old | img | e | off | activo |
   desc | ml | marca | color | stock
   ══════════════════════════════════════════════════════════════════════ */
function rowsToProducts(rows) {
  if (rows.length < 2) return [];

  /* Normalizar encabezados: minúsculas, sin espacios extras */
  const headers = rows[0].map(h => h.toLowerCase().trim());

  const col = (name) => headers.indexOf(name);

  /* Índices de cada columna (tolerante a orden distinto en la hoja) */
  const IDX = {
    id    : col('id'),
    name  : col('name'),
    cat   : col('cat'),
    price : col('price'),
    old   : col('old'),
    img   : col('img'),
    e     : col('e'),
    off   : col('off'),
    activo: col('activo'),
    desc  : col('desc'),
    ml    : col('ml'),
    marca : col('marca'),
    color : col('color'),
    stock : col('stock'),
  };

  const toNum  = v => (v === '' || v == null) ? null : Number(String(v).replace(/[^0-9.-]/g, ''));
  const toBool = v => String(v).toLowerCase() === 'true';
  const toStr  = v => (v === '' ? null : v);

  return rows.slice(1).map(r => {
    const get = idx => (idx >= 0 && idx < r.length) ? r[idx] : '';
    return {
      id    : toNum(get(IDX.id)),
      name  : get(IDX.name)   || '(sin nombre)',
      cat   : get(IDX.cat)    || 'General',
      price : toNum(get(IDX.price)) || 0,
      old   : toNum(get(IDX.old)),
      img   : toStr(get(IDX.img)),
      e     : toStr(get(IDX.e))  || '📦',
      off   : toBool(get(IDX.off)),
      activo: (get(IDX.activo) || 'SI').toUpperCase(),
      desc  : toStr(get(IDX.desc)),
      ml    : toStr(get(IDX.ml)),
      marca : toStr(get(IDX.marca)),
      color : toStr(get(IDX.color)),
      stock : toNum(get(IDX.stock)),
    };
  }).filter(p => p.id && p.activo === 'SI');   // descarta sin ID o inactivos
}

/* ══════════════════════════════════════════════════════════════════════
   CARGA PRINCIPAL
   Exporta la promesa `MIS_PRODUCTOS_PROMISE` para que cada página
   la consuma. También setea `window.MIS_PRODUCTOS` cuando termina.
   ══════════════════════════════════════════════════════════════════════ */
window.MIS_PRODUCTOS = [];   // array vacío mientras carga

const MIS_PRODUCTOS_PROMISE = (function () {

  /* AbortController para timeout */
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  return fetch(SHEET_CSV_URL, { signal: controller.signal })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(text => {
      const rows     = parseCSV(text);
      const products = rowsToProducts(rows);
      window.MIS_PRODUCTOS = products;
      console.info('[Eros] ' + products.length + ' productos cargados desde Sheets.');
      return products;
    })
    .catch(err => {
      clearTimeout(timer);
      console.error('[Eros] Error al cargar productos desde Sheets:', err);
      window.MIS_PRODUCTOS = [];
      return [];
    });
})();
