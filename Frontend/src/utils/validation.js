/**
 * Archivo: src/utils/validation.js
 * Utilidades de validación para campos de entrada del usuario.
 */

/**
 * Valida si un nombre contiene únicamente letras, espacios y caracteres acentuados.
 * No permite números, guiones, guiones bajos ni caracteres especiales.
 * @param {string} name - El nombre a validar.
 * @returns {boolean} - true si es válido, false de lo contrario.
 */
export const isValidName = (name) => {
  if (!name) return true;
  // Solo letras (con acentos/eñes) y espacios
  const nameRegex = /^[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ\s]+$/;
  return nameRegex.test(name);
};
