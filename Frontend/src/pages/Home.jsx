
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useHomeData } from '../hooks/useHomeData'
import HeroCarousel from '../components/Home/HeroCarousel'
import PopularRestaurants from '../components/Home/PopularRestaurants'
import CouponCarousel from '../components/Home/CouponCarousel'
import FeaturedProducts from '../components/Home/FeaturedProducts'
import ProductModal from '../components/ProductModal'
import Footer from '../components/Footer'
import { fetchJson } from '../api/fetchJson'
import { COUPONS as STATIC_COUPONS } from '../data/coupons'
import './Home.css'

export default function Home({ isAuth }) {
  const { t } = useTranslation()
  const [coupons, setCoupons] = useState([])

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetchJson('/api/coupons')
        const list = Array.isArray(response) ? response : response?.data || []
        setCoupons(list.length > 0 ? list : STATIC_COUPONS)
      } catch (err) {
        console.error('Error fetching coupons for home:', err)
        setCoupons(STATIC_COUPONS)
      }
    }
    loadCoupons()
  }, [])

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
      title: 'SABORES URBANOS\nBURGER GOURMET',
      subtitle: '100% Carne Premium Ahumada',
      price: 24900,
      discount: 20,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=800&fit=crop',
    },
    {
      title: 'AUTÉNTICA ARTESANÍA\nPIZZA A LA LEÑA',
      subtitle: 'Mozzarella fresca y bordes crujientes',
      price: 28900,
      discount: 15,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=800&fit=crop',
    },
    {
      title: 'ARTE JAPONÉS\nROLLS PREMIUM SET',
      subtitle: 'Salmón fresco y cortes de autor',
      price: 32000,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=1200&h=800&fit=crop',
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
      <CouponCarousel coupons={coupons} />

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