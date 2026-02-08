// src/hooks/useDeleteExpense.js
import { useState, useCallback } from 'react'
import api from "../services/api"

export default function useDeleteExpense() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteExpense = useCallback(async (id) => {
    if (!id) {
      const message = "Expense ID is required"
      setError(message)
      throw new Error(message)
    }

    setLoading(true)
    setError(null)

    try {
      const res = await api.delete(`/expenses/${id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`,
        },
      })

      return res?.data ?? true
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Failed to delete expense"

      setError(message)
      throw new Error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { deleteExpense, loading, error }
}

