// Componente para mostrar el horario completo de un restaurante (7 días)
import { useMemo } from 'react'
import { useTranslate as useTranslation } from '../hooks/useTranslate';

const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAYS_NAMES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAYS_MAP = {
  'monday': 0,
  'tuesday': 1,
  'wednesday': 2,
  'thursday': 3,
  'friday': 4,
  'saturday': 5,
  'sunday': 6
}

// Función para formatear hora (14:30 -> 2:30 PM)
export const formatTime = (time, format = '24h') => {
  if (!time) return 'Cerrado'
  
  try {
    const [hours, minutes] = time.split(':').map(Number)
    
    if (format === '12h') {
      const ampm = hours >= 12 ? 'PM' : 'AM'
      const displayHours = hours % 12 || 12
      return `${displayHours}:${String(minutes).padStart(2, '0')} ${ampm}`
    }
    
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  } catch {
    return time
  }
}

// Función para obtener el día actual como nombre
export const getTodayDayName = () => {
  const today = new Date().getDay()
  // JS: 0 = domingo, 1 = lunes, ..., 6 = sábado
  // Convertir a nuestro formato: 0 = lunes, ..., 6 = domingo
  const dayIndex = today === 0 ? 6 : today - 1
  return DAYS_NAMES[dayIndex]
}

// Función para obtener el índice del día actual (0 = lunes, 6 = domingo)
export const getTodayDayIndex = () => {
  const today = new Date().getDay()
  return today === 0 ? 6 : today - 1
}

// Función para verificar si el restaurante está abierto ahora
export const isRestaurantOpenNow = (schedule) => {
  if (!schedule || !Array.isArray(schedule)) return false
  
  const now = new Date()
  const currentDayName = getTodayDayName()
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  const todaySchedule = schedule.find(s => s.day === currentDayName)
  
  if (!todaySchedule || todaySchedule.is_closed) return false
  
  return (
    currentTime >= todaySchedule.opening_time &&
    currentTime <= todaySchedule.closing_time
  )
}

// Componente principal
export default function ScheduleDisplay({ schedule, isOpen = true, variant = 'card', language = 'es' }) {
  const { t } = useTranslation()
  const days = language === 'es' ? DAYS_ES : DAYS_EN
  
  // Organizar horario por día
  const scheduleByDay = useMemo(() => {
    if (!schedule || !Array.isArray(schedule)) {
      return DAYS_NAMES.map((dayName, i) => ({
        day: dayName,
        is_closed: true,
        opening_time: null,
        closing_time: null
      }))
    }
    
    const map = {}
    schedule.forEach(item => {
      map[item.day] = item
    })
    
    return DAYS_NAMES.map((dayName, i) => map[dayName] || {
      day: dayName,
      is_closed: true,
      opening_time: null,
      closing_time: null
    })
  }, [schedule])
  
  const todayDayName = useMemo(() => getTodayDayName(), [])
  
  if (variant === 'compact') {
    // Vista compacta: solo muestra hoy
    const today = scheduleByDay.find(s => s.day === todayDayName)
    return (
      <div className="text-sm">
        {today?.is_closed ? (
          <span className="text-gray-500">{t('schedule.closed') || 'Cerrado'}</span>
        ) : (
          <span className="text-gray-700">
            {formatTime(today?.opening_time)} - {formatTime(today?.closing_time)}
          </span>
        )}
      </div>
    )
  }
  
  if (variant === 'badge') {
    // Vista badge: solo muestra estado abierto/cerrado
    return (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
        isOpen 
          ? 'bg-green-100 text-green-700' 
          : 'bg-red-100 text-red-700'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isOpen ? (language === 'es' ? 'Abierto' : 'Open') : (language === 'es' ? 'Cerrado' : 'Closed')}
      </div>
    )
  }
  
  // Vista card: tabla completa de 7 días
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <h3 className="font-bold text-[#1a2b4c] mb-4 text-[15px]">
        {t('schedule.opening_hours') || (language === 'es' ? 'Horarios de Apertura y Cierre' : 'Opening Hours')}
      </h3>
      
      <div className="space-y-3">
        {scheduleByDay.map((daySchedule, index) => {
          if (daySchedule?.is_closed) return null;
          
          return (
            <div 
              key={index}
              className="flex justify-between items-center text-[13px] tracking-wide"
            >
              <span className="text-[#334155]">
                {days[index]}
              </span>
              
              <span className="text-[#1e293b]">
                {formatTime(daySchedule?.opening_time)} - {formatTime(daySchedule?.closing_time)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
