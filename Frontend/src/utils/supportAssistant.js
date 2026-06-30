// Archivo: src/utils/supportAssistant.js | Comentario: logica de soporte simplificada y mejorada.
/**
 * Asistente de soporte en el frontend (Fallback local fuera de línea)
 * Responde de manera básica si la API de IA no está disponible.
 */
export function getAssistantReply(text = '') {
  text = text.toLowerCase()

  const rules = [
    {
      test: /(soporte|ayuda|agente|humano|persona|ticket|chatear con soporte)/,
      reply: 'Si necesitas hablar con un agente humano o crear un ticket de soporte personalizado, puedes ir a nuestra sección de soporte técnico.',
      action: { label: 'Ir a soporte técnico', path: '/support' },
    },
    {
      test: /(pago|metodo|tarjeta|nequi|pse|efecty|dinero)/,
      reply: 'Aceptamos tarjetas de crédito/débito, PSE, Nequi y Efecty a través de Rapyd. Puedes configurar tus métodos de pago guardados desde tu perfil.',
      action: { label: 'Mis métodos de pago', path: '/user/profile' },
    },
    {
      test: /(reembolso|devolucion|devolución|cancelar|cancelacion|cancelación)/,
      reply: 'Si necesitas cancelar una orden, entra al detalle desde Mis pedidos. Si el pago ya fue confirmado, revisa primero las condiciones del restaurante.',
      action: { label: 'Revisar pedidos', path: '/user/orders' },
    },
    {
      test: /(horario|abierto|cerrado|delivery|entrega|tiempo de entrega|cobertura)/,
      reply: 'Puedes revisar el tiempo de entrega y la información del restaurante en su página. Si tienes dudas de cobertura, usa el buscador o consulta el restaurante directamente.',
      action: { label: 'Ver restaurantes', path: '/restaurants' },
    },
    {
      test: /(cupon|cupón|promocion|promoción|descuento|beneficio)/,
      reply: 'Las promociones y cupones se pueden consultar desde la app y el carrito. Si tienes uno válido, aplícalo antes de pagar.',
      action: { label: 'Ver ofertas del día', path: '/offers' },
    },
  ]

  const matched = rules.find((rule) => rule.test.test(text))
  if (matched) return matched

  return {
    reply: 'Hola. Soy el Asistente Virtual de AppiFood. ¿En qué puedo ayudarte hoy? Puedes preguntarme sobre tus pedidos, pagos, cupones o si necesitas ir a soporte técnico escribe "soporte".',
    action: null, // Ya no manda botón de soporte por defecto
  }
}

export const supportShortcuts = [
  '¿Cómo realizo un pedido?',
  '¿Qué métodos de pago aceptan?',
  '¿Cómo puedo aplicar un cupón?',
  '¿Cómo contacto a soporte técnico?',
]

export const supportFaqs = [
  {
    category: 'Pedidos y pagos',
    items: [
      {
        question: '¿Cómo realizo un pedido?',
        answer: 'Selecciona un restaurante, elige los productos que deseas, agrégalos al carrito y completa el proceso de pago. Asegúrate de tener una dirección de entrega guardada en tu perfil.',
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos pagos mediante PSE, Nequi, Efecty y tarjetas débito/crédito (Visa, Mastercard, Amex) a través de la plataforma segura Rapyd.',
      },
      {
        question: '¿Puedo cancelar un pedido?',
        answer: 'Puedes cancelar un pedido mientras esté en estado "Pendiente". Una vez que el restaurante lo acepte, ya no es posible cancelarlo desde la app.',
      },
      {
        question: '¿Cómo aplico un cupón de descuento?',
        answer: 'En el carrito de compras encontrarás un campo para ingresar tu código de cupón. Ingrésalo antes de confirmar el pago y el descuento se aplicará automáticamente.',
      },
    ],
  },
  {
    category: 'Cuenta y direcciones',
    items: [
      {
        question: '¿Cómo actualizo mi dirección de entrega?',
        answer: 'Ve a tu perfil, selecciona "Mis direcciones" y podrás agregar, editar o eliminar direcciones de entrega. También puedes hacerlo directamente al momento de hacer un pedido.',
      },
      {
        question: '¿Cómo cambio mi contraseña?',
        answer: 'En tu perfil de usuario, ve a "Seguridad" y selecciona "Cambiar contraseña". También puedes usar la opción "¿Olvidaste tu contraseña?" desde la pantalla de inicio de sesión.',
      },
      {
        question: '¿Cómo funciona el club de fidelidad?',
        answer: 'Ganas puntos con cada pedido completado. Los puntos acumulados pueden canjearse por descuentos en tus próximas compras. Consulta tu saldo de puntos en tu perfil.',
      },
    ],
  },
  {
    category: 'Restaurantes y menú',
    items: [
      {
        question: '¿Por qué no encuentro un restaurante específico?',
        answer: 'Asegúrate de que el restaurante esté activo y dentro de tu zona de cobertura. Algunos restaurantes tienen horarios de atención limitados.',
      },
      {
        question: '¿Cómo sé cuánto tiempo tardará mi pedido?',
        answer: 'El tiempo estimado de entrega se muestra en la página del restaurante y también en el detalle de tu pedido una vez confirmado. Puedes rastrear tu pedido en tiempo real.',
      },
    ],
  },
  {
    category: 'Suscripción y beneficios',
    items: [
      {
        question: '¿Qué incluye la suscripción Premium?',
        answer: 'Con la suscripción Premium obtienes envíos gratis, descuentos exclusivos, acceso prioritario a ofertas del día y soporte técnico preferencial.',
      },
      {
        question: '¿Cómo cancelo mi suscripción?',
        answer: 'Ve a tu perfil, selecciona "Suscripción" y podrás gestionar o cancelar tu plan en cualquier momento. La cancelación es efectiva al final del período actual.',
      },
    ],
  },
]

