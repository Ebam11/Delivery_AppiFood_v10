// Archivo: src/components/FoodCategoryCarousel.jsx | Comentario: logica principal del modulo.
import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

export default function FoodCategoryCarousel({ onSelectCategory, selectedCategory }) {
  const { t } = useTranslation()
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const FOOD_CATEGORIES = [
    { id: 'burger',    name: t('foodCarousel.burger'),    icon: '🍔', color: '#FFB84D' },
    { id: 'pizza',     name: t('foodCarousel.pizza'),     icon: '🍕', color: '#FF6B6B' },
    { id: 'sushi',     name: t('foodCarousel.sushi'),     icon: '🍣', color: '#4ECDC4' },
    { id: 'tacos',     name: t('foodCarousel.tacos'),     icon: '🌮', color: '#FFD93D' },
    { id: 'asian',     name: t('foodCarousel.asian'),     icon: '🍜', color: '#6C5CE7' },
    { id: 'dessert',   name: t('foodCarousel.dessert'),   icon: '🍰', color: '#FD79A8' },
    { id: 'vegan',     name: t('foodCarousel.vegan'),     icon: '🥗', color: '#55EFC4' },
    { id: 'seafood',   name: t('foodCarousel.seafood'),   icon: '🦞', color: '#74B9FF' },
    { id: 'chicken',   name: t('foodCarousel.chicken'),   icon: '🍗', color: '#FFA502' },
    { id: 'coffee',    name: t('foodCarousel.coffee'),    icon: '☕', color: '#8B6F47' },
    { id: 'drinks',    name: t('foodCarousel.drinks'),    icon: '🥤', color: '#FF69B4' },
    { id: 'breakfast', name: t('foodCarousel.breakfast'), icon: '🍳', color: '#FFD700' },
  ]

  const handleMouseDown = (e) => {
    if (!containerRef.current) return
    setIsDragging(true)
    setStartX(e.clientX)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseMove = (e) => {
    if (e.buttons !== 1 || !isDragging || !containerRef.current) return
    const walk = e.clientX - startX
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => setIsDragging(false)
  const handleMouseLeave = () => setIsDragging(false)

  return (
    <div className="relative w-full mb-8">
      {/* Carousel Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        className={`flex gap-6 overflow-x-auto scroll-smooth pt-4 pb-8 px-11 md:px-12 transition-all ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          scrollBehavior: 'smooth',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        <style>{`#category-carousel::-webkit-scrollbar { display: none; }`}</style>

        {FOOD_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            onMouseDown={(e) => e.stopPropagation()}
            className={`flex-shrink-0 transition-all duration-300 ${
              selectedCategory === category.id ? 'scale-110' : 'hover:scale-105'
            }`}
          >
            <div
              className="w-28 h-28 rounded-full hover:shadow-xl transition-all cursor-pointer flex flex-col items-center justify-center p-4 relative group"
              style={{
                background: `linear-gradient(135deg, ${category.color}20 0%, ${category.color}40 100%)`,
                border: `2px solid ${selectedCategory === category.id ? category.color : 'transparent'}`,
                transform: selectedCategory === category.id
                  ? 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'
                  : 'perspective(1000px) rotateX(0deg)',
                filter: `drop-shadow(0 4px 12px ${category.color}40)`,
              }}
            >
              <div
                className="text-5xl mb-1 transition-transform duration-300 group-hover:scale-125"
                style={{ filter: `drop-shadow(0 3px 6px ${category.color}60)` }}
              >
                {category.icon}
              </div>

              <span
                className="text-xs font-bold text-center leading-tight"
                style={{ color: category.color }}
              >
                {category.name}
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

      {/* Clear Selection */}
      {selectedCategory && (
        <button
          onClick={() => onSelectCategory(null)}
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold text-[#FF4B3E] hover:text-[#e03a2d] transition"
        >
          {t('foodCarousel.clearFilter')}
        </button>
      )}
    </div>
  )
}