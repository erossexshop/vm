/* ═══════════════════════════════════════════════════════════════════════
   productos.js  —  Eros Sex Shop
   Carga el catálogo en tiempo real desde Google Sheets (CSV publicado).
   Compatible con index.html y producto-detalle.html.

   COLUMNAS ESPERADAS EN LA HOJA (fila 1 = encabezados exactos):
   id | name | cat | price | img | activo | desc | marca
   ═══════════════════════════════════════════════════════════════════════ */

const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlGP9xfgMe0OWCImNRql6Qsn_2mKFJxlV9wXw1D86N5-ZoF7n2kHvyacZjUXYcU1yRTLqKmsxmICWh/pub?output=csv';

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
      if (ch === '"' && next === '"') { cell += '"'; i++; }
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
  if (cell || row.length) { row.push(cell.trim()); rows.push(row); }

  return rows;
}

/* ══════════════════════════════════════════════════════════════════════
   CONVERSIÓN  —  filas CSV → objetos de producto (8 columnas)
   ══════════════════════════════════════════════════════════════════════ */
function rowsToProducts(rows) {
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.toLowerCase().trim());
  const col     = name => headers.indexOf(name);

  const IDX = {
    id    : col('id'),
    name  : col('name'),
    cat   : col('cat'),
    price : col('price'),
    img   : col('img'),
    activo: col('activo'),
    desc  : col('desc'),
    marca : col('marca'),
  };

  const toNum = v => (v === '' || v == null) ? null : Number(String(v).replace(/[^0-9.-]/g, ''));
  const toStr = v => (v === '' ? null : v);

  return rows.slice(1).map(r => {
    const get = idx => (idx >= 0 && idx < r.length) ? r[idx] : '';
    return {
      id    : toNum(get(IDX.id)),
      name  : get(IDX.name)  || '(sin nombre)',
      cat   : get(IDX.cat)   || 'General',
      price : toNum(get(IDX.price)) || 0,
      img   : toStr(get(IDX.img)),
      activo: (get(IDX.activo) || 'SI').toUpperCase(),
      desc  : toStr(get(IDX.desc)),
      marca : toStr(get(IDX.marca)),
      /* campos legacy mantenidos como null para no romper templates */
      old   : null,
      e     : '📦',
      off   : false,
    };
  }).filter(p => p.id && p.activo === 'SI');
}

/* ══════════════════════════════════════════════════════════════════════
   CARGA PRINCIPAL
   ══════════════════════════════════════════════════════════════════════ */
window.MIS_PRODUCTOS = [];

const MIS_PRODUCTOS_PROMISE = (function () {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  return fetch(SHEET_CSV_URL, { signal: controller.signal })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(text => {
      const products = rowsToProducts(parseCSV(text));
      window.MIS_PRODUCTOS = products;
      console.info('[Eros] ' + products.length + ' productos cargados desde Sheets.');
      return products;
    })
    .catch(err => {
      clearTimeout(timer);
      console.error('[Eros] Error al cargar productos:', err);
      window.MIS_PRODUCTOS = [];
      return [];
    });
})();
