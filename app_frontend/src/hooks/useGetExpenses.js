import { useState, useEffect, useCallback } from 'react'
import api from "../services/api"

export default function useGetExpenses() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await api.get('/expenses')

      // Laravel često vraća { data: [...] }
      const list = res.data.data ?? res.data

      setExpenses(Array.isArray(list) ? list : [])
    } catch (err) {
      setError(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return {
    expenses,
    loading,
    error,
    refetch: fetchExpenses
  }
}


