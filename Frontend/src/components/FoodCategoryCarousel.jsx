import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useEmblaCarousel from 'embla-carousel-react'

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, containScroll: 'trimSnaps' })
  const containerRef = useRef(null)
  const itemRefs = useRef({})
  const dragStartedRef = useRef(false)
  const [mousePos, setMousePos] = useState({ x: null, y: null })
  const [isHovered, setIsHovered] = useState(false)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(true)

  const foodCategories = categories.map((name) => {
    const theme = CATEGORY_THEME[name] || { icon: '🍽️', color: '#8884FF' }
    return {
      id: name,
      name,
      icon: theme.icon,
      color: theme.color,
    }
  })

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    updateScrollButtons()
    emblaApi.on('select', updateScrollButtons)
    emblaApi.on('reInit', updateScrollButtons)
    emblaApi.on('scroll', updateScrollButtons)
    return () => {
      emblaApi.off('select', updateScrollButtons)
      emblaApi.off('reInit', updateScrollButtons)
      emblaApi.off('scroll', updateScrollButtons)
    }
  }, [emblaApi, updateScrollButtons])

  useEffect(() => {
    if (!emblaApi) return
    const onPointerDown = () => { dragStartedRef.current = false }
    const onScroll = () => { dragStartedRef.current = true }
    const onPointerUp = () => {
      window.setTimeout(() => {
        dragStartedRef.current = false
      }, 0)
    }
    emblaApi.on('pointerDown', onPointerDown)
    emblaApi.on('scroll', onScroll)
    emblaApi.on('pointerUp', onPointerUp)
    return () => {
      emblaApi.off('pointerDown', onPointerDown)
      emblaApi.off('scroll', onScroll)
      emblaApi.off('pointerUp', onPointerUp)
    }
  }, [emblaApi])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  const handleCategoryClick = useCallback((categoryId) => {
    if (dragStartedRef.current) return
    onSelectCategory(categoryId)
  }, [onSelectCategory])

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

  // Calcular la escala de cada botón basándose en la distancia horizontal al cursor
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
      const scale = 1 + factor * 0.25
      const margin = factor * 8
      return { scale, margin }
    }

    return { scale: 1, margin: 0 }
  }

  return (
    <div className="component-food-category-carousel relative w-full mb-8">
      {canScrollPrev && (
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-14 z-10 bg-gradient-to-r from-white dark:from-slate-950 to-transparent" />
      )}
      {canScrollPrev && (
        <button
          type="button"
          onClick={scrollPrev}
          aria-label={t('foodCarousel.scrollLeft', { defaultValue: 'Anterior' })}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-slate-400 hover:text-[#FF4B3E] hover:border-[#FF4B3E]/30 transition-all"
          style={{ marginTop: '-16px' }}
        >
          <i className="fas fa-chevron-left text-xs" />
        </button>
      )}
      <div
        ref={emblaRef}
        className="overflow-hidden pt-4 pb-8 px-12 md:px-14"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div ref={containerRef} className="flex gap-6 items-center">
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
                  transformOrigin: 'bottom center',
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
                      transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
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
              </div>
            )
          })}
        </div>
      </div>
      {canScrollNext && (
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-14 z-10 bg-gradient-to-l from-white dark:from-slate-950 to-transparent" />
      )}
      {canScrollNext && (
        <button
          type="button"
          onClick={scrollNext}
          aria-label={t('foodCarousel.scrollRight', { defaultValue: 'Siguiente' })}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-gray-600 dark:text-slate-400 hover:text-[#FF4B3E] hover:border-[#FF4B3E]/30 transition-all"
          style={{ marginTop: '-16px' }}
        >
          <i className="fas fa-chevron-right text-xs" />
        </button>
      )}
    </div>
  )
}