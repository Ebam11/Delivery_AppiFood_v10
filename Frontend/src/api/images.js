// Archivo: src/api/images.js | Comentario: logica principal del modulo con imagenes directas sin CDN intermediario.
/**
 * Servicio para obtener imágenes mediante enlaces directos de Unsplash.
 * Usa los parámetros nativos de Unsplash para optimización (w, h, q, fit).
 * No usa CDN intermediario para evitar bloqueos.
 */

// Retorna la URL directamente (sin wrapper de Cloudinary demo que bloquea)
export const getOptimizedImageUrl = (url, width = 500) => {
  if (!url) return ''
  // Si ya es una URL de Cloudinary real (no demo), retornarla directamente
  if (url.includes('cloudinary.com') && !url.includes('/demo/')) {
    return url
  }
  // Si es URL de Unsplash, usar sus parámetros nativos de optimización
  if (url.includes('unsplash.com')) {
    // Limpiar parámetros existentes y agregar los optimizados
    const base = url.split('?')[0]
    return `${base}?w=${width}&h=${Math.round(width * 0.75)}&fit=crop&auto=format&q=80`
  }
  // Si es data URL o blob, retornar directo
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  // Para cualquier otra URL, retornar directamente
  return url
}

// Banco de imágenes de Unsplash por categoría - URLs directas y verificadas
const foodImages = {
  'burger': [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
    'https://images.unsplash.com/photo-1550547660-d9450f859349',
    'https://images.unsplash.com/photo-1586816001966-79b736744398',
    'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9',
  ],
  'chicken': [
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6',
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec',
    'https://images.unsplash.com/photo-1562967914-608f82629710',
    'https://images.unsplash.com/photo-1606728035253-49e8a23146de',
  ],
  'pizza': [
    'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591',
    'https://images.unsplash.com/photo-1590947132387-155cc02f3212',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
  ],
  'pasta': [
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141',
    'https://images.unsplash.com/photo-1527515637462-cff94aca208a',
  ],
  'sushi': [
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
    'https://images.unsplash.com/photo-1553621042-f6e147245754',
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252',
    'https://images.unsplash.com/photo-1617196034183-421b4040ed20',
  ],
  'salad': [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  ],
  'dessert': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187',
    'https://images.unsplash.com/photo-1550617931-e17a7b70dce2',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777',
  ],
  'drink': [
    'https://images.unsplash.com/photo-1554866585-acbb25d68d6c',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd',
    'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc',
    'https://images.unsplash.com/photo-1544145945-f90425340c7e',
  ],
  'seafood': [
    'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47',
    'https://images.unsplash.com/photo-1559742811-822873691df8',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  ],
  'breakfast': [
    'https://images.unsplash.com/photo-1533920379810-6bedac961555',
    'https://images.unsplash.com/photo-1484723091739-30a097e8f929',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8',
    'https://images.unsplash.com/photo-1541519227354-08fa5d50c820',
  ],
  'mexican': [
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
    'https://images.unsplash.com/photo-1619740455993-9d8a4d1e3bac',
    'https://images.unsplash.com/photo-1600271886742-f049cd451bba',
  ],
  'colombian': [
    'https://images.unsplash.com/photo-1547592180-85f173990554',
    'https://images.unsplash.com/photo-1504544750208-dc0358e31b6e',
    'https://images.unsplash.com/photo-1565299507177-b0ac66763828',
    'https://images.unsplash.com/photo-1532980400857-e8d9d275d858',
  ],
}

// Mapa de restaurantes conocidos a tipo de imagen
const restaurantImageMap = {
  'burger house': { category: 'burger', url: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add' },
  'pollo dorado': { category: 'chicken', url: 'https://images.unsplash.com/photo-1619881590738-a111d176d906' },
  'mariscos del puerto': { category: 'seafood', url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47' },
  'pizza nostra': { category: 'pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591' },
  'sushi zen': { category: 'sushi', url: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252' },
  'el rincón paisa': { category: 'colombian', url: 'https://images.unsplash.com/photo-1547592180-85f173990554' },
  'la bandeja': { category: 'colombian', url: 'https://images.unsplash.com/photo-1532980400857-e8d9d275d858' },
  'verde fresco': { category: 'salad', url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe' },
  'barra fresca': { category: 'drink', url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e' },
  'tamales del alba': { category: 'colombian', url: 'https://images.unsplash.com/photo-1547592180-85f173990554' },
  'café madrugón': { category: 'breakfast', url: 'https://images.unsplash.com/photo-1533920379810-6bedac961555' },
  'sopas del claustro': { category: 'pasta', url: 'https://images.unsplash.com/photo-1504544750208-dc0358e31b6e' },
}

// Índices para rotación determinista (evita aleatoriedad en cada render)
const indexMap = {}

const getIndexFor = (key) => {
  if (indexMap[key] === undefined) {
    indexMap[key] = Math.floor(Math.random() * 4)
  }
  return indexMap[key]
}

export const getPlaceholderImage = (query = 'burger', width = 500) => {
  const q = query?.toLowerCase() || 'burger'
  const images = foodImages[q] || foodImages['burger']
  const idx = getIndexFor(q)
  const selectedUrl = images[idx % images.length]
  return getOptimizedImageUrl(selectedUrl, width)
}

export const getRandomFoodImage = async (query = 'burger') => {
  const url = getPlaceholderImage(query, 500)
  return {
    url,
    photographer: 'Unsplash',
    description: query,
    cached: true
  }
}

export const getFoodImages = async (query = 'burger', count = 4) => {
  const images = []
  for (let i = 0; i < count; i++) {
    images.push(await getRandomFoodImage(query))
  }
  return images
}

const categoryMap = {
  burger: 'burger',
  hamburguesa: 'burger',
  pizza: 'pizza',
  chicken: 'chicken',
  pollo: 'chicken',
  pasta: 'pasta',
  sushi: 'sushi',
  ensalada: 'salad',
  postre: 'dessert',
  bebida: 'drink',
  marisco: 'seafood',
  mariscos: 'seafood',
  pescado: 'seafood',
  desayuno: 'breakfast',
  mexicano: 'mexican',
  colombiano: 'colombian',
  paisa: 'colombian',
  tamal: 'colombian',
  sopa: 'pasta',
  caldo: 'pasta',
}

export const detectFoodCategory = (name = '') => {
  const nameL = name.toLowerCase()
  if (nameL.includes('burger') || nameL.includes('whopper') || nameL.includes('hamburger') || nameL.includes('hambur')) return 'burger'
  if (nameL.includes('chicken') || nameL.includes('pollo') || nameL.includes('broaster') || nameL.includes('asado')) return 'chicken'
  if (nameL.includes('pizza')) return 'pizza'
  if (nameL.includes('sushi') || nameL.includes('roll') || nameL.includes('maki')) return 'sushi'
  if (nameL.includes('marisco') || nameL.includes('ceviche') || nameL.includes('pescado') || nameL.includes('puerto') || nameL.includes('cazuela')) return 'seafood'
  if (nameL.includes('desayuno') || nameL.includes('café') || nameL.includes('cafe') || nameL.includes('madrugón') || nameL.includes('waffles')) return 'breakfast'
  if (nameL.includes('tamal') || nameL.includes('bandeja') || nameL.includes('paisa') || nameL.includes('rincón') || nameL.includes('claustro')) return 'colombian'
  if (nameL.includes('salad') || nameL.includes('ensalada') || nameL.includes('verde') || nameL.includes('vegeta')) return 'salad'
  if (nameL.includes('dessert') || nameL.includes('postre') || nameL.includes('chocolate') || nameL.includes('helado') || nameL.includes('torta')) return 'dessert'
  if (nameL.includes('drink') || nameL.includes('bebida') || nameL.includes('jugo') || nameL.includes('gaseosa') || nameL.includes('barra fresca')) return 'drink'
  if (nameL.includes('pasta') || nameL.includes('sopa') || nameL.includes('caldo')) return 'pasta'
  if (nameL.includes('mexican') || nameL.includes('taco') || nameL.includes('burrito')) return 'mexican'
  return 'burger'
}

export const getImageByQuery = async (query) => {
  const category = detectFoodCategory(query)
  return getRandomFoodImage(category)
}

export const getImageByCategory = async (category) => {
  const query = categoryMap[category?.toLowerCase()] || 'burger'
  return getRandomFoodImage(query)
}

export const getRestaurantImage = async (restaurantName = 'restaurant') => {
  const nameL = restaurantName?.toLowerCase() || ''
  
  // Primero buscar imagen específica del restaurante
  const specific = restaurantImageMap[nameL]
  if (specific) {
    const url = getOptimizedImageUrl(specific.url, 800)
    return { url, photographer: 'Unsplash', description: restaurantName, cached: true }
  }

  // Si no hay imagen específica, detectar por categoría
  const category = detectFoodCategory(restaurantName)
  const images = foodImages[category] || foodImages['burger']
  const idx = getIndexFor(`restaurant_${nameL}`)
  const url = getOptimizedImageUrl(images[idx % images.length], 800)
  return { url, photographer: 'Unsplash', description: restaurantName, cached: true }
}

export default {
  getRandomFoodImage,
  getFoodImages,
  getImageByCategory,
  getRestaurantImage,
  getOptimizedImageUrl,
  detectFoodCategory,
}
