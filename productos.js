const MIS_PRODUCTOS = [

  // ── ANAL ─────────────────────────────────────────────────────────────
  {
    id: 1,
    name: "Gel lubricante Anal Different Touch 75Cc",
    cat: "Anal",
    price: 15000,
    old: null,
    img: "https://dcdn-us.mitiendanube.com/stores/003/101/326/products/a121-13266740d91318f5a916866821737310-1024-1024.webp",
    e: "💜",
    off: false,
    activo: "SI",
    // ── Campos de detalle ──────────────────────────────────────────────
    desc: "Lubricante anal de alta calidad, formulado para máxima comodidad y suavidad. Ideal para principiantes y uso frecuente.",
    ml: "75 cc",
    marca: "Different Touch",
    color: null,
    stock: 50
  },
  {
    id: 2,
    name: "Gel Crema Anal Lubricate Cream",
    cat: "Anal",
    price: 20000,
    old: null,
    img: "https://dcdn-us.mitiendanube.com/stores/003/101/326/products/a871-ebdb12f9a34feacc3516857154613049-1024-1024.webp",
    e: "🌸",
    off: false,
    activo: "SI",
    desc: "Crema lubricante anal con textura suave y duradera. Fórmula relajante para mayor comodidad.",
    ml: null,
    marca: null,
    color: null,
    stock: null
  },

  // ── ANILLOS ──────────────────────────────────────────────────────────
  {
    id: 3,
    name: "Anillos Erectores Peneanos",
    cat: "Anillos",
    price: 10000,
    old: null,
    img: "https://dcdn-us.mitiendanube.com/stores/003/101/326/products/hot-toy-91-27e4e944476a8bd55316893657662871-1024-1024.webp",
    e: "⭕",
    off: false,
    activo: "SI",
    desc: "Set de anillos erectores de silicona premium. Distintos tamaños para mayor placer y durabilidad.",
    ml: null,
    marca: "Hot Toy",
    color: "Negro",
    stock: null
  }

];
/*
  ────────────────────────────────────────────────────────────
  CAMPOS DISPONIBLES POR PRODUCTO:
  id       → número único (obligatorio)
  name     → nombre del producto (obligatorio)
  cat      → categoría (debe coincidir con el menú)
  price    → precio actual (número sin $)
  old      → precio anterior, null si no hay oferta
  img      → URL de la imagen, null para usar emoji
  e        → emoji de respaldo
  off      → true/false para badge de oferta
  activo   → "SI" / "NO" para ocultar sin borrar
  desc     → descripción larga para la página de detalle
  ml       → contenido en ml/cc si aplica
  marca    → marca del producto
  color    → color si aplica
  stock    → cantidad disponible (número o null)
  ────────────────────────────────────────────────────────────
*/
