# 🖼️ Integración de Imágenes con Unsplash

## 📋 Configuración

### Paso 1: Obtén una API Key de Unsplash

1. Ve a: https://unsplash.com/oauth/applications
2. Si no tienes cuenta, regístrate
3. Haz clic en "Create New Application"
4. Acepta los términos
5. Completa la información
6. Copia el **Access Key**

### Paso 2: Configura la variable de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_UNSPLASH_KEY=tu_access_key_aqui
```

**Importante:** No uses `VITE_` prefix para variables privadas. Si quieres mantenerla privada, configúrala en el backend.

## 🚀 Uso en tu app

### Opción 1: Hook en Componentes React

```jsx
import { useProductImage } from '../hooks/useImages'

export default function ProductCard({ product }) {
  const { image, loading } = useProductImage(product.category)

  return (
    <div className="product-card">
      {loading ? (
        <div className="skeleton">Cargando...</div>
      ) : (
        <img src={image} alt={product.name} />
      )}
      <h3>{product.name}</h3>
    </div>
  )
}
```

### Opción 2: API Directa

```jsx
import { getImageByCategory, getRestaurantImage } from '../api/images'

// Para producto
const img = await getImageByCategory('pizza')
console.log(img.url) // URL de la imagen

// Para restaurante
const restImg = await getRestaurantImage('Burger House')
console.log(restImg.url)
```

## 📊 Límites de API

| Tipo | Sin API Key | Con API Key |
|------|-------------|------------|
| Requests/hora | 50 | 5000 |
| Recomendado para | Testing | Producción |

## 💡 Tips

### Caché de imágenes
Para evitar múltiples requests, guarda las URLs en localStorage:

```jsx
const getCachedImage = async (key, fetchFn) => {
  const cached = localStorage.getItem(`img_${key}`)
  if (cached) return cached

  const img = await fetchFn()
  localStorage.setItem(`img_${key}`, img.url)
  return img.url
}
```

### Categorías soportadas

```javascript
- burger, hamburguesa
- pizza
- chicken, pollo
- pasta
- sushi
- ensalada
- postre
- bebida
```

Puedes añadir más en `src/api/images.js` en el objeto `categoryMap`.

## 🔒 Seguridad

**⚠️ IMPORTANTE:** La API Key debería estar en el backend, no en el frontend. 

Para máxima seguridad en producción:

1. Llama a tu backend: `GET /api/images/product/:category`
2. El backend hace la llamada a Unsplash con la API Key
3. El backend retorna la URL al frontend

Ejemplo backend (Laravel):

```php
Route::get('/api/images/product/{category}', function($category) {
    $client = new \GuzzleHttp\Client();
    $response = $client->request('GET', 'https://api.unsplash.com/search/photos', [
        'query' => [
            'query' => $category,
            'Authorization' => 'Client-ID ' . env('UNSPLASH_KEY')
        ]
    ]);
    return $response->json();
});
```

## 📝 Ejemplo Completo

```jsx
import { useEffect, useState } from 'react'
import { getImageByCategory } from '../api/images'

export default function ProductGallery() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Burger', category: 'burger' },
    { id: 2, name: 'Pizza', category: 'pizza' },
    { id: 3, name: 'Pollo Frito', category: 'chicken' }
  ])

  const [images, setImages] = useState({})

  useEffect(() => {
    products.forEach(async (product) => {
      const img = await getImageByCategory(product.category)
      setImages(prev => ({ ...prev, [product.id]: img.url }))
    })
  }, [products])

  return (
    <div className="grid">
      {products.map(product => (
        <div key={product.id}>
          <img src={images[product.id]} alt={product.name} />
          <h3>{product.name}</h3>
        </div>
      ))}
    </div>
  )
}
```

## ✅ Estado Actual

- ✅ Servicio de API (src/api/images.js)
- ✅ Hooks React (src/hooks/useImages.js)
- ✅ Fallback a placeholders
- ✅ Manejo de errores
- ℹ️ Aún no integrado en componentes (próximo paso)

## 🔗 Links Útiles

- Unsplash API: https://unsplash.com/api
- Documentación: https://unsplash.com/api/documentation
- Terms: https://unsplash.com/api/guidelines
