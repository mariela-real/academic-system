import { useState } from 'react'
import {
  Alert,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import { QueryState } from '../../../shared/components/QueryState'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppTextField } from '../../../shared/ui/AppTextField'
import { PageHeader } from '../../../shared/ui/PageHeader'
import { StatusChip } from '../../../shared/ui/StatusChip'
import {
  boliviaDateTimeToIso,
  formatBoliviaDate,
} from '../../../shared/lib/bolivia-date'
import {
  createAcademicPeriod,
  getAcademicPeriods,
  updateAcademicPeriod,
} from '../api/academic-periods'

export function AcademicPeriodsPage() {
  const queryClient = useQueryClient()
  const [code, setCode] = useState('')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [enabled, setEnabled] = useState(false)
  const periodsQuery = useQuery({
    queryKey: ['academic-periods'],
    queryFn: getAcademicPeriods,
  })
  const createMutation = useMutation({
    mutationFn: createAcademicPeriod,
    onSuccess: async () => {
      setCode('')
      setStartsAt('')
      setEndsAt('')
      setEnabled(false)
      await refreshData()
    },
  })
  const updateMutation = useMutation({
    mutationFn: ({
      periodCode,
      enabled,
    }: {
      periodCode: string
      enabled: boolean
    }) => updateAcademicPeriod(periodCode, { enabled }),
    onSuccess: refreshData,
  })

  async function refreshData() {
    await queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    await queryClient.invalidateQueries({ queryKey: ['courses'] })
    await queryClient.invalidateQueries({ queryKey: ['audit-logs'] })
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        description="Los horarios de inscripción y cancelación se administran en America/La_Paz."
        title="Gestiones académicas"
      />

      <Card variant="outlined">
        <CardContent>
          <Stack
            component="form"
            spacing={2}
            onSubmit={(event) => {
              event.preventDefault()
              createMutation.mutate({
                code,
                enrollmentStartsAt: boliviaDateTimeToIso(startsAt),
                enrollmentEndsAt: boliviaDateTimeToIso(endsAt),
                enabled,
              })
            }}
          >
            <Typography component="h2" variant="h6">
              Configurar gestión académica
            </Typography>

            {createMutation.isError ? (
              <Alert severity="error">
                {getUserFacingErrorMessage(
                  createMutation.error,
                  'No se pudo crear la gestión académica. Verifica los datos e inténtalo nuevamente.',
                )}
              </Alert>
            ) : null}

            <AppTextField
              label="Código (por ejemplo, 2026-1)"
              onChange={(event) => setCode(event.target.value)}
              required
              value={code}
            />

            <AppTextField
              label="Inicio de inscripciones y cancelaciones (Bolivia)"
              onChange={(event) => setStartsAt(event.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              type="datetime-local"
              value={startsAt}
            />

            <AppTextField
              label="Cierre exclusivo (Bolivia)"
              onChange={(event) => setEndsAt(event.target.value)}
              required
              slotProps={{ inputLabel: { shrink: true } }}
              type="datetime-local"
              value={endsAt}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={enabled}
                  onChange={(event) => setEnabled(event.target.checked)}
                />
              }
              label="Habilitar la gestión al crearla"
            />

            <AppButton
              disabled={createMutation.isPending}
              type="submit"
              variant="contained"
            >
              Crear gestión
            </AppButton>
          </Stack>
        </CardContent>
      </Card>

      {updateMutation.isError ? (
        <Alert severity="error">
          {getUserFacingErrorMessage(
            updateMutation.error,
            'No se pudo actualizar la gestión académica. Inténtalo nuevamente.',
          )}
        </Alert>
      ) : null}

      <QueryState
        error={periodsQuery.error}
        isError={periodsQuery.isError}
        isPending={periodsQuery.isPending}
        onRetry={() => void periodsQuery.refetch()}
      />

      {periodsQuery.data?.map((period) => (
        <Card key={period.code} variant="outlined">
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ justifyContent: 'space-between' }}
            >
              <Stack spacing={0.5}>
                <Typography component="h2" variant="h6">
                  Gestión {period.code}
                </Typography>
                <Typography color="text.secondary">
                  Desde {formatBoliviaDate(period.enrollmentStartsAt)}
                </Typography>
                <Typography color="text.secondary">
                  Hasta {formatBoliviaDate(period.enrollmentEndsAt)} (exclusivo)
                </Typography>
                <StatusChip
                  label={period.enabled ? 'Habilitada' : 'Deshabilitada'}
                  tone={period.enabled ? 'success' : 'default'}
                  sx={{ alignSelf: 'start' }}
                />
              </Stack>

              <AppButton
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    periodCode: period.code,
                    enabled: period.enabled === false,
                  })
                }
                variant="outlined"
              >
                {period.enabled ? 'Deshabilitar' : 'Habilitar'}
              </AppButton>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  )
}
