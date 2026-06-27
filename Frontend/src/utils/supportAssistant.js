export const supportFaqs = [
  {
    category: 'Pedidos y pagos',
    items: [
      {
        question: '¿Cómo puedo rastrear mi pedido?',
        answer: 'Entra a Mis pedidos y abre la orden para ver el detalle, el estado actual y el historial de cambios.',
      },
      {
        question: '¿Qué hago si el pago falla?',
        answer: 'Vuelve al checkout o a la confirmación de pago para reintentar. Si el banco rechazó la transacción, intenta otro método.',
      },
      {
        question: '¿Puedo cancelar una orden?',
        answer: 'Si la orden todavía está en proceso, entra al detalle de la orden y usa la opción de cancelar.',
      },
    ],
  },
  {
    category: 'Cuenta y direcciones',
    items: [
      {
        question: '¿Puedo cambiar mi dirección de entrega?',
        answer: 'Sí. Desde el selector de dirección en el encabezado puedes crear, editar y marcar una dirección principal antes de pagar.',
      },
      {
        question: '¿Cómo cambio mis datos de perfil?',
        answer: 'Ve a Mi perfil para actualizar nombre, correo, contraseña y otros datos de la cuenta.',
      },
      {
        question: '¿Qué pasa si olvidé mi contraseña?',
        answer: 'Usa la opción ¿Olvidaste tu contraseña? para recibir un enlace de recuperación por correo.',
      },
    ],
  },
  {
    category: 'Restaurantes y pedidos',
    items: [
      {
        question: '¿Cómo encuentro un restaurante?',
        answer: 'Usa el buscador o la página de restaurantes para filtrar por nombre, tipo de comida o lo que quieras ordenar.',
      },
      {
        question: '¿Puedo guardar restaurantes favoritos?',
        answer: 'Sí. En la sección de Favoritos puedes guardar y volver a tus restaurantes preferidos rápidamente.',
      },
      {
        question: '¿Cómo agrego productos al carrito?',
        answer: 'Abre un restaurante, revisa su menú y usa el botón Agregar al carrito para preparar tu orden.',
      },
    ],
  },
  {
    category: 'Suscripción y ayuda',
    items: [
      {
        question: '¿Dónde gestiono mi suscripción?',
        answer: 'Desde Suscripción o desde tu perfil puedes revisar el plan activo, actualizarlo o cancelarlo.',
      },
      {
        question: '¿Cómo contacto a soporte humano?',
        answer: 'Puedes usar este asistente o abrir el centro de soporte para ver accesos rápidos y preguntas frecuentes.',
      },
      {
        question: '¿Dónde veo promociones o cupones?',
        answer: 'El asistente puede orientarte sobre cupones, promociones y beneficios activos dentro de la app.',
      },
    ],
  },
]

export const supportShortcuts = [
  { label: 'Mis pedidos', path: '/user/orders', icon: 'fa-box' },
  { label: 'Mi perfil', path: '/user/profile', icon: 'fa-user' },
  { label: 'Favoritos', path: '/user/favorites', icon: 'fa-heart' },
  { label: 'Suscripción', path: '/subscription', icon: 'fa-crown' },
  { label: 'Restaurantes', path: '/restaurants', icon: 'fa-store' },
  { label: 'Soporte', path: '/support', icon: 'fa-headset' },
]

const normalize = (value = '') => value
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

export function getAssistantReply(message) {
  const text = normalize(message)

  const rules = [
    {
      test: /(pedido|orden|tracking|seguimiento|estado)/,
      reply: 'Puedes revisar tu pedido en Mis pedidos. Desde el detalle verás el estado, el historial y las acciones disponibles.',
      action: { label: 'Ver mis pedidos', path: '/user/orders' },
    },
    {
      test: /(carrito|checkout|pago|payu|tarjeta|metodo de pago|comprar)/,
      reply: 'El flujo de compra va del carrito al checkout y luego a la pasarela de pago. Si algo falla, vuelve a intentar desde la pantalla de confirmación.',
      action: { label: 'Ir al checkout', path: '/user/checkout' },
    },
    {
      test: /(direccion|direcciones|domicilio|casa|trabajo)/,
      reply: 'Desde el selector de dirección del encabezado puedes agregar, editar o eliminar direcciones y dejar una como principal.',
      action: { label: 'Abrir mi perfil', path: '/user/profile' },
    },
    {
      test: /(perfil|cuenta|nombre|correo|contraseña|login|registro|acceso)/,
      reply: 'Desde Mi perfil puedes revisar tus datos y, si no puedes entrar, usa la opción de recuperación de contraseña desde la pantalla de login.',
      action: { label: 'Abrir mi perfil', path: '/user/profile' },
    },
    {
      test: /(favorito|favoritos|corazon)/,
      reply: 'Tus restaurantes guardados están en Favoritos. Allí puedes volver al restaurante con un clic.',
      action: { label: 'Abrir favoritos', path: '/user/favorites' },
    },
    {
      test: /(suscripcion|plan|premium|cupo?n)/,
      reply: 'La suscripción te da beneficios y puedes revisarla en la página de planes o desde tu perfil.',
      action: { label: 'Ver suscripción', path: '/subscription' },
    },
    {
      test: /(restaurante|menu|menú|comida|productos|buscar|buscador)/,
      reply: 'Usa el buscador o la vista de restaurantes para encontrar locales. En cada restaurante podrás ver el menú y agregar productos al carrito.',
      action: { label: 'Explorar restaurantes', path: '/restaurants' },
    },
    {
      test: /(ayuda|soporte|humano|agente|asesor|faq|preguntas frecuentes)/,
      reply: 'Puedo ayudarte aquí mismo. Si prefieres soporte guiado, abre el centro de ayuda con preguntas frecuentes y accesos directos.',
      action: { label: 'Abrir soporte', path: '/support' },
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
      action: { label: 'Ir a soporte', path: '/support' },
    },
  ]

  const matched = rules.find((rule) => rule.test.test(text))
  if (matched) return matched

  return {
    reply: 'Hola. Soy el Asistente Virtual de AppiFood. Actualmente me encuentro en modo fuera de línea, pero puedo guiarte con consultas generales sobre tus pedidos, pagos o métodos de pago. ¿En qué puedo ayudarte específicamente?',
    action: { label: 'Ir al soporte', path: '/support' },
  }
}
