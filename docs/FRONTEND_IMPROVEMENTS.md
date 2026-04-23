# 🔧 Recomendaciones de Refactorización - Frontend

## Estado Actual

El Frontend está bien estructurado pero tiene algunas áreas que pueden mejorarse sin romper el código existente.

**Score Actual:** 7.5/10

---

## 🔴 PROBLEMAS CRÍTICOS

### 1. Archivos Monolíticos (URGENTE)

**AdminDashboard.jsx (1289 líneas)**
- Ubicación: [Frontend/src/pages/AdminDashboard.jsx](Frontend/src/pages/AdminDashboard.jsx)
- Contiene: Dashboard stats, Restaurants CRUD, Users CRUD, Orders table, Reviews

**Impacto:** Difícil de mantener, testing complejo, re-renders innecesarios

**Solución Recomendada:**

Crear estructura:
```
Frontend/src/pages/Admin/
├── Dashboard.jsx           → Router principal (>50 líneas)
├── Sections/
│   ├── OverviewSection.jsx
│   ├── RestaurantsSection.jsx
│   ├── UsersSection.jsx
│   ├── OrdersSection.jsx
│   └── ReviewsSection.jsx
└── Components/
    ├── AdminTable.jsx      → Tabla reutilizable
    ├── AdminCard.jsx       → Tarjeta stats
    └── AdminModal.jsx      → Modales comunes
```

**Pasos:**
1. Identificar funciones internas en AdminDashboard.jsx
2. Extraer cada una a su archivo
3. Importarlas en Dashboard.jsx
4. Reemplazar en código gradualmente

---

**RestaurantDashboard.jsx (2036 líneas)**
- Ubicación: [Frontend/src/pages/RestaurantDashboard.jsx](Frontend/src/pages/RestaurantDashboard.jsx)
- Contiene: Orders, Menu, Reviews, Messages, Analytics

**Solución Recomendada:**

```
Frontend/src/pages/Restaurant/
├── Dashboard.jsx           → Router con tabs
├── Tabs/
│   ├── OverviewTab.jsx
│   ├── MenuTab.jsx
│   ├── OrdersTab.jsx
│   ├── ReviewsTab.jsx
│   └── MessagesTab.jsx
└── Components/
    ├── OrderCard.jsx
    ├── MenuItemEditor.jsx
    ├── ReviewCard.jsx
    └── MessageBubble.jsx
```

---

### 2. Duplicidad en Custom Hooks (ALTO)

**useImages.js** - Dos hooks casi idénticos

**Ubicación:** [Frontend/src/hooks/useImages.js](Frontend/src/hooks/useImages.js)

**Problema:**
```javascript
// Función 1: useProductImage
export const useProductImage = (query, fallbackUrl = null) => {
  // ... setup ...
  useEffect(() => {
    const loadImage = async () => {
      const img = await getImageByQuery(query)
      setImage(img.url)
    }
    loadImage()
  }, [query])
}

// Función 2: useRestaurantImage - CASI IDÉNTICA
export const useRestaurantImage = (restaurantName, fallbackUrl = null) => {
  // ... setup ...
  useEffect(() => {
    const loadImage = async () => {
      const img = await getRestaurantImage(restaurantName) // ← único cambio
      setImage(img.url)
    }
    loadImage()
  }, [restaurantName])
}
```

**Solución Recomendada:**

Consolidar en un hook genérico:

```javascript
/**
 * Custom hook genérico para cargar imágenes
 * @param {Function} fetchFn - Función que trae la imagen
 * @param {string|number} query - Parámetro para buscar
 * @param {string} fallbackUrl - URL por defecto
 * @returns {Object} { image, isLoading, error }
 */
export const useImageLoader = (fetchFn, query, fallbackUrl = null) => {
  const [image, setImage] = useState(fallbackUrl)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!query) {
      setIsLoading(false)
      return
    }

    const loadImage = async () => {
      try {
        setIsLoading(true)
        const result = await fetchFn(query)
        setImage(result?.url || fallbackUrl)
      } catch (err) {
        setError(err)
        setImage(fallbackUrl)
      } finally {
        setIsLoading(false)
      }
    }

    loadImage()
  }, [query, fallbackUrl])

  return { image, isLoading, error }
}

// Luego, crear wrappers simples:
export const useProductImage = (query, fallback) => 
  useImageLoader(getImageByQuery, query, fallback)

export const useRestaurantImage = (name, fallback) => 
  useImageLoader(getRestaurantImage, name, fallback)
```

---

### 3. Falta de Memoización (ALTO)

**ProductCard.jsx y RestaurantCard.jsx** nunca se memoizan

**Impacto:** Se re-renderizan innecesariamente cuando el padre cambia

**Solución Recomendada:**

Cambiar de:
```javascript
export default function ProductCard({ product, onFav, isFav, onSelect }) {
  // ...
}
```

A:
```javascript
const ProductCard = React.memo(
  function ProductCard({ product, onFav, isFav, onSelect }) {
    // ...
  },
  (prev, next) => {
    // Custom comparison: no re-render si estas props son iguales
    return (
      prev.product?.id === next.product?.id &&
      prev.isFav === next.isFav &&
      prev.onFav === next.onFav &&
      prev.onSelect === next.onSelect
    )
  }
)

export default ProductCard
```

O más simple con `useMemo` en padres:

```javascript
// En padre (ProductList.jsx)
const memoizedProducts = useMemo(
  () => products.map(p => (
    <ProductCard key={p.id} product={p} onFav={onFav} />
  )),
  [products, onFav]
)
```

---

## 🟠 PROBLEMAS ALTOS

### 4. Props Drilling en Header

**Ubicación:** [Frontend/src/components/Header.jsx](Frontend/src/components/Header.jsx)

**Problema:**
```javascript
// En App.jsx
<Header 
  isAuth={isAuth}           // ← Props drilling
  user={user}               // ← Props drilling
  onLogout={onLogout}       // ← Props drilling
  isLoading={isLoading}     // ← Props drilling
/>
```

**Solución:** Usar Zustand directamente en Header

```javascript
// En Header.jsx
import { useAuthStore } from '../store/authStore'

export default function Header() {
  const { isAuthenticated, user, isLoading } = useAuthStore()
  const { logout } = useAuthStore()

  // ... rest del código
}
```

**Ventaja:** No necesita recibir props, accede directamente al estado global

---

### 5. Duplicidad en orderStore.js

**Ubicación:** [Frontend/src/store/orderStore.js](Frontend/src/store/orderStore.js)

**Problema:**
```javascript
const create((set, get) => ({
  fetchOrder: async (id) => {
    // ... código duplicado ...
  },
  
  fetchOrderById: async (id) => {
    // ... MISMO código ...
  }
}))
```

**Solución:** Consolidar

```javascript
const useOrderStore = create((set, get) => ({
  fetchOrder: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await getOrder(id)
      set({ order: data, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  }
}))

// fetchOrderById es un alias
useOrderStore.fetchOrderById = useOrderStore.fetchOrder
```

---

### 6. Lógica de Filtros y Carruseles en Páginas

**Ubicación:** Home.jsx, Restaurants.jsx

**Problema:** Lógica reutilizable está en páginas

```javascript
// Home.jsx
const [heroIdx, setHeroIdx] = useState(0)
useEffect(() => {
  const interval = setInterval(() => {
    setHeroIdx(prev => (prev + 1) % heroSlides.length)
  }, 5000)
  return () => clearInterval(interval)
}, [])

// Restaurants.jsx también tiene lógica similar
```

**Solución:** Crear hooks reutilizables

```javascript
// Frontend/src/hooks/useCarousel.js
export const useCarousel = (items = [], interval = 5000) => {
  const [currentIdx, setCurrentIdx] = useState(0)

  useEffect(() => {
    if (items.length === 0) return

    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % items.length)
    }, interval)

    return () => clearInterval(timer)
  }, [items.length, interval])

  const goTo = useCallback((idx) => {
    if (idx >= 0 && idx < items.length) {
      setCurrentIdx(idx)
    }
  }, [items.length])

  return { currentIdx, goTo, currentItem: items[currentIdx] }
}

// Uso en Home.jsx
const { currentIdx, currentItem } = useCarousel(heroSlides, 5000)
```

---

### 7. CartSidebar Múltiples Responsabilidades

**Ubicación:** [Frontend/src/components/CartSidebar.jsx](Frontend/src/components/CartSidebar.jsx)

**Estructura Actual:** Todo en un archivo (~150 líneas)

**Estructura Recomendada:**

```
Frontend/src/components/Cart/
├── CartSidebar.jsx          → Contenedor principal
├── CartItemsList.jsx        → Lista de items
├── CartCouponSection.jsx    → Cupón y validación
├── CartTotals.jsx           → Resumen de totales
└── CartActions.jsx          → Botones (checkout, etc)
```

---

## 🟡 PROBLEMAS MEDIOS

### 8. Inconsistencia en Error Handling

**Problema:** Diferentes formas de acceder a datos de respuesta API

```javascript
// cartStore.js
const cartResponse = await getCart()
set({ cart: cartResponse.data, isLoading: false })

// orderStore.js
const unwrapData = (response) => 
  response?.data?.data ?? response?.data ?? response
```

**Solución:** Centralizar en un helper

```javascript
// Frontend/src/api/responseHandler.js
export const unwrapResponse = (response) => {
  // Las APIs Laravel devuelven: { data: {...} }
  // Algunos endpoints devuelven: { data: { data: {...} } }
  return response?.data?.data ?? response?.data ?? response
}

// Uso en stores
import { unwrapResponse } from '../api/responseHandler'

const cartResponse = await getCart()
set({ cart: unwrapResponse(cartResponse), isLoading: false })
```

---

### 9. Validación de Formularios Ausente

**Ubicación:** Login.jsx, Register.jsx, Checkout.jsx

**Problema:** Sin validación de email, contraseña, dirección

**Solución:** Crear hook de validación

```javascript
// Frontend/src/hooks/useFormValidation.js
export const useFormValidation = (initialState, onSubmit, validate) => {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    const err = validate({ ...values, [name]: values[name] })
    setErrors(err)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const err = validate(values)
    if (Object.keys(err).length === 0) {
      onSubmit(values)
    } else {
      setErrors(err)
      setTouched(Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    }
  }

  return { values, errors, touched, handleChange, handleBlur, handleSubmit, setValues }
}

// Uso en Login.jsx
const { values, errors, handleChange, handleSubmit } = useFormValidation(
  { email: '', password: '' },
  async (values) => {
    await loginApi(values)
  },
  (values) => {
    const errors = {}
    if (!values.email.includes('@')) errors.email = 'Email inválido'
    if (values.password.length < 6) errors.password = 'Mínimo 6 caracteres'
    return errors
  }
)
```

---

### 10. Colores Hardcodeados

**Problema:** Color de marca (#FF4B3E) repetido en código

**Solución:** Centralizar en archivo de constantes

```javascript
// Frontend/src/constants/colors.js
export const COLORS = {
  PRIMARY: '#FF4B3E',      // Rojo AppiFood
  PRIMARY_DARK: '#e03a2d',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  // ...
}

// Frontend/src/constants/index.js
export * from './colors'
export * from './endpoints'
export * from './messages'

// Uso
import { COLORS } from '../constants'

const style = {
  background: COLORS.PRIMARY,
  color: COLORS.GRAY_100
}
```

O directamente en Tailwind config (ya está hecho):
```javascript
// tailwind.config.js
theme: {
  colors: {
    brand: '#FF4B3E',      // Ya disponible como bg-brand, text-brand, etc
    'brand-dark': '#e03a2d'
  }
}

// Uso en JSX
<button className="bg-brand hover:bg-brand-dark">
```

---

## ✅ ACCIONES RECOMENDADAS POR PRIORIDAD

### FASE 1 - Semana 1-2 (Urgente)

- [ ] Agregar `React.memo()` a ProductCard.jsx y RestaurantCard.jsx
- [ ] Consolidar `useImageLoader` en useImages.js
- [ ] Eliminar duplicidad `fetchOrder` vs `fetchOrderById` en orderStore.js
- [ ] Remover props drilling de Header (usar useAuthStore)

### FASE 2 - Semana 3-4 (Importante)

- [ ] Crear hook `useCarousel()` y refactorizar Home.jsx
- [ ] Dividir AdminDashboard.jsx en componentes (completar gradualment)
- [ ] Centralizar error handling en responseHandler.js
- [ ] Crear hook `useFormValidation()` para formularios

### FASE 3 - Semana 5-6 (Nice to have)

- [ ] Dividir RestaurantDashboard.jsx en tabs/secciones
- [ ] Refactorizar CartSidebar en sub-componentes
- [ ] Crear archivo de constantes globales
- [ ] Implementar error boundary global

---

## 📋 CHECKLIST DE REFACTORIZACIÓN

```
Frontend - Estado de Refactorización
[ ] ProductCard con React.memo
[ ] RestaurantCard con React.memo
[ ] useImageLoader consolidado
[ ] orderStore sin duplicidad
[ ] Header sin props drilling
[ ] useCarousel hook implementado
[ ] AdminDashboard dividido
[ ] Validación centralizada
[ ] Error handling consistente
[ ] Archivo de constantes
```

---

## 📝 Notas Importantes

1. **No romper código**: Todos los cambios deben ser completamente compatibles hacia atrás
2. **Testing**: Después de refactorizar, probar manualmente en navegador
3. **Gradual**: No hacer todo de una vez, hacer cambios pequeños y probados
4. **Git**: Cada refactorización en un commit separado
5. **Performance**: Medir impacto con React DevTools Profiler

---

## 🔗 Referencias

- React Performance: https://react.dev/reference/react/memo
- Custom Hooks: https://react.dev/reference/react/useReducer
- Zustand Best Practices: https://github.com/pmndrs/zustand
- Tailwind Color Customization: https://tailwindcss.com/docs/customizing-colors

