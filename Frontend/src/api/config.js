const getDefaultApiUrl = () => {
  // En entorno local con XAMPP, Laravel suele estar servido por Apache en /Backend/public.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost/delivery-appifood/Backend/public/api';
  }

  return '/api';
};

export const API_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();
