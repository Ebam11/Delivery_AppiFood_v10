
import { useTranslation } from 'react-i18next'
import { useHomeData } from '../hooks/useHomeData'
import HeroCarousel from '../components/Home/HeroCarousel'
import PopularRestaurants from '../components/Home/PopularRestaurants'
import CouponCarousel from '../components/Home/CouponCarousel'
import FeaturedProducts from '../components/Home/FeaturedProducts'
import ProductModal from '../components/ProductModal'
import Footer from '../components/Footer'
import { COUPONS } from '../data/coupons'
import './Home.css'

export default function Home({ isAuth }) {
  const { t } = useTranslation()
  const {
    popularRestaurants,
    loadingRestaurants,
    featuredProducts,
    loadingProducts,
    heroIdx,
    setHeroIdx,
    modal,
    setModal,
    handleRestaurantSelect,
    handleFavoriteToggle,
    isFavorite
  } = useHomeData()

  const heroSlides = [
    {
      title: t('hero.slide1.title') || 'HOT SPICY\nCHICKEN BURGER',
      subtitle: t('hero.slide1.subtitle') || 'Crujiente, cada bocado sabe',
      price: 30000,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=1200&h=800&fit=crop',
    },
    {
      title: t('hero.slide2.title') || 'CHICAGO DEEP\nPIZZA',
      subtitle: t('hero.slide2.subtitle') || 'Clásica y deliciosa',
      price: 22000,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=1200&h=800&fit=crop',
    },
    {
      title: t('hero.slide3.title') || 'SUSHI PREMIUM\nSET',
      subtitle: t('hero.slide3.subtitle') || 'Fresco del día',
      price: 45000,
      discount: 15,
      image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=800&fit=crop',
    },
  ]

  const stats = {
    restaurants: '50+',
    avg_delivery: '25 min',
    avg_rating: '4.8'
  }

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen text-gray-900 dark:text-slate-100 transition-colors duration-300">
      {/* 1. Hero / Bienvenida */}
      <HeroCarousel 
        slides={heroSlides} 
        currentIndex={heroIdx} 
        onIndexChange={setHeroIdx} 
        stats={stats}
      />

      {/* 2. Cupones de Descuento */}
      <CouponCarousel coupons={COUPONS} />

      {/* 3. Restaurantes Populares */}
      <PopularRestaurants 
        restaurants={popularRestaurants} 
        loading={loadingRestaurants} 
        onSelect={handleRestaurantSelect}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* 4. Ofertas y Productos Destacados */}
      <FeaturedProducts 
        products={featuredProducts} 
        loading={loadingProducts}
        onSelectProduct={setModal}
        isFavorite={isFavorite}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* 5. Pie de Página */}
      <Footer />

      {/* Modales Globales */}
      {modal && (
        <ProductModal 
          product={modal} 
          onClose={() => setModal(null)} 
        />
      )}
    </div>
  )
}