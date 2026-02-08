// src/hooks/useUpdateExpense.js
import { useState } from 'react'
import api from "../services/api"

export default function useUpdateExpense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateExpense = async (id, payload) => {
    setLoading(true)
    setError(null)

    try {
      const resp = await api.put(`/expenses/${id}`, payload)
      return resp.data
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to update expense"

      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }

  return { updateExpense, loading, error }
}
