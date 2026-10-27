import { useState } from 'react'
import {
  ApartmentOutlined,
  ArrowForward,
  AutoStoriesOutlined,
  LockOutlined,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import { ApiError } from '../../../shared/api/client'
import { login } from '../api/auth'

type LoginPageProps = {
  connectionError?: string
  onRetry?: () => void
}

export function LoginPage({
  connectionError,
  onRetry,
}: LoginPageProps) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const loginMutation = useMutation({
    mutationFn: () => login(email.trim(), password),
    onSuccess: async (user) => {
      queryClient.setQueryData(['auth', 'me'], user)
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
    },
  })

  const loginError =
    loginMutation.error instanceof ApiError &&
    loginMutation.error.status === 401
      ? 'El correo o la contraseña no son correctos.'
      : loginMutation.error?.message

  return (
    <Box
      sx={{
        alignItems: 'center',
        background:
          'radial-gradient(ellipse at 12% 12%, rgba(216, 230, 244, 0.9), transparent 38%), #f3f6fa',
        display: 'flex',
        minHeight: '100vh',
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'center', mb: { xs: 3, md: 5 } }}
        >
          <Box
            aria-hidden="true"
            sx={{
              alignItems: 'center',
              bgcolor: 'primary.main',
              borderRadius: 2.5,
              color: 'primary.contrastText',
              display: 'flex',
              height: 44,
              justifyContent: 'center',
              width: 44,
            }}
          >
            <ApartmentOutlined />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 750 }} variant="subtitle1">
              UNICEN
            </Typography>
            <Typography color="text.secondary" variant="caption">
              Sistema Académico
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            alignItems: 'center',
            display: 'grid',
            gap: { xs: 3, md: 7 },
            gridTemplateColumns: { xs: '1fr', md: '1fr minmax(360px, 0.85fr)' },
          }}
        >
          <Stack
            spacing={2.5}
            sx={{
              alignItems: 'flex-start',
              display: { xs: 'none', md: 'flex' },
              maxWidth: 560,
              px: 2,
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                alignItems: 'center',
                bgcolor: 'secondary.light',
                borderRadius: 3,
                color: 'secondary.dark',
                display: 'flex',
                height: 64,
                justifyContent: 'center',
                width: 64,
              }}
            >
              <AutoStoriesOutlined sx={{ fontSize: 32 }} />
            </Box>
            <Typography component="h1" variant="h1">
              Tu comunidad académica, en un solo lugar.
            </Typography>
            <Typography color="text.secondary" variant="h6">
              Accede a la oferta, gestiona tus actividades y consulta la
              información académica de forma segura.
            </Typography>
          </Stack>

          <Card
            variant="outlined"
            sx={{
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(27, 55, 85, 0.09)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
              <Stack spacing={3}>
                <Box>
                  <Typography
                    component="h2"
                    sx={{ mb: 0.75 }}
                    variant="h4"
                  >
                    Iniciar sesión
                  </Typography>
                  <Typography color="text.secondary">
                    Ingresa con tu cuenta institucional para continuar.
                  </Typography>
                </Box>

                {connectionError ? (
                  <Alert
                    action={
                      onRetry ? (
                        <AppButton
                          color="inherit"
                          onClick={onRetry}
                          size="small"
                        >
                          Reintentar
                        </AppButton>
                      ) : undefined
                    }
                    severity="warning"
                  >
                    {connectionError}
                  </Alert>
                ) : null}

                {loginError ? (
                  <Alert severity="error">{loginError}</Alert>
                ) : null}

                <Stack
                  component="form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    loginMutation.mutate()
                  }}
                  spacing={2}
                >
                  <AppTextField
                    autoComplete="username"
                    autoFocus
                    label="Correo electrónico"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    type="email"
                    value={email}
                  />

                  <AppTextField
                    autoComplete="current-password"
                    label="Contraseña"
                    name="password"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    slotProps={{
                      input: {
                        endAdornment: <LockOutlined color="disabled" />,
                      },
                    }}
                    type="password"
                    value={password}
                  />

                  <AppButton
                    disabled={loginMutation.isPending}
                    endIcon={<ArrowForward />}
                    size="large"
                    type="submit"
                    variant="contained"
                    sx={{ mt: 1 }}
                  >
                    {loginMutation.isPending
                      ? 'Verificando…'
                      : 'Ingresar al sistema'}
                  </AppButton>
                </Stack>

                <Typography color="text.secondary" variant="caption">
                  El acceso y los permisos se verifican de forma segura.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  )
}
