# Contexto Completo del Proyecto para DeepSeek - i18n Completación AppiFood v10

## 🚀 Resumen del Proyecto
**AppiFood**: Delivery app full-stack  
- **Backend**: Laravel API (models completos: Restaurant, Order, User, etc.)  
- **Frontend**: React 18 + Vite + Tailwind + i18next (ES/EN)  
- **Directorio actual**: `c:/Users/Adso/Desktop/ADSO/2.1 Backend/AppiFood-Web/Delivery_AppiFood_v10`  
- **Estado**: 92% completo, i18n parcial funcionando  

**VSCode actual**:  
```
Visible: Frontend/src/pages/Restaurants.jsx  
Abiertas: Login.jsx, Register.jsx, Restaurants.jsx
```

## 🌐 i18n Setup Actual (Funciona perfecto)
```
✅ src/i18n.js: i18next + LanguageDetector + ES/EN  
✅ src/components/LanguageSwitcher.jsx: Header ES|EN switcher  
✅ locales/es/translation.json: Completo (50+ keys)  
✅ locales/en/translation.json: Parcial (login/register/restaurants OK)  
✅ Login/Register/Restaurants: 90% i18n listos
```

**JSONs actuales** (extracto):
```
ES: {"login":{"title":"Ingresa a AppiFood",...}, "register":{}, "restaurants":{}}
EN: {"login":{"title":"Log in to AppiFood",...}, "register":{}, "restaurants":{}}
```

## 🎯 Objetivo: i18n 100% en TODAS las páginas/components
**Para cada archivo**:
1. `import { useTranslation } from 'react-i18next'`  
2. `const { t } = useTranslation()`  
3. **Todos** textos hardcodeados → `{t('namespace.key')}`

## 📋 Formato EXACTO de Instrucciones (Como Claude)
```
Paso X — NombreArchivo.jsx
Agrega import/hook si falta. Reemplaza:

// Español hardcodeado
Texto1 → {t('namespace.key1')}

// Texto2  
Texto2 → {t('namespace.key2')}

Lista COMPLETA de todos los textos en el archivo.
```

## 🗂️ Inventario Completo de Archivos (18 páginas + components)
```
**Páginas CRÍTICAS (Prioridad alta)**:
├── Login.jsx, Register.jsx, Restaurants.jsx ✅ 90% i18n
├── Header.jsx 🔴 Textos hardcodeados (URGENTE)
├── Home.jsx, Cart.jsx, Profile.jsx
├── Orders.jsx, Favorites.jsx, Checkout.jsx
├── AdminDashboard.jsx, RestaurantDashboard.jsx
└── ... (AddressForm, Subscription, etc.)

**Components clave**:
├── NavDrawer.jsx (NAV_LINKS array completo)
├── Footer.jsx
├── ProductCard.jsx, RestaurantCard.jsx
└── LanguageSwitcher.jsx ✅ OK
```

## 🔍 Textos Hardcodeados Detectados (search_files resultados)
```
Header.jsx:
- "¿Deseas algo en especial?"
- "Iniciar Sesión", "Registrarse", "Registrarse gratis" 
- NAV_LINKS: "Inicio", "Restaurantes", "Mis pedidos", "Cerrar sesión"

Restaurants.jsx (faltan):
- Badges: "Abierto", "Cerrado" (aparecen 2x)
- "LOS MÁS POPULARES", "TODOS LOS RESTAURANTES"

AdminDashboard.jsx:
- "Restaurantes", "Usuarios", "Restaurantes Activos"

Cart.jsx:
- "Explorar Restaurantes"

NavDrawer.jsx:
- Todos NAV_LINKS labels
```

## 📄 EJEMPLO COMPLETO: Header.jsx (Primer archivo a procesar)
```
Paso 1 — Header.jsx
Agrega import/hook. Reemplaza:

// Buscador
"¿Deseas algo en especial?" → {t('header.search_placeholder')}

// No auth buttons
"Iniciar Sesión" → {t('nav.login')}
"Registrarse" → {t('nav.register')}
"Registrarse gratis" → {t('nav.register_free')}

// User dropdown
"Mi perfil" → {t('nav.profile')}
"Mis pedidos" → {t('nav.orders')}
"Favoritos" → {t('nav.favorites')}
"Cerrar sesión" → {t('nav.logout')}

// NAV_LINKS array (20+ items)
label:'Inicio' → label: t('nav.home') ? NO → Extraer a const dinámico
label:'Restaurantes' → t('nav.restaurants')
... (todos)
```

## 🆕 Keys para locales/en/translation.json
```
Agregar estas keys (traducciones listas):

"header": {
  "search_placeholder": "What do you feel like eating?"
},
"nav": {
  "home": "Home",
  "restaurants": "Restaurants", 
  "fast_foods": "Popular Fast Foods",
  "profile": "My Profile",
  "orders": "My Orders",
  "favorites": "Favorites",
  "logout": "Log out",
  "register_free": "Sign up for free"
}
```

## ✅ Archivos YA i18n (No tocar)
```
✅ Login.jsx: t('login.title'), t('login.submit'), etc. (10+ keys)
✅ Register.jsx: t('register.name'), t('register.submit'), etc.
✅ Restaurants.jsx: t('restaurants.title'), etc. (90%)
✅ LanguageSwitcher.jsx: Funciona
```

## 🚀 Comandos de Testing
```bash
cd Frontend && npm run dev
# 1. Cambiar ES|EN en Header
# 2. Verificar TODOS textos traducidos
# 3. Probar navegación
```

## 📋 Plan de Trabajo Secuencial para DeepSeek
```
1. Header.jsx (prioridad #1 - impacta toda app)
2. Restaurants.jsx (completar badges)
3. Home.jsx + Cart.jsx  
4. NavDrawer.jsx (NAV_LINKS)
5. Profile.jsx + Orders.jsx
6. Actualizar en/translation.json
7. Test completo ES/EN switch
```

**¡COPIA ESTE ARCHIVO COMPLETO A DEEPSEEK!**  
Contiene **estructura exacta**, **todos los archivos**, **formato Claude**, **keys listas**.

**Archivo creado**: `i18n_completion_context.md` (en directorio actual)

