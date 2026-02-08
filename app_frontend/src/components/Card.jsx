import React from 'react'
import {
  Card as MUICard,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton
} from '@mui/material'
import RestartAltIcon    from '@mui/icons-material/RestartAlt'
import EditIcon          from '@mui/icons-material/Edit'
import DeleteIcon        from '@mui/icons-material/Delete'
import DescriptionIcon   from '@mui/icons-material/Description'
import ShoppingCartIcon  from '@mui/icons-material/ShoppingCart'
import FastfoodIcon      from '@mui/icons-material/Fastfood'
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import TheatersIcon      from '@mui/icons-material/Theaters'

const categoryIcons = {
  shopping: ShoppingCartIcon,
  food: FastfoodIcon,
  medicines: LocalPharmacyIcon,
  sports_and_recreation: FitnessCenterIcon,
  entertainment: TheatersIcon,
  bills: DescriptionIcon,
}

export default function Card({ type, item, onMonth, onEdit, onDelete }) {
  // **Brute-force** fixed sizing:
  const cardSx = {
    width: 360,
    height: 300,
    background: 'rgba(20,25,50,0.6)',
    borderRadius: 3,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    overflow: 'hidden',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-6px)',
      boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
    }
  }

  if (type === 'expense') {
    const {
      id, category, description, date,
      amount, payment_method
    } = item
    const Icon = categoryIcons[category] || DescriptionIcon
    const displayDate = new Date(date).toLocaleDateString()

    return (
      <MUICard elevation={0} sx={cardSx}>
        <CardContent sx={{ overflowY: 'auto', color: '#FFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Icon sx={{ color: '#40C4FF', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
          </Box>
          <Typography sx={{ color: '#EEE', mb: 1, lineHeight: 1.4 }}>
            {description}
          </Typography>
          <Typography sx={{ color: '#BBB', mb: 1 }}>
            {displayDate} — {payment_method}
          </Typography>
          <Typography variant="h6" sx={{ color: '#40C4FF', fontWeight: 600 }}>
            ${Number(amount).toFixed(2)}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <IconButton size="small" onClick={() => onMonth(id)} sx={{ color: '#40C4FF' }}>
            <RestartAltIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onEdit(item)} sx={{ color: '#FFF' }}>
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(id)} sx={{ color: '#FF6B6B' }}>
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </MUICard>
    )
  }

  if (type === 'report') {
    const { year, month, notes } = item
    return (
      <MUICard elevation={0} sx={cardSx}>
        <CardContent sx={{ overflowY: 'auto', color: '#FFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <DescriptionIcon sx={{ color: '#40C4FF', mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {year}/{String(month).padStart(2, '0')}
            </Typography>
          </Box>
          <Typography sx={{ color: '#EEE', lineHeight: 1.4 }}>
            {notes || '—'}
          </Typography>
        </CardContent>
      </MUICard>
    )
  }

  return null
}