// productos.js (Ubicado en la raíz de tu repositorio)

// 1. Apuntamos directo a tu API segura en Vercel
const API_URL = 'https://vm-six-tau.vercel.app/api/get-productos';

// Inicializamos las variables globales que esperan index.html y producto-detalle.html
window.MIS_PRODUCTOS = [];

// 2. Creamos la Promesa global que tus HTMLs esperan con .then()
window.MIS_PRODUCTOS_PROMISE = fetch(API_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error('Error en la respuesta de la API de Vercel');
    }
    return response.json();
  })
  .then(data => {
    // Guardamos los productos en la variable global para que los filtros la usen
    window.MIS_PRODUCTOS = data;
    return data;
  })
  .catch(error => {
    console.error('Error cargando el catálogo desde el proxy:', error);
    // En caso de error crítico, dejamos un catálogo vacío para que no rompa la interfaz
    window.MIS_PRODUCTOS = [];
    return [];
  });
