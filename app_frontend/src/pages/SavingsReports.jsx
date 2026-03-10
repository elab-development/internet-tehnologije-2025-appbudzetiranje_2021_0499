import React, { useState } from 'react'
import {
  Box, Container, Stack, Typography, Button, Grid,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, CircularProgress, Breadcrumbs,
  Link as MUILink, Divider, List, ListItem, ListItemText, Chip
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import QueryStatsIcon from '@mui/icons-material/QueryStats'
import PaidIcon from '@mui/icons-material/Paid'

import useGetSavingsReports   from '../hooks/useGetSavingsReports'
import useCreateSavingsReport from '../hooks/useCreateSavingsReport'
import useGetSavingsReportAnalytics from '../hooks/useGetSavingsReportAnalytics'
import Card from '../components/Card'

export default function SavingsReports() {
  const { reports, loading, refetch } = useGetSavingsReports()
  const { createReport, loading: creating } = useCreateSavingsReport()
  const { data, loading: loadingAnalytics, fetchAnalytics } = useGetSavingsReportAnalytics()

  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ year:'', month:'', notes:'' })
  const [apiErrors, setApiErrors] = useState({})

  const [openAnalytics, setOpenAnalytics] = useState(false)
  const [openExpenses,  setOpenExpenses]  = useState(false)

  const openDialog = () => {
    setForm({ year:'', month:'', notes:'' })
    setApiErrors({})
    setOpen(true)
  }
  const closeDialog = () => setOpen(false)

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      setApiErrors({})
      await createReport({
        year: parseInt(form.year, 10),
        month: parseInt(form.month, 10),
        notes: form.notes || null
      })
      await refetch()
      closeDialog()
    } catch (err) {
      setApiErrors(err.response?.data?.errors || {})
    }
  }

  const handleViewAnalytics = async (id) => {
    setOpenAnalytics(true)
    await fetchAnalytics(id)
  }

  const handleViewExpenses = async (id) => {
    setOpenExpenses(true)
    await fetchAnalytics(id)
  }

  const currency = (n) => `$${Number(n || 0).toFixed(2)}`
  const monthName = (n) =>
    new Date(2000, Number(n) - 1, 1).toLocaleString(undefined, { month: 'long' })

  return (
    <Box sx={{
      minHeight:'100vh',
      background:'radial-gradient(1200px 600px at 10% -10%, rgba(64,196,255,0.15), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(21,101,192,0.18), transparent 55%), #0D1122',
      py:8
    }}>
      <Container maxWidth="md">
        {/* Top bar */}
        <Stack direction={{ xs:'column', sm:'row' }} alignItems="flex-start" justifyContent="space-between" spacing={1.5} mb={3}>
          <Box>
            <Typography variant="h4" sx={{ color:'#FFF', fontWeight:800, letterSpacing: 0.2 }}>
              Monthly Savings Reports
            </Typography>
            <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.65)' }}>
              Create a report each month to track expenses and analyze trends.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openDialog}
            sx={{
              mt: { xs: 1.5, sm: 0 },
              textTransform:'none',
              fontWeight: 700,
              background:'linear-gradient(90deg,#2979FF,#40C4FF)',
              boxShadow: '0 8px 18px rgba(64,196,255,0.25)',
              '&:hover':{ background:'linear-gradient(90deg,#1565C0,#00B0FF)' }
            }}
          >
            New Report
          </Button>
        </Stack>

        {/* content */}
        {loading ? (
          <Box sx={{ textAlign:'center', mt:8 }}>
            <CircularProgress color="inherit" />
          </Box>
        ) : reports.length === 0 ? (
          <Box sx={{
            p:6, textAlign:'center',
            background:'rgba(20,25,50,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius:4
          }}>
            <Typography sx={{ color:'#FFF', fontSize:'1.25rem', fontWeight:700 }}>
              No savings reports yet…
            </Typography>
            <Typography sx={{ color:'rgba(255,255,255,0.65)', mt:1 }}>
              Create one to start monitoring your progress.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {reports.map(r => (
              <Grid item xs={12} sm={6} key={r.id}>
                <Card
                  type="report"
                  item={r}
                  onViewAnalytics={handleViewAnalytics}
                  onViewExpenses={handleViewExpenses}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Create report dialog */}
        <Dialog
          open={open}
          onClose={closeDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(180deg,#12172E,#0E1326)'
            }
          }}
        >
          <DialogTitle sx={{ color:'#FFF' }}>New Savings Report</DialogTitle>
          <DialogContent sx={{ display:'grid', gap:2, pt:1 }}>
            <TextField
              label="Year" name="year" type="number" variant="filled"
              InputLabelProps={{ sx:{ color:'#AAB4CF' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.06)', borderRadius: 1 } }}
              value={form.year} onChange={handleChange}
              error={Boolean(apiErrors.year)} helperText={apiErrors.year?.[0]}
              fullWidth
            />
            <TextField
              select label="Month" name="month" variant="filled"
              InputLabelProps={{ sx:{ color:'#AAB4CF' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.06)', borderRadius: 1 } }}
              value={form.month} onChange={handleChange}
              error={Boolean(apiErrors.month)} helperText={apiErrors.month?.[0]}
              fullWidth
            >
              {Array.from({ length:12 }, (_,i)=>i+1).map(m=>(
                <MenuItem key={m} value={m}>{String(m).padStart(2,'0')}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Notes" name="notes" variant="filled" multiline rows={3}
              InputLabelProps={{ sx:{ color:'#AAB4CF' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.06)', borderRadius: 1 } }}
              value={form.notes} onChange={handleChange}
              error={Boolean(apiErrors.notes)} helperText={apiErrors.notes?.[0]}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2 }}>
            <Button onClick={closeDialog} sx={{ color:'#BFC8E0' }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={creating}
              sx={{
                textTransform:'none',
                fontWeight:700,
                background:'linear-gradient(90deg,#2979FF,#40C4FF)',
                '&:hover':{ background:'linear-gradient(90deg,#1565C0,#00B0FF)' }
              }}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>

        {/* Analytics modal */}
        <Dialog
          open={openAnalytics}
          onClose={() => setOpenAnalytics(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(180deg,#12172E,#0E1326)'
            }
          }}
        >
          <DialogTitle sx={{ color:'#FFF' }}>Report Analytics</DialogTitle>
          <DialogContent sx={{ color:'#FFF' }}>
            {loadingAnalytics || !data ? (
              <Box sx={{ textAlign:'center', py:4 }}>
                <CircularProgress color="inherit" />
              </Box>
            ) : (
              <>
                <Typography sx={{ mb:2, color:'#AAB4CF' }}>
                  {data.report?.year}/{String(data.report?.month).padStart(2,'0')} • {monthName(data.report?.month)}
                </Typography>

                {/* metric tiles */}
                <Stack direction="row" spacing={2} sx={{ mb:3 }}>
                  <Box sx={{
                    flex:1, p:2, borderRadius:2,
                    border:'1px solid rgba(255,255,255,0.08)',
                    background:'rgba(255,255,255,0.04)'
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <QueryStatsIcon fontSize="small" />
                      <Typography variant="caption" sx={{ color:'#AAB4CF' }}>Expenses</Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight:800, mt:0.5 }}>
                      {data.summary.expenses_count}
                    </Typography>
                  </Box>
                  <Box sx={{
                    flex:1, p:2, borderRadius:2,
                    border:'1px solid rgba(255,255,255,0.08)',
                    background:'rgba(255,255,255,0.04)'
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PaidIcon fontSize="small" />
                      <Typography variant="caption" sx={{ color:'#AAB4CF' }}>Total</Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight:800, mt:0.5 }}>
                      {currency(data.summary.total_expenses)}
                    </Typography>
                  </Box>
                  <Box sx={{
                    flex:1, p:2, borderRadius:2,
                    border:'1px solid rgba(255,255,255,0.08)',
                    background:'rgba(255,255,255,0.04)'
                  }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <QueryStatsIcon fontSize="small" />
                      <Typography variant="caption" sx={{ color:'#AAB4CF' }}>Average</Typography>
                    </Stack>
                    <Typography variant="h5" sx={{ fontWeight:800, mt:0.5 }}>
                      {currency(data.summary.average_expense)}
                    </Typography>
                  </Box>
                </Stack>

                <Typography sx={{ fontWeight:700, mb:1 }}>By Category</Typography>
                <List dense sx={{ maxHeight: 280, overflowY: 'auto', pr: 1 }}>
                  {Object.entries(data.by_category || {}).map(([cat, agg]) => (
                    <React.Fragment key={cat}>
                      <ListItem
                        secondaryAction={
                          <Chip
                            label={currency(agg.total)}
                            variant="outlined"
                            sx={{
                              color:'#7BD3FF',
                              borderColor:'rgba(64,196,255,0.45)',
                              fontWeight:700
                            }}
                          />
                        }
                      >
                        <ListItemText
                          primary={cat.replaceAll('_',' ')}
                          secondary={`Items: ${agg.count}`}
                          primaryTypographyProps={{ sx:{ color:'#EAF1FF', fontWeight:600 } }}
                          secondaryTypographyProps={{ sx:{ color:'#AAB4CF' } }}
                        />
                      </ListItem>
                      <Divider component="li" sx={{ borderColor:'rgba(255,255,255,0.08)' }} />
                    </React.Fragment>
                  ))}
                  {Object.keys(data.by_category || {}).length === 0 && (
                    <Typography sx={{ color:'#AAB4CF', py:2 }}>No expenses yet.</Typography>
                  )}
                </List>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2 }}>
            <Button onClick={() => setOpenAnalytics(false)} sx={{ color:'#BFC8E0' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Expenses modal */}
        <Dialog
          open={openExpenses}
          onClose={() => setOpenExpenses(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(180deg,#12172E,#0E1326)'
            }
          }}
        >
          <DialogTitle sx={{ color:'#FFF' }}>Report Expenses</DialogTitle>
          <DialogContent sx={{ color:'#FFF' }}>
            {loadingAnalytics || !data ? (
              <Box sx={{ textAlign:'center', py:4 }}>
                <CircularProgress color="inherit" />
              </Box>
            ) : (
              <List sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                {(data.expenses || []).map((e) => (
                  <React.Fragment key={e.id}>
                    <ListItem
                      secondaryAction={
                        <Chip
                          label={currency(e.amount)}
                          sx={{ color:'#0E1326', background:'#7BD3FF', fontWeight:800 }}
                        />
                      }
                    >
                      <ListItemText
                        primaryTypographyProps={{ sx:{ color:'#EAF1FF', fontWeight:700 } }}
                        secondaryTypographyProps={{ sx:{ color:'#AAB4CF' } }}
                        primary={`${e.category?.replaceAll('_',' ')}`}
                        secondary={`${new Date(e.date).toLocaleDateString()} — ${e.payment_method || ''}`}
                      />
                    </ListItem>
                    <Divider component="li" sx={{ borderColor:'rgba(255,255,255,0.08)' }} />
                  </React.Fragment>
                ))}
                {(data.expenses || []).length === 0 && (
                  <Typography sx={{ color:'#AAB4CF', py:2 }}>No expenses in this report.</Typography>
                )}
              </List>
            )}
          </DialogContent>
          <DialogActions sx={{ px:3, pb:2 }}>
            <Button onClick={() => setOpenExpenses(false)} sx={{ color:'#BFC8E0' }}>Close</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
