const getDefaultApiUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost/delivery-appifood/Backend/public/api';
  }
  return '/api';
};

/* VITE_API_URL siempre tiene prioridad
export const API_URL = import.meta.env.VITE_API_URL || getDefaultApiUrl();*/

//temporal
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';