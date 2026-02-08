// src/hooks/useGetSavingsReports.js
import { useState, useEffect, useCallback } from 'react'
import api from "../services/api"

export default function useGetSavingsReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await api.get('/savings-reports')

      // if you’re using a Resource collection it’ll be in res.data.data
      const list = res.data.data ?? res.data
      setReports(list)

    } catch (e) {
      setError(
        e.response?.data?.message ||
        e.message ||
        "Failed to fetch reports"
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return {
    reports,
    loading,
    error,
    refetch: fetchReports
  }
}
