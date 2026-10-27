import {
  CircularProgress,
  Container,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from './shared/api/client'
import { getCurrentUser } from './features/auth/api/auth'
import { LoginPage } from './features/auth/pages/LoginPage'
import { AcademicDashboard } from './features/dashboard/pages/AcademicDashboard'

function App() {
  const userQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: getCurrentUser,
    retry: false,
  })

  if (userQuery.isPending) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <CircularProgress aria-label="Cargando sesión" />
      </Container>
    )
  }

  if (
    userQuery.isError === true &&
    userQuery.error instanceof ApiError === true &&
    userQuery.error.status === 401
  ) {
    return <LoginPage />
  }

  if (userQuery.isError) {
    return (
      <LoginPage
        connectionError="No se pudo verificar tu sesión. Comprueba la conexión con el servidor."
        onRetry={() => void userQuery.refetch()}
      />
    )
  }

  return (
    <AcademicDashboard user={userQuery.data} />
  )
}

export default App
