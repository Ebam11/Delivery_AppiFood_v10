// Archivo: src/hooks/useLazyLoad.js | Comentario: logica principal del modulo.
import { useEffect, useRef, useState } from 'react'

/**
 * Hook para lazy loading de imágenes usando Intersection Observer
 * Solo carga la imagen cuando es visible en pantalla
 */
export const useLazyLoad = (imageSrc, placeholderSrc) => {
  const [src, setSrc] = useState(placeholderSrc || imageSrc)
  const [isLoaded, setIsLoaded] = useState(!imageSrc)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!imageSrc) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setSrc(imageSrc)
            setIsLoaded(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '50px' } // Empieza a cargar 50px antes de ser visible
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [imageSrc])

  return { ref: imgRef, src, isLoaded }
}
