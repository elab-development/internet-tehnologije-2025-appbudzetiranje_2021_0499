import { useState, useCallback } from 'react'
import api from "../services/api"

export default function useCreateExpense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createExpense = useCallback(async (payload) => {
    setLoading(true)
    setError(null)

    try {
      const resp = await api.post('/expenses', payload)
      return resp.data
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Something went wrong"

      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { createExpense, loading, error }
}

