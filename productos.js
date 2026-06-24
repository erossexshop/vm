/* ═══════════════════════════════════════════════════════════════════════
   productos.js  —  Eros Sex Shop (Versión Segura vía Proxy Serverless)
   ═══════════════════════════════════════════════════════════════════════ */

// Cuando despliegues en Vercel, cambia esta URL por la que te dé Vercel (ej: 'https://tu-proyecto.vercel.app/api/get-productos')
const API_URL = '/api/get-productos'; 
const FETCH_TIMEOUT_MS = 8000;

window.MIS_PRODUCTOS = [];

const MIS_PRODUCTOS_PROMISE = (function () {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  // Consultamos directamente a nuestra función segura que devuelve el JSON ya listo
  return fetch(API_URL, { signal: controller.signal })
    .then(res => {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json(); // Ahora es un JSON directo, ya no un texto CSV plano
    })
    .then(products => {
      window.MIS_PRODUCTOS = products;
      console.info('[Eros] ' + products.length + ' productos cargados de forma segura desde el Servidor.');
      return products;
    })
    .catch(err => {
      clearTimeout(timer);
      console.error('[Eros] Error crítico cargando catálogo:', err);
      // Fallback vacío seguro para evitar que la interfaz explote
      window.MIS_PRODUCTOS = [];
      return [];
    });
})();
