// src/components/NavigationMenu.jsx
import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Avatar,
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography
} from '@mui/material'
import { styled } from '@mui/material/styles'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const Header = styled(AppBar)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  backdropFilter: 'blur(20px)',
  zIndex: theme.zIndex.appBar,
  padding: theme.spacing(0, 2),
}))

const Logo = styled('img')({
  height: 40,
  cursor: 'pointer',
})

const NavLink = styled(Button)(({ theme }) => ({
  color: '#fff',
  textTransform: 'none',
  fontWeight: 500,
  marginLeft: theme.spacing(4),
  position: 'relative',
  paddingBottom: theme.spacing(1),
  transition: 'color 0.3s ease',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: 2,
    background: 'linear-gradient(90deg, #2979FF, #40C4FF)',
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 0.3s ease',
  },
  '&:hover': {
    color: '#40C4FF',
    backgroundColor: 'transparent',
    '&::after': {
      transform: 'scaleX(1)',
    },
  },
}))

export default function NavigationMenu() {
  const navigate  = useNavigate()
  const raw       = sessionStorage.getItem('user')
  const user      = raw ? JSON.parse(raw) : {}
  const token     = sessionStorage.getItem('token')
  const [anchorEl, setAnchorEl] = useState(null)

  const items = [
    { label: 'Home',           path: '/home' },
    { label: 'Track Expenses', path: '/expenses' },
    { label: 'Savings Reports',path: '/savings-reports' },
  ]

  const handleMenuOpen = e => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  const handleLogout = async () => {
    try {
      // Call Laravel logout endpoint
      await axios.post(
        '/api/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      sessionStorage.clear()
      navigate('/')
    }
  }

  return (
    <Header elevation={0}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Box>
          <Logo
            src="/images/logo.png"
            alt="Expense Tracker"
            onClick={() => navigate('/')}
          />
        </Box>

        {/* Navigation links */}
        <Box>
          {items.map(item => (
            <NavLink key={item.label} onClick={() => navigate(item.path)}>
              {item.label}
            </NavLink>
          ))}
        </Box>

        {/* User avatar + name + menu */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Badge
            overlap="circular"
            variant="dot"
            color="success"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            invisible={user.status !== 'active'}
          >
            <Avatar
              src={user.image}
              alt={`${user.name} ${user.surname}`}
              sx={{ width: 40, height: 40, cursor: 'pointer' }}
              onClick={handleMenuOpen}
            />
          </Badge>
          <Typography
            variant="body1"
            sx={{ color: '#fff', ml: 1, fontWeight: 500, cursor: 'pointer' }}
            onClick={handleMenuOpen}
          >
            {user.name} {user.surname}
          </Typography>
          <IconButton onClick={handleMenuOpen} sx={{ color: '#fff', ml: 1 }}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top',    horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                backgroundColor: 'rgba(20,25,50,0.9)',
                backdropFilter: 'blur(10px)',
                color: '#fff',
                '& .MuiMenuItem-root': {
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }
              }
            }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose()
                navigate('/notifications')
              }}
            >
              Notifications
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose()
                navigate('/profile/edit')
              }}
            >
              Edit Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleMenuClose()
                handleLogout()
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </Header>
  )
}