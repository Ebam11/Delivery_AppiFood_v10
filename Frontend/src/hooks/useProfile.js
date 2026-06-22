import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchJson } from '../api/fetchJson'
import { useTranslate as useTranslation } from './useTranslate'
import { isValidName } from '../utils/validation'

/**
 * Hook para manejar la lógica del perfil de usuario.
 */
export function useProfile(user, onUpdateProfile, onLogout) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    id_type: user?.id_type || 'cc',
    id_number: user?.id_number || '',
    birth_date: user?.birth_date || '',
    gender: user?.gender || 'male',
  })

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (!isValidName(formData.first_name) || !isValidName(formData.last_name)) {
      setError(t('validation.name_special_chars'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const body = {
        ...formData,
        name: `${formData.first_name} ${formData.last_name}`.trim()
      }
      
      const data = await fetchJson('/profile', {
        method: 'PUT',
        body
      })

      onUpdateProfile?.(data.data || data)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Estás seguro de eliminar tu cuenta? Esta acción no se puede deshacer.')) return

    try {
      await fetchJson('/profile', { method: 'DELETE' })
      localStorage.removeItem('token')
      onLogout?.()
      navigate('/')
    } catch (err) {
      setError('No se pudo eliminar la cuenta.')
    }
  }

  return {
    activeTab,
    setActiveTab,
    formData,
    loading,
    success,
    error,
    handleChange,
    handleUpdate,
    handleDeleteAccount
  }
}
