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
  const itemRefs = useRef({})
  const [mousePos, setMousePos] = useState({ x: null, y: null })
  const [isHovered, setIsHovered] = useState(false)

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
    // Si arrastra el mouse, actualizar posición del mouse para la lupa también
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

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

  // Lógica del efecto macOS Dock Magnification
  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setMousePos({ x: null, y: null })
  }

  const getScaleAndMargin = (catId) => {
    const el = itemRefs.current[catId]
    if (!el || !isHovered || mousePos.x === null) return { scale: 1, margin: 0 }

    const rect = el.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    const itemCenterX = rect.left - containerRect.left + rect.width / 2

    const distance = Math.abs(mousePos.x - itemCenterX)
    const maxDistance = 140

    if (distance < maxDistance) {
      const factor = Math.cos((distance / maxDistance) * (Math.PI / 2))
      const scale = 1 + factor * 0.22 // Escala de magnificación ideal
      const margin = factor * 6 // Espacio dinámico para que no colisionen
      return { scale, margin }
    }

    return { scale: 1, margin: 0 }
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
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
          const { scale, margin } = getScaleAndMargin(category.id)
          return (
            <div
              key={category.id}
              ref={(el) => { itemRefs.current[category.id] = el }}
              className="flex-shrink-0 transition-all duration-150 ease-out"
              style={{
                transform: `scale(${scale})`,
                marginLeft: `${margin}px`,
                marginRight: `${margin}px`,
                transformOrigin: 'bottom center', // Efecto dock
              }}
            >
              <button
                type="button"
                onClick={() => handleCategoryClick(category.id)}
                className={`transition-all duration-300`}
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
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}