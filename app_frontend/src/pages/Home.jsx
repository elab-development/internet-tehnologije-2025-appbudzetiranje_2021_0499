// src/pages/Home.jsx
import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Rating
} from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ShowChartIcon            from '@mui/icons-material/ShowChart'
import EmojiEventsIcon          from '@mui/icons-material/EmojiEvents'
import { useNavigate }          from 'react-router-dom'

const features = [
  {
    title: 'Better Budget Control',
    description:
      'See exactly where your money goes each month and make informed spending decisions.',
    icon: AccountBalanceWalletIcon,
  },
  {
    title: 'Insightful Analytics',
    description:
      'Get summaries and trends for your expenses to identify savings opportunities.',
    icon: ShowChartIcon,
  },
  {
    title: 'Achieve Financial Goals',
    description:
      'Set targets and track your progress with monthly saving reports.',
    icon: EmojiEventsIcon,
  },
]

export default function Home() {
  const navigate = useNavigate()
  const raw      = sessionStorage.getItem('user')
  const user     = raw ? JSON.parse(raw) : {}
  const name     = user.name || 'User'

  // fetch 3 random reviews
  const [reviews, setReviews]       = useState([])
  const [reviewsLoading, setLoading] = useState(true)

  useEffect(() => {
    fetch('https://randomuser.me/api/?results=3')
      .then(res => res.json())
      .then(data => {
        setReviews(
          data.results.map(u => ({
            id: u.login.uuid,
            name: `${u.name.first} ${u.name.last}`,
            picture: u.picture.large
          }))
        )
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D1122 0%, #12172E 100%)',
        py: 8
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            mb: 8,
            gap: 4
          }}
        >
          {/* Left: Text */}
          <Box
            sx={{
              flex: 1,
              pr: { md: 6 },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography
              variant="h3"
              sx={{ color: '#FFF', fontWeight: 700, mb: 2 }}
            >
              Welcome back, {name}!<br />
              Track your expenses and save millions!
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.85)',
                mb: 4,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Use our app to get real-time insights into your spending,
              plan ahead, and reach your financial goals faster.
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: 'linear-gradient(90deg, #2979FF, #40C4FF)',
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(90deg, #1565C0, #00B0FF)',
                },
              }}
              onClick={() => navigate('/expenses')}
            >
              Start tracking
            </Button>
          </Box>

          {/* Right: Hero Image */}
          <Box
            component="img"
            src="/images/hero.jpg"
            alt="Happy user checking expenses"
            sx={{
              flex: 1,
              width: '100%',
              maxWidth: 480,
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            }}
          />
        </Box>

        {/* Feature Cards */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 4,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            px: { xs: 2, md: 0 },
          }}
        >
          {features.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              elevation={0}
              sx={{
                flex: '1 1 0',
                minWidth: 280,
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 4 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    mx: 'auto',
                    mb: 2,
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, #2979FF 0%, #40C4FF 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ color: '#FFF', fontSize: 32 }} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#FFF',
                    fontWeight: 600,
                    mb: 2,
                    fontSize: '1.125rem'
                  }}
                >
                  {title}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '1rem'
                  }}
                >
                  {description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Our Reviews Section */}
        <Card
          elevation={0}
          sx={{
            mt: 8,
            p: 4,
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
          }}
        >
          <Typography
            variant="h5"
            sx={{ color: '#FFF', fontWeight: 600, mb: 4, textAlign: 'center' }}
          >
            Our Reviews
          </Typography>

          {reviewsLoading ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress color="inherit" />
            </Box>
          ) : (
            <Grid container spacing={4} justifyContent="center">
              {reviews.map(r => (
                <Grid item xs={12} sm={4} key={r.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      px: 2
                    }}
                  >
                    <Box
                      component="img"
                      src={r.picture}
                      alt={r.name}
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        mb: 2,
                        objectFit: 'cover'
                      }}
                    />
                    <Typography sx={{ color: '#FFF', fontWeight: 600, mb: 1 }}>
                      {r.name}
                    </Typography>
                    <Rating value={5} readOnly size="small" sx={{ mb: 1, color: '#FFD700' }} />
                    <Typography sx={{ color: 'rgba(255,255,255,0.85)' }}>
                      “The service was good.”
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Card>
      </Container>
    </Box>
  )
}
