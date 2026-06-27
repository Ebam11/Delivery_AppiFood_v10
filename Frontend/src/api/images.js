// Archivo: src/api/images.js | Comentario: logica principal del modulo optimizada.
/**
 * Servicio para obtener imágenes mediante enlaces directos optimizados estáticos.
 * Reemplaza la API de Unsplash para garantizar cargas instantáneas, sin límites
 * de peticiones y alta confiabilidad.
 */

const foodImages = {
  'burger': [
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586816001966-79b736744398?w=400&h=300&fit=crop',
  ],
  'chicken': [
    'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop',
  ],
  'pizza': [
    'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=400&h=300&fit=crop',
  ],
  'pasta': [
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=300&fit=crop',
  ],
  'sushi': [
    'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1553621042-f6e147245754?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&h=300&fit=crop',
  ],
  'salad': [
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
  ],
  'dessert': [
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=400&h=300&fit=crop',
  ],
  'drink': [
    'https://images.unsplash.com/photo-1554866585-acbb25d68d6c?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=400&h=300&fit=crop',
  ],
}

export const getPlaceholderImage = (query = 'burger') => {
  const q = query?.toLowerCase() || 'burger'
  const images = foodImages[q] || foodImages['burger']
  return images[Math.floor(Math.random() * images.length)]
}

export const getRandomFoodImage = async (query = 'burger') => {
  const url = getPlaceholderImage(query)
  return {
    url,
    photographer: 'Stock Food',
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
}

export const detectFoodCategory = (name = '') => {
  const nameL = name.toLowerCase()
  if (nameL.includes('burger') || nameL.includes('whopper') || nameL.includes('hamburger')) return 'burger'
  if (nameL.includes('chicken') || nameL.includes('pollo') || nameL.includes('ruti')) return 'chicken'
  if (nameL.includes('pizza')) return 'pizza'
  if (nameL.includes('pasta') || nameL.includes('chinese') || nameL.includes('sopa') || nameL.includes('caldo')) return 'pasta'
  if (nameL.includes('sushi') || nameL.includes('roll')) return 'sushi'
  if (nameL.includes('salad') || nameL.includes('ensalada') || nameL.includes('vegetariano')) return 'salad'
  if (nameL.includes('dessert') || nameL.includes('postre') || nameL.includes('chocolate') || nameL.includes('helado')) return 'dessert'
  if (nameL.includes('drink') || nameL.includes('bebida') || nameL.includes('jugo') || nameL.includes('gaseosa')) return 'drink'
  if (nameL.includes('empanada') || nameL.includes('dedito') || nameL.includes('frito') || nameL.includes('entrada')) return 'chicken' // fallback to chicken for fried entries
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

const restaurantFoodMap = {
  'burger house': 'burger',
  'pizza nostra': 'pizza',
  'sushi zen': 'sushi',
  'el rincón paisa': 'salad',
}

export const getRestaurantImage = async (restaurantName = 'restaurant') => {
  const foodType = restaurantFoodMap[restaurantName?.toLowerCase()] || 'burger'
  return getRandomFoodImage(foodType)
}

export default {
  getRandomFoodImage,
  getFoodImages,
  getImageByCategory,
  getRestaurantImage,
}
