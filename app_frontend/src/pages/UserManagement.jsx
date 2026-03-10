// src/pages/UserManagement.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import axios from 'axios'

/* ---------- Axios base ---------- */
const API_BASE = 'http://localhost:8000/api'

const api = axios.create({ baseURL: API_BASE })
api.interceptors.request.use(cfg => {
  const t = sessionStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

const PresenceDot = ({ active }) => (
  <span
    style={{
      display: 'inline-block',
      width: 10, height: 10, borderRadius: '50%',
      background: active ? '#44D07E' : '#7A86A9',
      boxShadow: active ? '0 0 0 2px rgba(68,208,126,.25)' : 'none',
      marginRight: 8
    }}
  />
)

export default function UserManagement() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [exporting, setExporting] = useState(false)

  const load = async (q = '') => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users/regulars', { params: { search: q || undefined } })
      setRows(data?.data ?? data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name} ${u.surname}"?`)) return
    await api.delete(`/users/${u.id}`)
    setRows(r => r.filter(x => x.id !== u.id))
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await api.get('/admin/users/regulars/export', {
        params: { search: search.trim() || undefined },
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `regular-users-${new Date().toISOString().slice(0,10)}.csv`
      document.body.appendChild(a); a.click(); a.remove()
      window.URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const total = rows.length

  return (
    <Box sx={{
      minHeight: '100vh',
      background:
        'radial-gradient(1200px 600px at 10% -10%, rgba(64,196,255,0.15), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(21,101,192,0.18), transparent 55%), #0D1122',
      py: 8
    }}>
      <Container maxWidth="lg">
        <Stack spacing={1} mb={3}>
          <Typography variant="h4" sx={{ color:'#FFF', fontWeight: 800 }}>
            Users Management
          </Typography>
          <Typography sx={{ color:'rgba(255,255,255,0.65)' }}>
            List, search, export and delete users with <b>regular</b> role.
          </Typography>
        </Stack>

        <Card
          elevation={0}
          sx={{
            background: 'linear-gradient(180deg, rgba(20,25,50,0.7) 0%, rgba(15,20,40,0.7) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            overflow: 'hidden'
          }}
        >
          <Box sx={{ height: 3, background: 'linear-gradient(90deg,#2979FF,#40C4FF)' }} />
          <CardContent sx={{ color:'#FFF' }}>
            <Stack direction={{ xs:'column', sm:'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs:'stretch', sm:'center' }} mb={2}>
              <TextField
                placeholder="Search by name or email…"
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color:'#AAB4CF' }} />
                    </InputAdornment>
                  ),
                  sx: { color:'#FFF', background:'rgba(255,255,255,0.06)', borderRadius: 1 }
                }}
                fullWidth
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`Total: ${total}`}
                  sx={{ color:'#EAF1FF', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)' }}
                />
                <Button
                  onClick={handleExport}
                  disabled={exporting}
                  startIcon={<FileDownloadIcon />}
                  variant="contained"
                  sx={{
                    textTransform:'none',
                    fontWeight:700,
                    background:'linear-gradient(90deg,#2979FF,#40C4FF)',
                  }}
                >
                  {exporting ? 'Exporting…' : 'Export CSV'}
                </Button>
              </Stack>
            </Stack>

            {loading ? (
              <Box sx={{ textAlign:'center', py:5 }}><CircularProgress color="inherit" /></Box>
            ) : (
              <Box sx={{ overflowX:'auto' }}>
                <Table size="medium" sx={{
                  '& th, & td': { borderColor:'rgba(255,255,255,0.08)', color:'#EAF1FF' },
                  '& th': { color:'#BFD9FF' }
                }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(u => (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar src={u.image || ''}>{(u.name || 'U')[0]}</Avatar>
                            <div>
                              <Typography sx={{ color:'#EAF1FF', fontWeight:700, lineHeight:1 }}>
                                {u.name} {u.surname}
                              </Typography>
                              <Typography variant="caption" sx={{ color:'#AAB4CF' }}>
                                role: regular
                              </Typography>
                            </div>
                          </Stack>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <span style={{ display:'inline-flex', alignItems:'center' }}>
                            <PresenceDot active={u.status === 'active'} />
                            <Typography variant="body2" sx={{ color:'#EAF1FF' }}>
                              {u.status || 'inactive'}
                            </Typography>
                          </span>
                        </TableCell>
                        <TableCell>
                          {u.created_at ? new Date(u.created_at).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Delete user">
                            <IconButton onClick={() => handleDelete(u)} sx={{ color:'#FF7676' }}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography sx={{ color:'#AAB4CF', textAlign:'center', py:3 }}>
                            No users found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
