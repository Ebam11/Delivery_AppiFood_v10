import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import RestaurantCard from '../components/RestaurantCard'
import { useAuthStore } from '../store/authStore'
import { api } from '../api/client'

const normalizeRestaurant = (restaurant) => ({
  ...restaurant,
  img: restaurant.banner || restaurant.logo || restaurant.image || '',
  rating: restaurant.average_rating ?? restaurant.rating ?? 4.5,
  time: restaurant.delivery_time_min && restaurant.delivery_time_max
    ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max} min`
    : restaurant.delivery_time_min
      ? `${restaurant.delivery_time_min} min`
      : '-- min',
  delivery: Number(restaurant.delivery_cost ?? restaurant.delivery ?? 0),
  categories: Array.isArray(restaurant.categories) ? restaurant.categories : [],
  menu_categories: Array.isArray(restaurant.menu_categories) ? restaurant.menu_categories : [],
})

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { token } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    const loadFavorites = async () => {
      if (!token) {
        navigate('/login')
        return
      }

      try {
        setLoading(true)
        const response = await api.get('/favorites', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const rawFavorites = response.data?.data || []
        setFavorites(rawFavorites.map(normalizeRestaurant))
        setError(null)
      } catch (err) {
        setError('No se pudieron cargar tus favoritos.')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [token, navigate])

  const totalFavorites = useMemo(() => favorites.length, [favorites])

  const handleRestaurantSelect = (restaurant) => {
    navigate(`/restaurants/${restaurant.id}`)
  }

  const handleFavoriteToggle = async (restaurantId) => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      await api.post(
        '/favorites/toggle',
        { restaurant_id: restaurantId },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setFavorites((prev) => prev.filter((restaurant) => restaurant.id !== restaurantId))
    } catch (err) {
      setError('No se pudo actualizar el favorito.')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f8f8] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-24">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF4B3E] border-t-transparent" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#f9fafb] py-10">
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-[#FF4B3E]">
              Tu coleccion
            </p>
            <h1 className="text-3xl font-black text-[#171717] sm:text-4xl">
              Mis Restaurantes Favoritos
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {totalFavorites} {totalFavorites === 1 ? 'restaurante guardado' : 'restaurantes guardados'}
            </p>
          </div>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 rounded-xl border border-[#ffd8d3] bg-white px-4 py-2.5 text-sm font-bold text-[#FF4B3E] transition hover:border-[#FF4B3E]"
          >
            <i className="fas fa-compass" /> Explorar mas
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {favorites.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {favorites.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onSelect={handleRestaurantSelect}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#ffd8d3] bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff1ef] text-[#FF4B3E]">
              <i className="fas fa-heart text-xl" />
            </div>
            <h2 className="mb-2 text-xl font-black text-[#1f1f1f]">Aun no tienes favoritos</h2>
            <p className="mx-auto mb-6 max-w-md text-sm text-gray-600">
              Guarda restaurantes desde Home o Restaurantes para encontrarlos rapido aqui.
            </p>
            <button
              onClick={() => navigate('/restaurants')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#FF4B3E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e03a2d]"
            >
              <i className="fas fa-store" /> Descubrir Restaurantes
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
