// Archivo: src/hooks/useLazyLoad.js | Comentario: logica principal del modulo.
import { useEffect, useRef, useState } from 'react'

/**
 * Hook para lazy loading de imágenes usando Intersection Observer
 * Solo carga la imagen cuando es visible en pantalla y asegura que esté completamente descargada
 */
export const useLazyLoad = (imageSrc, placeholderSrc) => {
  const [src, setSrc] = useState(placeholderSrc || imageSrc)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!imageSrc) {
      setIsLoaded(true)
      return
    }

    setIsLoaded(false)
    setSrc(placeholderSrc || '')

    const triggerLoad = () => {
      const img = new Image()
      img.src = imageSrc
      img.onload = () => {
        setSrc(imageSrc)
        setIsLoaded(true)
      }
      img.onerror = () => {
        setSrc(placeholderSrc || imageSrc)
        setIsLoaded(true)
      }
    }

    if (typeof IntersectionObserver === 'undefined') {
      triggerLoad()
      return
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            triggerLoad()
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin: '100px' } // Un poco más de margen para mejorar la experiencia de usuario
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current)
      }
    }
  }, [imageSrc, placeholderSrc])

  return { ref: imgRef, src, isLoaded }
}

