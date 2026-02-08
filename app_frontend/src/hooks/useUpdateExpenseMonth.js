// src/hooks/useUpdateExpenseMonth.js
import { useState } from 'react'
import api from "../services/api"

export default function useUpdateExpenseMonth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateMonth = async (id, month) => {
    setLoading(true)
    setError(null)

    try {
      const resp = await api.patch(
        `/expenses/${id}/month`,
        { month }
      )
      return resp.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update expense month"

      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  return { updateMonth, loading, error }
}

