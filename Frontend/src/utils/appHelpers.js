/**
 * Utilidades y constantes para la aplicación principal.
 * Este archivo ayuda a mantener App.jsx limpio y organizado.
 */

const svgDataUri = (svg) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`

/**
 * Imágenes de fondo (Backdrop) con temática de comida en formato SVG.
 */
export const FOOD_BACKDROP_IMAGES = [
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF1E8"/><circle cx="64" cy="64" r="32" fill="#FFB36B"/><path d="M34 56c4-16 17-28 30-28s26 12 30 28H34Z" fill="#7C4A1A"/><path d="M34 72c4 16 17 28 30 28s26-12 30-28H34Z" fill="#4CAF50" opacity="0.9"/><circle cx="52" cy="62" r="4" fill="#fff"/><circle cx="76" cy="62" r="4" fill="#fff"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF6E5"/><path d="M28 70c0-20 16-36 36-36s36 16 36 36H28Z" fill="#E25A3A"/><path d="M32 72h64c0 18-14 32-32 32S32 90 32 72Z" fill="#F7C948"/><path d="M41 56c9-10 20-15 23-15s14 5 23 15" stroke="#fff" stroke-width="6" stroke-linecap="round"/><circle cx="48" cy="66" r="3.5" fill="#fff"/><circle cx="64" cy="62" r="3.5" fill="#fff"/><circle cx="79" cy="68" r="3.5" fill="#fff"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#F4FFF9"/><rect x="26" y="44" width="76" height="40" rx="20" fill="#2C6E49"/><rect x="34" y="50" width="60" height="28" rx="14" fill="#D9F99D"/><circle cx="48" cy="64" r="6" fill="#22C55E"/><circle cx="64" cy="58" r="6" fill="#F59E0B"/><circle cx="80" cy="66" r="6" fill="#EF4444"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF4F4"/><path d="M28 70h72l-8 28H36l-8-28Z" fill="#F97316"/><path d="M34 70V50h60v20" fill="#FDBA74"/><path d="M42 52l-6 18M54 52l-6 18M66 52l-6 18M78 52l-6 18" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#F3F8FF"/><rect x="30" y="52" width="68" height="24" rx="12" fill="#1F2937"/><rect x="34" y="56" width="60" height="16" rx="8" fill="#38BDF8"/><rect x="38" y="60" width="10" height="8" rx="4" fill="#fff"/><rect x="54" y="60" width="10" height="8" rx="4" fill="#fff"/><rect x="70" y="60" width="10" height="8" rx="4" fill="#fff"/></svg>`),
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="58" fill="#FFF7FB"/><circle cx="64" cy="64" r="34" fill="#F472B6"/><circle cx="64" cy="64" r="16" fill="#FFF"/><circle cx="64" cy="64" r="8" fill="#FDBA74"/></svg>`),
]

/**
 * Normaliza el rol del usuario para manejar inconsistencias entre 'customer' y 'user'.
 */
export function normalizeUserRole(rawUser) {
  if (!rawUser || typeof rawUser !== 'object') return rawUser
  const rawRole = String(rawUser.role ?? rawUser.rol ?? 'user').toLowerCase()
  const role = rawRole === 'customer' ? 'user' : rawRole
  return { ...rawUser, role }
}

/**
 * Retorna la ruta inicial basada en el rol del usuario.
 */
export function getHomePathByRole(rawUser) {
  if (!rawUser) return '/'
  const role = String(rawUser.role ?? rawUser.rol ?? 'user').toLowerCase()
  if (role === 'admin') return '/admin'
  if (role === 'restaurant') return '/restaurant/dashboard'
  if (role === 'driver') return '/driver/dashboard'
  return '/'
}
