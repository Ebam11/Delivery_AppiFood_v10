# Guía de Nombres de Clases (Frontend)

## Objetivo
Tener nombres de clases fáciles de ubicar por pantalla y por módulo, sin romper estilos Tailwind ya existentes.

## Regla Base
- Cada vista principal debe tener una clase raíz: `page-<nombre-kebab-case>`.
- Cada componente reutilizable puede tener una clase raíz: `component-<nombre-kebab-case>`.
- Mantener clases Tailwind existentes y agregar la clase semántica al inicio.

## Convención
- Páginas: `page-checkout`, `page-cart`, `page-orders`, `page-profile`, `page-admin-dashboard`, `page-restaurant-dashboard`.
- Componentes: `component-cart-sidebar`, `component-header`, etc.
- Secciones internas opcionales: `section-<nombre>`.
- Bloques de formulario opcionales: `form-<nombre>`.

## Estado actual aplicado
- `Checkout`: `page-checkout`
- `Cart`: `page-cart`
- `Orders`: `page-orders`
- `Profile`: `page-profile`
- `AdminDashboard`: `page-admin-dashboard`
- `RestaurantDashboard`: `page-restaurant-dashboard`
- `Favorites`: `page-favorites`
- `Addresses`: `page-addresses`
- `AddressForm`: `page-address-form`

## Cobertura actual de componentes (auditoria 2026-04-26)
- Componentes detectados en `Frontend/src/components`: 19
- Componentes con clase raíz `component-*`: 19
- Componentes pendientes: 0

### Componentes con clase raíz `component-*`
- `component-add-to-cart-button`
- `component-cart-sidebar`
- `component-category-nav`
- `component-error-message`
- `component-food-category-carousel`
- `component-footer`
- `component-header`
- `component-language-switcher`
- `component-loading`
- `component-nav-drawer`
- `component-nav-drawer-toggle`
- `component-notifications-tab`
- `component-payment-method-selector`
- `component-payu-checkout`
- `component-product-card`
- `component-product-modal`
- `component-restaurant-card`
- `component-subscription-payment-gateway`
- `component-subscription-tab`
- `component-support-chatbot`

## Cobertura actual (auditoria 2026-04-26)
- Páginas detectadas en `Frontend/src/pages`: 24
- Páginas con clase raíz `page-*`: 9
- Páginas pendientes: 15

### Páginas pendientes de clase raíz `page-*`
- `Coupons.jsx`
- `ForgotPassword.jsx`
- `HelpCenter.jsx`
- `Home.jsx`
- `Login.jsx`
- `OrderDetail.jsx`
- `PaymentConfirmation.jsx`
- `Register.jsx`
- `RegisterRestaurant.jsx`
- `RestaurantDetail.jsx`
- `RestaurantLogin.jsx`
- `RestaurantManagementPage.jsx`
- `Restaurants.jsx`
- `Subscription.jsx`
- `Support.jsx`

## Siguiente fase recomendada
1. Aplicar clase raíz `page-*` en las 15 páginas pendientes (sin cambiar estilos actuales).
2. Aplicar clase raíz `component-*` en `Frontend/src/components`.
3. Crear checklist de verificación visual por ruta para asegurar que no haya regresiones.
