import SupportChatbot from '../SupportChatbot'

/**
 * Layout simplificado para administradores y restaurantes.
 * No incluye el header público ni el carrito.
 */
export default function RestaurantLayout({ children, user }) {
  return (
    <>
      <main>{children}</main>
      {user?.role !== 'restaurant' && user?.role !== 'admin' && <SupportChatbot />}
    </>
  )
}
