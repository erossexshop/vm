// api/get-productos.js

// 1. Guardamos la URL de forma totalmente privada en el servidor
const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQlGP9xfgMe0OWCImNRql6Qsn_2mKFJxlV9wXw1D86N5-ZoF7n2kHvyacZjUXYcU1yRTLqKmsxmICWh/pub?output=csv';

// Parser manual de CSV optimizado para Node.js (Tu lógica original adaptada)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuote = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuote) {
      if (ch === '"') {
        if (next === '"') { cell += '"'; i++; }
        else { inQuote = false; }
      } else { cell += ch; }
    } else {
      if (ch === '"') { inQuote = true; }
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\r' || ch === '\n') {
        row.push(cell); cell = '';
        if (row.length > 1 || row[0] !== '') rows.push(row);
        row = [];
        if (ch === '\r' && next === '\n') i++;
      } else { cell += ch; }
    }
  }
  if (row.length > 0 || cell !== '') { row.push(cell); rows.push(row); }
  return rows;
}

function rowsToProducts(rows) {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h).trim().toLowerCase());
  
  const IDX = {
    id: headers.indexOf('id'), name: headers.indexOf('name'), cat: headers.indexOf('cat'),
    price: headers.indexOf('price'), img: headers.indexOf('img'), activo: headers.indexOf('activo'),
    desc: headers.indexOf('desc'), marca: headers.indexOf('marca'), featured: headers.indexOf('featured')
  };

  const toStr = v => v ? String(v).trim() : '';
  const toNum = v => { if (!v) return 0; let n = parseFloat(String(v).replace(/[^0-9.,-]/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; };
  const toFeat = v => { if (!v) return false; const s = String(v).trim().toLowerCase(); return s === 'si' || s === 'true' || s === '1' || s === 'featured'; };

  return rows.slice(1).map(row => {
    const get = idx => (idx !== -1 && idx < row.length) ? row[idx] : '';
    const rawCat = toStr(get(IDX.cat));
    const cats = rawCat ? rawCat.split(',').map(c => c.trim()).filter(Boolean) : [];

    return {
      id: toStr(get(IDX.id)),
      name: toStr(get(IDX.name)),
      cat: cats[0] || 'General',
      cats: cats,
      price: toNum(get(IDX.price)) || 0,
      img: toStr(get(IDX.img)),
      activo: (get(IDX.activo) || 'SI').toUpperCase(),
      desc: toStr(get(IDX.desc)),
      marca: toStr(get(IDX.marca)),
      featured: toFeat(get(IDX.featured)),
      old: null, e: '📦', off: false,
    };
  }).filter(p => p.id && p.activo === 'SI');
}

// Handler principal de Vercel Serverless
export default async function handler(req, res) {
  // Habilitar CORS para que tu frontend en GitHub Pages pueda consultar esta API sin problemas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) throw new Error('Error al descargar desde Google Sheets');
    
    const text = await response.text();
    const products = rowsToProducts(parseCSV(text));
    
    // Respondemos con los productos procesados en formato JSON estructurado
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ error: 'Error interno al obtener catálogo', detalles: error.message });
  }
}
