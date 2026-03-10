// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  CircularProgress,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert
} from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import axios from 'axios'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  AreaChart,
  Area,
} from 'recharts'

/* ---------- Axios base for your Laravel API ---------- */
const API_BASE =
  process.env.REACT_APP_API_URL ||
  (typeof process !== 'undefined' && process?.env?.REACT_APP_API_URL) ||
  'http://localhost:8000/api'

const api = axios.create({ baseURL: API_BASE })
api.interceptors.request.use(cfg => {
  const t = sessionStorage.getItem('token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

/* ---------- helpers ---------- */
const pad2 = (n) => String(n).padStart(2, '0')
const labelYM = (y, m) => `${y}/${pad2(m)}`
const fmtCurrency0 = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(n || 0))
const fmtCurrency = (n) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(Number(n || 0))

/* ---------- small UI helpers ---------- */
const StatChip = ({ label }) => (
  <Chip
    size="medium"
    label={label}
    sx={{
      color: '#EAF1FF',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(6px)'
    }}
  />
)

const ChartCard = ({ title, subtitle, children }) => (
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
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color:'#AAB4CF', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ mt: 2 }}>
        {children}
      </Box>
    </CardContent>
  </Card>
)

const TooltipBox = ({ active, payload, label, money = true }) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div style={{
      padding:'10px 12px',
      background:'rgba(14,19,38,.95)',
      border:'1px solid rgba(255,255,255,.12)',
      borderRadius:8,
      color:'#EAF1FF',
      minWidth: 160
    }}>
      {label && <div style={{ marginBottom:6, color:'#AAB4CF' }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ display:'flex', justifyContent:'space-between', gap:12 }}>
          <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
            <span style={{ width:10, height:10, background:p.color, borderRadius:2 }} />
            {p.name}
          </span>
          <b>{money ? fmtCurrency(p.value) : p.value}</b>
        </div>
      ))}
    </div>
  )
}

/* ==============================================================
   PAGE
================================================================ */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([]) // from /savings-reports/statistics (admin-only)
  const [error, setError] = useState(null)

  // News state
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [newsError, setNewsError] = useState(null)

  // Email modal state
  const [emailOpen, setEmailOpen] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [toast, setToast] = useState({ open: false, severity: 'success', msg: '' })

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/savings-reports/statistics')
        setStats(data?.statistics || [])
      } catch (e) {
        setError(e?.response?.data?.error || 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Fetch free public news (images, no key)
  useEffect(() => {
    (async () => {
      try {
        setNewsLoading(true)
        const { data } = await axios.get(
          'https://api.spaceflightnewsapi.net/v4/articles/',
          { params: { limit: 12, ordering: '-published_at' } }
        )
        setNews(Array.isArray(data?.results) ? data.results : [])
      } catch {
        setNewsError('Failed to load news')
      } finally {
        setNewsLoading(false)
      }
    })()
  }, [])

  // Normalize with helpers for sorting/aggregations
  const normalized = useMemo(() => {
    return (stats || []).map(r => ({
      ...r,
      total: Number(r.total_expenses || 0),
      count: Number(r.expenses_count || 0),
      ym: labelYM(r.year, r.month),
      ts: Number(r.year) * 100 + Number(r.month) // sortable key
    }))
  }, [stats])

  /* KPIs */
  const kpis = useMemo(() => {
    const total = normalized.reduce((s, r) => s + r.total, 0)
    const items = normalized.reduce((s, r) => s + r.count, 0)
    const reports = normalized.length
    const avg = items ? total / items : 0
    return { total, items, reports, avg }
  }, [normalized])

  /* Top 8 months by total (aggregated by year-month) */
  const topMonths = useMemo(() => {
    const map = new Map()
    normalized.forEach(r => {
      map.set(r.ym, (map.get(r.ym) || 0) + r.total)
    })
    return Array.from(map, ([month, total]) => ({ month, total }))
      .sort((a,b) => b.total - a.total)
      .slice(0, 8)
      .reverse()
  }, [normalized])

  /* Last 12 months trend (sum per month) */
  const last12 = useMemo(() => {
    const map = new Map()
    normalized.forEach(r => {
      const key = r.ts
      const month = r.ym
      const got = map.get(key) || { month, total: 0 }
      got.total += r.total
      map.set(key, got)
    })
    return Array.from(map.entries())
      .sort((a,b) => a[0] - b[0])
      .map(([, v]) => v)
      .slice(-12)
  }, [normalized])

  /* ------- News slider helpers ------- */
  const trackRef = useRef(null)
  const scrollByPage = (dir = 1) => {
    const el = trackRef.current
    if (!el) return
    el.scrollBy({ left: el.clientWidth * 0.9 * dir, behavior: 'smooth' })
  }

  /* ------- Email content & send ------- */
  const emailBody = useMemo(() => {
    const lines = []
    lines.push('Savings Reports — Admin Summary')
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push('')
    lines.push(`Total: ${fmtCurrency(kpis.total)}`)
    lines.push(`Reports: ${kpis.reports}`)
    lines.push(`Items: ${kpis.items}`)
    lines.push(`Avg per item: ${fmtCurrency(kpis.avg)}`)
    lines.push('')
    lines.push('Top Months (by total):')
    topMonths.slice().reverse().forEach(m => {
      lines.push(` - ${m.month}: ${fmtCurrency(m.total)}`)
    })
    lines.push('')
    lines.push('Last 12 Months (total):')
    last12.forEach(m => {
      lines.push(` - ${m.month}: ${fmtCurrency(m.total)}`)
    })
    return lines.join('\n')
  }, [kpis, topMonths, last12])

  const validEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

  const sendEmail = async () => {
    if (!validEmail(emailTo)) {
      setToast({ open: true, severity: 'error', msg: 'Please enter a valid email address.' })
      return
    }
    setEmailSending(true)
    try {
      // Free public service: FormSubmit (no API key).
      // It may ask the recipient to confirm once; after that, messages deliver.
      const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(emailTo.trim())}`
      await axios.post(endpoint, {
        _subject: 'Savings Reports — Admin Statistics',
        message: emailBody,
        _captcha: 'false'
      }, { headers: { 'Content-Type': 'application/json' } })

      setToast({ open: true, severity: 'success', msg: 'Report sent successfully.' })
      setEmailOpen(false)
    } catch (e) {
      // Fallback: open mail client with prefilled subject/body
      const subj = encodeURIComponent('Savings Reports — Admin Statistics')
      const body = encodeURIComponent(emailBody)
      window.location.href = `mailto:${encodeURIComponent(emailTo.trim())}?subject=${subj}&body=${body}`
      setToast({
        open: true,
        severity: 'info',
        msg: 'Opened your email client to send the report.'
      })
      setEmailOpen(false)
    } finally {
      setEmailSending(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background:
        'radial-gradient(1200px 600px at 10% -10%, rgba(64,196,255,0.15), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(21,101,192,0.18), transparent 55%), #0D1122',
      py: 8
    }}>
      <Container maxWidth="lg">
        <Stack spacing={1} mb={1}>
          <Typography variant="h4" sx={{ color:'#FFF', fontWeight: 800 }}>
            Welcome Administrator!
          </Typography>
          <Typography sx={{ color:'rgba(255,255,255,0.65)' }}>
            Overview of savings report activity (all users).
          </Typography>
        </Stack>

        {/* KPIs + Email button */}
        <Stack direction="row" spacing={1.5} flexWrap="wrap" mb={2} alignItems="center">
          <StatChip label={`Total: ${fmtCurrency0(kpis.total)}`} />
          <StatChip label={`Reports: ${kpis.reports}`} />
          <StatChip label={`Items: ${kpis.items}`} />
          <StatChip label={`Avg per item: ${fmtCurrency0(kpis.avg)}`} />
          <Box sx={{ flexGrow: 1 }} />
          <Button
            startIcon={<MailOutlineIcon />}
            onClick={() => setEmailOpen(true)}
            variant="contained"
            sx={{
              textTransform:'none',
              background:'linear-gradient(90deg,#2979FF,#40C4FF)',
              '&:hover': { background:'linear-gradient(90deg,#1565C0,#00B0FF)' }
            }}
          >
            Email Report
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ textAlign:'center', mt: 8 }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : error ? (
          <Box sx={{
            p: 4, textAlign:'center',
            background:'rgba(255,84,84,0.1)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: 3,
            color:'#FFD1D1'
          }}>
            {error}
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {/* LEFT: Top months by total (Top 8) */}
              <Grid item xs={12} md={6}>
                <ChartCard
                  title="Top Months by Total (Top 8)"
                  subtitle="Across all users • Horizontal bar"
                >
                  <Box sx={{ height: 380, width: 500 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={topMonths}
                        layout="vertical"
                        margin={{ top: 8, right: 16, bottom: 8, left: 40 }}
                      >
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" />
                        <XAxis type="number" tick={{ fill:'#BFD9FF' }} tickFormatter={(v)=>`$${Math.round(v/1000)}k`} />
                        <YAxis type="category" dataKey="month" tick={{ fill:'#BFD9FF' }} width={70} />
                        <RechartsTooltip content={<TooltipBox money />} />
                        <Bar dataKey="total" name="Total" fill="#40C4FF" radius={[6,6,6,6]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartCard>
              </Grid>

              {/* RIGHT: Last 12 months trend (area) */}
              <Grid item xs={12} md={6}>
                <ChartCard
                  title="Last 12 Months Trend"
                  subtitle="Sum of totals per month"
                >
                  <Box sx={{ height: 380, width: 500 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={last12} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                        <defs>
                          <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#40C4FF" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#40C4FF" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false}/>
                        <XAxis dataKey="month" tick={{ fill:'#BFD9FF' }} />
                        <YAxis tick={{ fill:'#BFD9FF' }} tickFormatter={(v)=>`$${Math.round(v/1000)}k`} />
                        <RechartsTooltip content={<TooltipBox money />} />
                        <Area type="monotone" dataKey="total" name="Total" stroke="#40C4FF" fill="url(#gradBlue)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </ChartCard>
              </Grid>

              {/* NEWS WIDGET — full width slider */}
              <Grid item xs={12}>
                <ChartCard
                  title="Latest News"
                  subtitle="Powered by the free Spaceflight News API"
                >
                  {newsLoading ? (
                    <Box sx={{ textAlign:'center', py: 4 }}>
                      <CircularProgress color="inherit" />
                    </Box>
                  ) : newsError ? (
                    <Typography sx={{ color:'#FFD1D1' }}>{newsError}</Typography>
                  ) : (
                    <Box sx={{ position:'relative' }}>
                      <IconButton
                        size="small"
                        onClick={() => scrollByPage(-1)}
                        sx={{
                          position:'absolute', left:-8, top:'50%', transform:'translateY(-50%)',
                          color:'#EAF1FF', background:'rgba(255,255,255,0.08)',
                          '&:hover': { background:'rgba(255,255,255,0.15)' }, zIndex: 2
                        }}
                      >
                        <ChevronLeftIcon/>
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => scrollByPage(1)}
                        sx={{
                          position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)',
                          color:'#EAF1FF', background:'rgba(255,255,255,0.08)',
                          '&:hover': { background:'rgba(255,255,255,0.15)' }, zIndex: 2
                        }}
                      >
                        <ChevronRightIcon/>
                      </IconButton>

                      <Box
                        ref={trackRef}
                        sx={{
                          overflowX:'auto',
                          scrollBehavior:'smooth',
                          display:'flex',
                          gap:2,
                          pb:1,
                          scrollSnapType:'x mandatory',
                          '&::-webkit-scrollbar': { display:'none' }
                        }}
                      >
                        {news.map(a => (
                          <Card
                            key={a.id}
                            elevation={0}
                            sx={{
                              flex: '0 0 280px',
                              background:'rgba(255,255,255,0.04)',
                              border:'1px solid rgba(255,255,255,0.08)',
                              borderRadius: 3,
                              overflow:'hidden',
                              scrollSnapAlign:'start',
                              display:'flex',
                              flexDirection:'column'
                            }}
                          >
                            <Box
                              sx={{
                                position:'relative',
                                pt: '56.25%',
                                background: `url(${a.image_url || a.thumbnail || ''}) center/cover no-repeat, linear-gradient(180deg,#0E1326,#0E1326)`,
                              }}
                            />
                            <CardContent sx={{ color:'#FFF', flexGrow:1, display:'flex', flexDirection:'column' }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight:700,
                                  mb:1,
                                  display:'-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient:'vertical',
                                  overflow:'hidden'
                                }}
                              >
                                {a.title}
                              </Typography>
                              <Typography variant="body2" sx={{ color:'#AAB4CF', mb:2 }}>
                                {new Date(a.published_at || a.publishedAt || a.updated_at).toLocaleString()}
                              </Typography>
                              <Box sx={{ mt:'auto' }}>
                                <Button
                                  href={a.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="contained"
                                  size="small"
                                  sx={{
                                    textTransform:'none',
                                    background:'linear-gradient(90deg,#2979FF,#40C4FF)',
                                    '&:hover': { background:'linear-gradient(90deg,#1565C0,#00B0FF)' }
                                  }}
                                >
                                  Read
                                </Button>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </Box>
                    </Box>
                  )}
                </ChartCard>
              </Grid>
            </Grid>
          </>
        )}

        {/* Email modal */}
        <Dialog open={emailOpen} onClose={() => setEmailOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle sx={{ background:'#12172E', color:'#FFF' }}>
            Email Report
          </DialogTitle>
          <DialogContent sx={{ background:'#12172E' }}>
            <TextField
              autoFocus
              margin="dense"
              label="Recipient email"
              type="email"
              fullWidth
              variant="filled"
              value={emailTo}
              onChange={(e)=>setEmailTo(e.target.value)}
              InputLabelProps={{ sx:{ color:'#AAB4CF' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.06)', borderRadius: 1 } }}
              placeholder="name@example.com"
            />
            <Box sx={{
              mt:2, p:2,
              color:'#BFD9FF',
              background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:2,
              fontFamily:'monospace',
              whiteSpace:'pre-wrap',
              maxHeight:220,
              overflow:'auto'
            }}>
              {emailBody}
            </Box>
          </DialogContent>
          <DialogActions sx={{ background:'#12172E', px:3, pb:2 }}>
            <Button onClick={()=>setEmailOpen(false)} sx={{ color:'#BFC8E0' }}>Cancel</Button>
            <Button
              onClick={sendEmail}
              disabled={emailSending}
              variant="contained"
              startIcon={<MailOutlineIcon />}
              sx={{
                textTransform:'none',
                background:'linear-gradient(90deg,#2979FF,#40C4FF)',
                '&:hover': { background:'linear-gradient(90deg,#1565C0,#00B0FF)' }
              }}
            >
              {emailSending ? 'Sending…' : 'Send'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={toast.open}
          autoHideDuration={3500}
          onClose={()=>setToast(t=>({ ...t, open:false }))}
          anchorOrigin={{ vertical:'bottom', horizontal:'center' }}
        >
          <Alert
            onClose={()=>setToast(t=>({ ...t, open:false }))}
            severity={toast.severity}
            sx={{ width:'100%' }}
          >
            {toast.msg}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  )
}
