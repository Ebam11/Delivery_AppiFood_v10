// Archivo: src/components/FoodCategoryCarousel.jsx | Comentario: logica principal del modulo.
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next';

const CATEGORY_THEME = {
  'Restaurantes Locales': { icon: '🍽️', color: '#FF8A3D' },
  'Comida Casera': { icon: '🥘', color: '#CC8B4A' },
  'Sopas y Caldos': { icon: '🍲', color: '#F29F4B' },
  'Antojitos Payaneses': { icon: '🥙', color: '#E6B93C' },
  'Empanadas y Fritos': { icon: '🥟', color: '#E7A03E' },
  Tamales: { icon: '🌽', color: '#C89D4C' },
  Hamburguesas: { icon: '🍔', color: '#FF8A3D' },
  Pizza: { icon: '🍕', color: '#E04D4D' },
  Sushi: { icon: '🍣', color: '#5F8DF2' },
  Japonesa: { icon: '🍱', color: '#5F8DF2' },
  Italiana: { icon: '🍝', color: '#E25F4B' },
  Mexicana: { icon: '🌮', color: '#F0A83D' },
  Saludable: { icon: '🥗', color: '#44B36C' },
  'Panadería y Postres': { icon: '🥧', color: '#E77DA7' },
  'Bebidas Tradicionales': { icon: '🧋', color: '#4D90FF' },
}

const DEFAULT_CATEGORIES = [
  'Restaurantes Locales',
  'Comida Casera',
  'Sopas y Caldos',
  'Antojitos Payaneses',
  'Empanadas y Fritos',
  'Tamales',
  'Hamburguesas',
  'Pizza',
  'Sushi',
  'Japonesa',
  'Italiana',
  'Mexicana',
  'Saludable',
  'Panadería y Postres',
  'Bebidas Tradicionales',
]

export default function FoodCategoryCarousel({ onSelectCategory, selectedCategory, categories = DEFAULT_CATEGORIES }) {
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const dragRef = useRef({ isDragging: false, startX: 0, scrollLeft: 0, moved: false })
  const [isDragging, setIsDragging] = useState(false)

  const foodCategories = categories.map((name) => {
    const theme = CATEGORY_THEME[name] || { icon: '🍽️', color: '#8884FF' }
    return {
      id: name,
      name,
      icon: theme.icon,
      color: theme.color,
    }
  })

  const handlePointerDown = (e) => {
    if (!containerRef.current || e.button !== 0) return

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      scrollLeft: containerRef.current.scrollLeft,
      moved: false,
    }
    setIsDragging(true)
    containerRef.current.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (!containerRef.current || !dragRef.current.isDragging) return

    const walk = e.clientX - dragRef.current.startX

    if (Math.abs(walk) > 5) {
      dragRef.current.moved = true
    }

    containerRef.current.scrollLeft = dragRef.current.scrollLeft - walk
  }

  const handlePointerUp = (e) => {
    dragRef.current.isDragging = false
    containerRef.current?.releasePointerCapture?.(e.pointerId)

    window.setTimeout(() => {
      setIsDragging(false)
      dragRef.current.moved = false
    }, 0)
  }

  const handleCategoryClick = (categoryId) => {
    if (dragRef.current.moved) return
    onSelectCategory(categoryId)
  }

  return (
    <div className="component-food-category-carousel relative w-full mb-8">
      {/* Carousel Container */}
      <div
        id="category-carousel"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`flex gap-6 overflow-x-auto scroll-smooth pt-4 pb-8 px-11 md:px-12 transition-all ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          userSelect: isDragging ? 'none' : 'auto',
          touchAction: 'pan-y',
        }}
      >
        <style>{`#category-carousel::-webkit-scrollbar { display: none; }`}</style>

        {foodCategories.map((category) => {
          const isSelected = selectedCategory === category.id
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategoryClick(category.id)}
              className={`flex-shrink-0 transition-all duration-300 ${
                isSelected ? 'scale-105' : 'hover:scale-102'
              }`}
            >
              <div
                className={`w-28 h-28 rounded-3xl transition-all cursor-pointer flex flex-col items-center justify-center p-4 relative group ${
                  isSelected 
                    ? 'text-white' 
                    : 'text-gray-700 dark:text-slate-350 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/60 shadow-sm'
                }`}
                style={{
                  background: isSelected 
                    ? 'linear-gradient(135deg, #FF4B3E 0%, #FF6B5C 100%)' 
                    : undefined,
                  borderColor: isSelected ? '#FF4B3E' : undefined,
                  boxShadow: isSelected 
                    ? '0 12px 20px rgba(255, 75, 62, 0.25)' 
                    : undefined,
                  transform: isSelected
                    ? 'translateY(-2px)'
                    : 'translateY(0)',
                }}
              >
                <div
                  className="text-4xl mb-2 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    filter: isSelected ? 'drop-shadow(0 4px 6px rgba(255,255,255,0.2))' : 'none',
                  }}
                >
                  {category.icon}
                </div>

                <span
                  className={`text-[10px] font-black text-center leading-tight tracking-wide ${
                    isSelected ? 'text-white' : 'text-gray-600 dark:text-slate-300'
                  }`}
                >
                  {t(`foodCarousel.categories.${category.name}`, { defaultValue: category.name })}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}