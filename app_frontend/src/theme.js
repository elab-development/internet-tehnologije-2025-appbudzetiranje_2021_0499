import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#10B981',
    },
    secondary: {
      main: '#34D399',
    },
    background: {
      default: '#0D1122',
      paper: 'rgba(255,255,255,0.05)',
    }
  },

  typography: {
    fontFamily: 'Inter, sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    }
  },

  shape: {
    borderRadius: 12,
  },

  // ✅ DODATO: globalno sređuje dropdown menije
  components: {
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#12172E',
          backdropFilter: 'none',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.08)',
          color: '#fff',
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.06)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(16,185,129,0.25)',
          },
          '&.Mui-selected:hover': {
            backgroundColor: 'rgba(16,185,129,0.35)',
          },
        },
      },
    },
  },
})

export default theme
