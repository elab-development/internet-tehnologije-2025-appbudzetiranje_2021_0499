// src/pages/Auth.jsx
import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  IconButton
} from '@mui/material'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import ClearIcon from '@mui/icons-material/Clear'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8000'
axios.defaults.headers.common['Content-Type'] = 'application/json'

const Auth = () => {
  const navigate   = useNavigate()
  const location   = useLocation()
  const isRegister = location.pathname === '/register'

  // form fields
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    bio: '',
  })

  // file upload states
  const [file, setFile]               = useState(null)
  const [previewUrl, setPreviewUrl]   = useState(null)
  const [uploadedUrl, setUploadedUrl] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleFileChange = e => {
    const f = e.target.files[0] || null
    setFile(f)
    setUploadedUrl(null)
    if (f) {
      setPreviewUrl(URL.createObjectURL(f))
    } else {
      setPreviewUrl(null)
    }
  }

  // Upload to ImgBB
  const uploadImage = async file => {
    const key = process.env.REACT_APP_IMGBB_KEY
    const data = new FormData()
    data.append('image', file)
    const res = await axios.post(
      `https://api.imgbb.com/1/upload?key=${key}`,
      data,
      {
        headers: {
          // force a “simple” content‐type so CORS won’t preflight
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return res.data.data.url
  }

const handleSubmit = async e => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    let imageUrl = null
    if (isRegister && file) {
      imageUrl = await uploadImage(file)
      setUploadedUrl(imageUrl)
      setPreviewUrl(imageUrl)
    }

    const url     = isRegister ? '/api/register' : '/api/login'
    const payload = isRegister
      ? { ...form, role: 'regular', image: imageUrl }
      : { email: form.email, password: form.password }

    const { data } = await axios.post(url, payload)

   sessionStorage.setItem('token', data.token)
sessionStorage.setItem('user', JSON.stringify(data.user))

navigate('/home')
  } catch (err) {
    setError(
  err.response?.data?.message ||
  JSON.stringify(err.response?.data) ||
  err.message
)

  } finally {
    setLoading(false)
  }
}


  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D1122 0%, #12172E 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: { xs: '100%', sm: 400 },
          maxWidth: 450,
          p: 4,
          borderRadius: 4,
          backdropFilter: 'blur(20px)',
          backgroundColor: 'rgba(31, 103, 56, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Logo + Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            component="img"
            src="/images/logoo.png"
            alt="Savely Logo"
            sx={{ width: 350, mr: 1 }}

          />
        </Box>

        <Typography variant="h6" sx={{ color: '#EEE', mb: 2 }}>
          {isRegister ? 'Create Your Account' : 'Welcome Back'}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {isRegister && (
            <>
              <TextField
                name="name"
                label="First Name"
                variant="outlined"
                InputLabelProps={{ style: { color: '#AAA' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    '& .MuiOutlinedInput-input': {
                      color: '#FFF'
                    }
                  }
                }}
                onChange={handleChange}
                required
              />
              <TextField
                name="surname"
                label="Last Name"
                variant="outlined"
                InputLabelProps={{ style: { color: '#AAA' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    '& .MuiOutlinedInput-input': {
                      color: '#FFF'
                    }
                  }
                }}
                onChange={handleChange}
                required
              />
            </>
          )}

          <TextField
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            InputLabelProps={{ style: { color: '#AAA' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.04)',
                '& .MuiOutlinedInput-input': {
                  color: '#FFF'
                }
              }
            }}
            onChange={handleChange}
            required
          />

          <TextField
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            InputLabelProps={{ style: { color: '#AAA' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.04)',
                '& .MuiOutlinedInput-input': {
                  color: '#FFF'
                }
              }
            }}
            onChange={handleChange}
            required
          />

          {isRegister && (
            <TextField
              name="password_confirmation"
              label="Confirm Password"
              type="password"
              variant="outlined"
              InputLabelProps={{ style: { color: '#AAA' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  '& .MuiOutlinedInput-input': {
                    color: '#FFF'
                  }
                }
              }}
              onChange={handleChange}
              required
            />
          )}

          {isRegister && (
            <>
              <TextField
                name="phone"
                label="Phone"
                type="tel"
                variant="outlined"
                InputLabelProps={{ style: { color: '#AAA' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    '& .MuiOutlinedInput-input': {
                      color: '#FFF'
                    }
                  }
                }}
                onChange={handleChange}
              />
              <TextField
                name="bio"
                label="Bio"
                multiline
                rows={3}
                variant="outlined"
                InputLabelProps={{ style: { color: '#AAA' } }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    '& .MuiOutlinedInput-input': {
                      color: '#FFF'
                    }
                  }
                }}
                onChange={handleChange}
              />

              {/* Avatar upload */}
              <Button
                variant="contained"
                component="label"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#EEE',
                  '&:hover': { background: 'rgba(255,255,255,0.2)' }
                }}
              >
                {previewUrl ? 'Change Avatar' : 'Upload Avatar'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Button>

              {/* Modern squared preview + filename + cancel */}
              {previewUrl && (
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: 'rgba(255,255,255,0.08)',
                    p: 1,
                    borderRadius: 2
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Preview"
                    sx={{
                      width: 56,
                      height: 56,
                      objectFit: 'cover',
                      borderRadius: 1,
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  />
                  <Typography
                    noWrap
                    sx={{ color: '#FFF', flexGrow: 1, fontSize: 14 }}
                  >
                    {file?.name}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setFile(null)
                      setPreviewUrl(null)
                      setUploadedUrl(null)
                    }}
                    sx={{
                      color: '#FFF',
                      '&:hover': { background: 'rgba(255,255,255,0.2)' }
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </>
          )}

          <FormControlLabel
            control={<Checkbox sx={{ color: '#AAA' }} />}
            label={<Typography sx={{ color: '#AAA' }}>Remember me</Typography>}
          />

          {error && (
            <Typography color="error" variant="body2" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            endIcon={
              loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <ArrowForwardIosIcon />
              )
            }
            disabled={loading}
            sx={{
              mt: 1,
              py: 1.2,
              borderRadius: 2,
              background: 'linear-gradient(90deg, #2979FF, #40C4FF)',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { background: 'linear-gradient(90deg, #1565C0, #00B0FF)' }
            }}
          >
            {isRegister ? 'Register' : 'Login'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ color: '#AAA' }}>
            {isRegister
              ? 'Already have an account?'
              : "Don't have an account?"}{' '}
            <Link
              to={isRegister ? '/login' : '/register'}
              style={{ color: '#40C4FF', textDecoration: 'none', fontWeight: 500 }}
            >
              {isRegister ? 'Login' : 'Create Account'}
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default Auth