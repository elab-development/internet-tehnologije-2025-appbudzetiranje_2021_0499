import { useState, useCallback } from 'react'
import api from "../services/api"

export default function useCreateSavingsReport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createReport = useCallback(async (payload) => {
    setLoading(true)
    setError(null)

    try {
      const res = await api.post('/savings-reports', payload)
      return res.data ?? null
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to create savings report"

      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { createReport, loading, error }
}
