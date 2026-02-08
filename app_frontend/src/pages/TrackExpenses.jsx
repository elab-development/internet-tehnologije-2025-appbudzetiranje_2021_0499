// src/pages/TrackExpenses.jsx
import React, { useState, useMemo } from 'react'
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  CircularProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Breadcrumbs,
  Link as MUILink
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'

import useGetExpenses        from '../hooks/useGetExpenses'
import useGetSavingsReports from "../hooks/useGetSavingsReports";
import useCreateExpense      from '../hooks/useCreateExpense'
import useUpdateExpense      from '../hooks/useUpdateExpense'
import useDeleteExpense      from '../hooks/useDeleteExpense'
import useUpdateExpenseMonth from '../hooks/useUpdateExpenseMonth'
import Card                  from '../components/Card'

// must exactly match backend Rule::in([...])
const CATEGORIES = [
  'All',
  'shopping',
  'food',
  'medicines',
  'sports_and_recreation',
  'entertainment',
  'bills'
]

const SORT_OPTIONS = [
  { label: 'Low → High',  value: 'asc'  },
  { label: 'High → Low',  value: 'desc' }
]

const ROWS_PER_PAGE = 6

export default function TrackExpenses() {
  const { expenses, loading, refetch }       = useGetExpenses()
  const { reports, loading: reportsLoading } = useGetSavingsReports()
  const { createExpense, loading: creating } = useCreateExpense()
  const { updateExpense, loading: updating } = useUpdateExpense()
  const { deleteExpense }                    = useDeleteExpense()
  const { updateMonth }                      = useUpdateExpenseMonth()

  // UI state
  const [catFilter, setCatFilter] = useState('All')
  const [sortOrder, setSortOrder] = useState('asc')
  const [page,      setPage]      = useState(1)
  const [openDialog, setOpenDialog] = useState(false)
  const [editItem,   setEditItem]   = useState(null)
  const [form,       setForm]       = useState({
    amount: '', date: '', category: '', payment_method: '',
    currency: 'USD', receipt_image: '', is_recurring: false,
    recurring_interval: '', tags: [], description: '',
    savings_report_id: ''
  })
  const [apiErrors, setApiErrors] = useState({})

  // filter + sort
  const filtered = useMemo(() => {
    let arr = expenses
    if (catFilter !== 'All') {
      arr = arr.filter(e => e.category === catFilter)
    }
    return arr
      .slice()
      .sort((a, b) =>
        sortOrder === 'asc'
          ? a.amount - b.amount
          : b.amount - a.amount
      )
  }, [expenses, catFilter, sortOrder])

  // pagination
  const pageCount = Math.ceil(filtered.length / ROWS_PER_PAGE)
  const paged = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE
    return filtered.slice(start, start + ROWS_PER_PAGE)
  }, [filtered, page])

  // dialog handlers
  const openCreate = () => {
    setEditItem(null)
    setForm({
      amount: '', date: '', category: '', payment_method: '',
      currency: 'USD', receipt_image: '', is_recurring: false,
      recurring_interval: '', tags: [], description: '',
      savings_report_id: ''
    })
    setApiErrors({})
    setOpenDialog(true)
  }
  const openEdit = exp => {
    setEditItem(exp)
    setForm({
      amount:            exp.amount,
      date:              exp.date.slice(0,10),
      category:          exp.category,
      payment_method:    exp.payment_method,
      currency:          exp.currency,
      receipt_image:     exp.receipt_image,
      is_recurring:      exp.is_recurring,
      recurring_interval:exp.recurring_interval,
      tags:              exp.tags || [],
      description:       exp.description || '',
      savings_report_id: exp.savings_report_id || ''
    })
    setApiErrors({})
    setOpenDialog(true)
  }
  const closeDialog = () => setOpenDialog(false)

  // form change
  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  // submit create/update
  const handleSubmit = async () => {
    const payload = {
      amount:            parseFloat(form.amount),
      date:              form.date,
      category:          form.category,
      payment_method:    form.payment_method,
      currency:          form.currency,
      receipt_image:     form.receipt_image,
      is_recurring:      form.is_recurring,
      recurring_interval:form.recurring_interval,
      tags:              form.tags,
      description:       form.description,
      savings_report_id: form.savings_report_id
    }
    try {
      setApiErrors({})
      if (editItem) await updateExpense(editItem.id, payload)
      else          await createExpense(payload)
      await refetch()
      closeDialog()
    } catch (err) {
      setApiErrors(err.response?.data?.errors || {})
    }
  }

  // card actions
  const handleDelete = async id => {
    if (!window.confirm('Delete this expense?')) return
    await deleteExpense(id)
    await refetch()
  }
  const handleMonth = async id => {
    const m = window.prompt('Enter new month (1–12):')
    const month = parseInt(m, 10)
    if (month >= 1 && month <= 12) {
      await updateMonth(id, month)
      await refetch()
    }
  }

  return (
    <Box sx={{
      marginTop: '5px',
      minHeight:'100vh',
      background:'linear-gradient(135deg,#0D1122 0%,#12172E 100%)',
      py:8
    }}>
      <Container maxWidth="lg">
        {/* ── Breadcrumb */}
        <Box mb={2}>
          <Breadcrumbs
  separator="›"
  aria-label="breadcrumb"
  sx={{
    '& .MuiBreadcrumbs-separator': {
      color: '#FFF'
    }
  }}
>
            <MUILink
              component={RouterLink}
              to="/home"
              sx={{ color: '#FFF', '&:hover': { textDecoration: 'underline' } }}
            >
              Home
            </MUILink>
            <Typography color="#FFF">Track Expenses</Typography>
          </Breadcrumbs>
        </Box>

        {/* ── Top bar */}
        <Stack
          direction={{ xs:'column', sm:'row' }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          mb={4}
        >
          <Typography variant="h4" sx={{ color:'#FFF',fontWeight:700 }}>
            Your Expenses
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              select
              label="Category"
              value={catFilter}
              onChange={e => { setCatFilter(e.target.value); setPage(1) }}
              size="small"
              sx={{
                minWidth:120,
                background:'rgba(255,255,255,0.05)',
                '& .MuiSelect-select':{ color:'#FFF' }
              }}
              InputLabelProps={{ sx:{ color:'rgba(255,255,255,0.6)' } }}
            >
              {CATEGORIES.map(c => (
                <MenuItem key={c} value={c}>
                  {c === 'All'
                    ? 'All'
                    : c
                        .split('_')
                        .map(w=>w.charAt(0).toUpperCase()+w.slice(1))
                        .join(' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Sort by Amount"
              value={sortOrder}
              onChange={e => { setSortOrder(e.target.value); setPage(1) }}
              size="small"
              sx={{
                minWidth:140,
                background:'rgba(255,255,255,0.05)',
                '& .MuiSelect-select':{ color:'#FFF' }
              }}
              InputLabelProps={{ sx:{ color:'rgba(255,255,255,0.6)' } }}
            >
              {SORT_OPTIONS.map(o => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{
                textTransform:'none',
                background:'linear-gradient(90deg,#2979FF,#40C4FF)',
                '&:hover':{ background:'linear-gradient(90deg,#1565C0,#00B0FF)' }
              }}
            >
              New Expense
            </Button>
          </Stack>
        </Stack>

        {/* ── Content */}
        {loading ? (
          <Box sx={{ textAlign:'center', mt:8 }}>
            <CircularProgress color="inherit"/>
          </Box>
        ) : filtered.length === 0 ? (
          <Box sx={{
            p:6, textAlign:'center',
            background:'rgba(20,25,50,0.6)',
            borderRadius:3
          }}>
            <Typography sx={{ color:'#FFF', fontSize:'1.25rem' }}>
              No expenses match your criteria.
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} alignItems="stretch">
              {paged.map(exp => (
                <Grid item xs={12} sm={6} md={4} key={exp.id}>
                  <Card
                    type="expense"
                    item={exp}
                    onMonth={() => handleMonth(exp.id)}
                    onEdit={() => openEdit(exp)}
                    onDelete={() => handleDelete(exp.id)}
                  />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display:'flex', justifyContent:'center', mt:4 }}>
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_,p) => setPage(p)}
                color="primary"
              />
            </Box>
          </>
        )}

        {/* ── Dialog */}
        <Dialog open={openDialog} onClose={closeDialog} fullWidth maxWidth="sm">
          <DialogTitle sx={{ background:'#12172E', color:'#FFF' }}>
            {editItem ? 'Edit Expense' : 'New Expense'}
          </DialogTitle>
          <DialogContent sx={{ display:'grid', gap:2, pt:3, background:'#12172E' }}>
            <TextField
              label="Amount" name="amount" type="number" variant="filled"
              InputLabelProps={{ sx:{ color:'#AAA' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.05)' } }}
              value={form.amount} onChange={handleChange}
              error={Boolean(apiErrors.amount)} helperText={apiErrors.amount?.[0]}
              fullWidth
            />
            <TextField
              label="Date" name="date" type="date" variant="filled"
              InputLabelProps={{ sx:{ color:'#AAA' }, shrink:true }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.05)' } }}
              value={form.date} onChange={handleChange}
              error={Boolean(apiErrors.date)} helperText={apiErrors.date?.[0]}
              fullWidth
            />
            <TextField
              select label="Category" name="category" variant="filled"
              InputLabelProps={{ sx:{ color:'#AAA' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.05)' } }}
              value={form.category} onChange={handleChange}
              error={Boolean(apiErrors.category)} helperText={apiErrors.category?.[0]}
              fullWidth
            >
              {CATEGORIES.slice(1).map(c => (
                <MenuItem key={c} value={c}>
                  {c
                    .split('_')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select label="Payment" name="payment_method" variant="filled"
              InputLabelProps={{ sx:{ color:'#AAA' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.05)' } }}
              value={form.payment_method} onChange={handleChange}
              error={Boolean(apiErrors.payment_method)} helperText={apiErrors.payment_method?.[0]}
              fullWidth
            >
              {['cash','card'].map(m => (
                <MenuItem key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description" name="description" variant="filled"
              multiline rows={2}
              InputLabelProps={{ sx:{ color:'#AAA' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.05)' } }}
              value={form.description} onChange={handleChange}
              error={Boolean(apiErrors.description)} helperText={apiErrors.description?.[0]}
              fullWidth
            />
            <TextField
              select label="Report" name="savings_report_id" variant="filled"
              InputLabelProps={{ sx:{ color:'#AAA' } }}
              InputProps={{ sx:{ color:'#FFF', background:'rgba(255,255,255,0.05)' } }}
              value={form.savings_report_id} onChange={handleChange}
              error={Boolean(apiErrors.savings_report_id)} helperText={apiErrors.savings_report_id?.[0]}
              fullWidth
            >
              {reportsLoading
                ? <MenuItem disabled>Loading…</MenuItem>
                : reports.map(r => (
                    <MenuItem key={r.id} value={r.id}>
                      {r.year}/{String(r.month).padStart(2,'0')}
                    </MenuItem>
                  ))
              }
            </TextField>
          </DialogContent>
          <DialogActions sx={{ background:'#12172E', px:3, pb:2 }}>
            <Button onClick={closeDialog} sx={{ color:'#BBB' }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={creating || updating}
              sx={{
                textTransform:'none',
                background:'linear-gradient(90deg,#2979FF,#40C4FF)',
                '&:hover':{ background:'linear-gradient(90deg,#1565C0,#00B0FF)' }
              }}
            >
              {editItem ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
