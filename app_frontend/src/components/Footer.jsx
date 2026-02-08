// src/components/Footer.jsx
import React from 'react'
import { Box, Typography, Link } from '@mui/material'

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 'auto',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #0D1122 0%, #12172E 100%)'
      }}
    >
      <Typography
        variant="body1"
        sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem' }}
      >
        Support:{' '}
        <Link
          href="mailto:savely@helpdesk.com"
          sx={{
            color: '#40C4FF',
            fontSize: '1.2rem',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          savely@helpdesk.com
        </Link>
      </Typography>
    </Box>
  )
}
