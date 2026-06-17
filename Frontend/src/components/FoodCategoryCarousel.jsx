// Archivo: src/components/FoodCategoryCarousel.jsx | Comentario: logica principal del modulo.
import { useState, useRef } from 'react'
import { useTranslate as useTranslation } from '../hooks/useTranslate';

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

    if (e.target instanceof Element && e.target.closest('button')) {
      return
    }

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

        {foodCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleCategoryClick(category.id)}
            className={`flex-shrink-0 transition-all duration-300 ${
              selectedCategory === category.id ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            <div
              className="w-28 h-28 rounded-[30px] hover:shadow-xl transition-all cursor-pointer flex flex-col items-center justify-center p-4 relative group"
              style={{
                background: `linear-gradient(150deg, ${category.color}25 0%, ${category.color}55 65%, ${category.color}35 100%)`,
                border: `2px solid ${selectedCategory === category.id ? category.color : 'transparent'}`,
                transform: selectedCategory === category.id
                  ? 'perspective(1200px) rotateY(-10deg) rotateX(12deg) translateZ(8px)'
                  : 'perspective(1200px) rotateY(-6deg) rotateX(8deg) translateZ(0)',
                boxShadow: `0 16px 24px ${category.color}35, inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -8px 14px rgba(0,0,0,0.08)`,
                transformStyle: 'preserve-3d',
              }}
            >
              <div
                className="absolute inset-x-4 -bottom-2 h-3 rounded-full opacity-45 blur-sm"
                style={{ background: category.color }}
              />

              <div
                className="text-5xl mb-1 transition-transform duration-300 group-hover:scale-125"
                style={{
                  filter: `drop-shadow(0 7px 10px ${category.color}70)`,
                  transform: 'translateZ(24px)',
                }}
              >
                {category.icon}
              </div>

              <span
                className="text-xs font-bold text-center leading-tight text-gray-800 dark:text-slate-200"
                style={{ transform: 'translateZ(14px)' }}
              >
                {t(`foodCarousel.categories.${category.name}`, { defaultValue: category.name })}
              </span>

              <div
                className="absolute top-0 left-0 w-1/3 h-1/2 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, white, transparent)', pointerEvents: 'none' }}
              />

              {selectedCategory === category.id && (
                <div
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}