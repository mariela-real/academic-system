import { createTheme } from '@mui/material/styles'

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#173f67',
      dark: '#102d4a',
      light: '#e8eff7',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#387c78',
      dark: '#28625e',
      light: '#e8f3f1',
      contrastText: '#ffffff',
    },
    success: {
      main: '#2e7d5b',
      light: '#e8f4ee',
    },
    warning: {
      main: '#a56818',
      light: '#fff4df',
    },
    error: {
      main: '#b33f47',
      light: '#fbecee',
    },
    info: {
      main: '#276997',
      light: '#e9f2f8',
    },
    background: {
      default: '#f3f6fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e2938',
      secondary: '#657387',
    },
    divider: '#e4e9f0',
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.035em',
    },
    h2: {
      fontSize: '1.55rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 700,
    },
    h4: {
      fontSize: '1.55rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 700,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 650,
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    overline: {
      fontWeight: 700,
      letterSpacing: '0.08em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f3f6fa',
        },
        '::selection': {
          backgroundColor: '#d8e6f4',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e2938',
          borderBottom: '1px solid #e4e9f0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          borderColor: '#e4e9f0',
          boxShadow: '0 1px 2px rgba(24, 39, 58, 0.035)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 10,
          paddingInline: 16,
          '&:focus-visible': {
            outline: '3px solid rgba(43, 111, 164, 0.35)',
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#ffffff',
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: {
          borderColor: '#e4e9f0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#f7f9fc',
          color: '#526176',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        },
        root: {
          borderColor: '#e9edf3',
          paddingBlock: 14,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          alignItems: 'center',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
  },
})
