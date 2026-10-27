import { useState } from 'react'
import {
  ApartmentOutlined,
  Close,
  Menu as MenuIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'

const SIDEBAR_WIDTH = 264
const APP_BAR_HEIGHT = 72

type AppLayoutProps = {
  title: string
  headerActions?: ReactNode
  navigation?: ReactNode
  children: ReactNode
}

export function AppLayout({
  title,
  headerActions,
  navigation,
  children,
}: AppLayoutProps) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  function closeMobileNavigation() {
    setMobileNavigationOpen(false)
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar
          sx={{
            gap: { xs: 1.25, sm: 2 },
            minHeight: `${APP_BAR_HEIGHT}px !important`,
            px: { xs: 2, sm: 3 },
          }}
        >
          <IconButton
            aria-label="Abrir navegación"
            color="inherit"
            onClick={() => setMobileNavigationOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            aria-hidden="true"
            sx={{
              alignItems: 'center',
              bgcolor: 'primary.main',
              borderRadius: 2.5,
              color: 'primary.contrastText',
              display: 'flex',
              height: 42,
              justifyContent: 'center',
              width: 42,
            }}
          >
            <ApartmentOutlined />
          </Box>

          <Stack spacing={0} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              component="div"
              noWrap
              sx={{ fontWeight: 750, lineHeight: 1.3 }}
              variant="subtitle1"
            >
              {title}
            </Typography>
            <Typography
              color="text.secondary"
              noWrap
              sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.25 }}
              variant="caption"
            >
              Plataforma de gestión académica
            </Typography>
          </Stack>

          {headerActions}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          display: 'flex',
          minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`,
        }}
      >
        <Drawer
          slotProps={{
            paper: {
              sx: {
                bgcolor: '#fbfcfe',
                borderRight: 1,
                borderColor: 'divider',
                position: 'relative',
                width: SIDEBAR_WIDTH,
              },
            },
          }}
          sx={{
            display: { xs: 'none', md: 'block' },
            flexShrink: 0,
            width: SIDEBAR_WIDTH,
            '& .MuiDrawer-paper': { boxSizing: 'border-box' },
          }}
          variant="permanent"
        >
          <Box onClick={closeMobileNavigation}>{navigation}</Box>
        </Drawer>

        <Drawer
          onClose={closeMobileNavigation}
          open={mobileNavigationOpen}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              bgcolor: '#fbfcfe',
              boxSizing: 'border-box',
              width: SIDEBAR_WIDTH,
            },
          }}
          variant="temporary"
        >
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: APP_BAR_HEIGHT,
              px: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>Navegación</Typography>
            <IconButton
              aria-label="Cerrar navegación"
              onClick={closeMobileNavigation}
            >
              <Close />
            </IconButton>
          </Stack>
          <Box onClick={closeMobileNavigation}>{navigation}</Box>
        </Drawer>

        <Box component="main" sx={{ flexGrow: 1, minWidth: 0 }}>
          <Container
            maxWidth="xl"
            sx={{ px: { xs: 2, sm: 3, lg: 5 }, py: { xs: 3, md: 4 } }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    </Box>
  )
}
