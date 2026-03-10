// src/hooks/useGetSavingsReportAnalytics.js
import { useState, useCallback } from 'react'
import axios from 'axios'

export default function useGetSavingsReportAnalytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAnalytics = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      const token = sessionStorage.getItem('token') // ⬅ same as your other hooks
      const res = await axios.get(`/api/savings-reports/${id}/analytics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      })
      setData(res.data)
      return res.data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { data, loading, error, fetchAnalytics, setData }
}
