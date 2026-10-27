import { useRef, useState } from 'react'
import { Stack } from '@mui/material'
import type { AlertColor } from '@mui/material/Alert'
import type { FormEvent } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { getUserFacingErrorMessage } from '../../../shared/api/client'
import { SubjectForm } from '../components/SubjectForm'
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from '../api/subjects'
import type { Subject, SubjectInput } from '../api/subjects'
import { validateSubjectForm } from '../lib/subject-form'
import type {
  SubjectFormErrors,
  SubjectFormValues,
} from '../lib/subject-form'
import { AppButton } from '../../../shared/ui/AppButton'
import { AppNotification } from '../../../shared/ui/AppNotification'
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog'
import { DataTable } from '../../../shared/ui/DataTable'
import type { DataTableColumn } from '../../../shared/ui/DataTable'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ErrorState } from '../../../shared/ui/ErrorState'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { PageHeader } from '../../../shared/ui/PageHeader'

type SubjectNotification = {
  severity: AlertColor
  message: string
}

type SaveSubjectVariables = {
  subjectId: string | null
  input: SubjectInput
}

const EMPTY_FORM: SubjectFormValues = {
  code: '',
  name: '',
  description: '',
}

export function SubjectsPage() {
  const queryClient = useQueryClient()
  const codeInputRef = useRef<HTMLInputElement>(null)
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [formErrors, setFormErrors] = useState<SubjectFormErrors>({})
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null)
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)
  const [notification, setNotification] =
    useState<SubjectNotification | null>(null)
  const subjectsQuery = useQuery({
    queryKey: ['subjects'],
    queryFn: getSubjects,
  })
  const saveMutation = useMutation({
    mutationFn: ({ subjectId, input }: SaveSubjectVariables) =>
      subjectId === null
        ? createSubject(input)
        : updateSubject(subjectId, input),
    onSuccess: async (_subject, variables) => {
      setNotification({
        severity: 'success',
        message:
          variables.subjectId === null
            ? 'La materia se creó correctamente.'
            : 'Los cambios se guardaron correctamente.',
      })
      resetForm()
      await queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
    onError: (error) => {
      setNotification({
        severity: 'error',
        message: getUserFacingErrorMessage(
          error,
          'No se pudo guardar la materia. Verifica los datos e inténtalo nuevamente.',
        ),
      })
    },
  })
  const deleteMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: async () => {
      setSubjectToDelete(null)
      setNotification({
        severity: 'success',
        message: 'La materia se eliminó correctamente.',
      })
      await queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
    onError: (error) => {
      setNotification({
        severity: 'error',
        message: getUserFacingErrorMessage(
          error,
          'No se pudo eliminar la materia. Inténtalo nuevamente.',
        ),
      })
    },
  })

  const subjectColumns: DataTableColumn<Subject>[] = [
    {
      id: 'code',
      label: 'Código',
      renderCell: (subject) => subject.code,
    },
    {
      id: 'name',
      label: 'Nombre',
      renderCell: (subject) => subject.name,
    },
    {
      id: 'description',
      label: 'Descripción',
      renderCell: (subject) => subject.description ?? 'Sin descripción',
    },
    {
      id: 'actions',
      label: 'Acciones',
      align: 'right',
      renderCell: (subject) => (
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'flex-end' }}
        >
          <AppButton
            disabled={saveMutation.isPending || deleteMutation.isPending}
            onClick={() => startEditing(subject)}
            size="small"
          >
            Editar
          </AppButton>
          <AppButton
            color="error"
            disabled={saveMutation.isPending || deleteMutation.isPending}
            onClick={() => setSubjectToDelete(subject)}
            size="small"
          >
            Eliminar
          </AppButton>
        </Stack>
      ),
    },
  ]

  function resetForm() {
    setFormValues(EMPTY_FORM)
    setFormErrors({})
    setEditingSubjectId(null)
  }

  function startEditing(subject: Subject) {
    setFormValues({
      code: subject.code,
      name: subject.name,
      description: subject.description ?? '',
    })
    setFormErrors({})
    setEditingSubjectId(subject.id)
    setNotification(null)
    codeInputRef.current?.focus()
  }

  function updateFormField(field: keyof SubjectFormValues, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const errors = validateSubjectForm(formValues)
    setFormErrors(errors)

    if (Object.keys(errors).length > 0) {
      return
    }

    const input: SubjectInput = {
      code: formValues.code.trim(),
      name: formValues.name.trim(),
      description: formValues.description.trim(),
    }

    setNotification(null)
    saveMutation.mutate({ subjectId: editingSubjectId, input })
  }

  function confirmDelete() {
    if (subjectToDelete === null) {
      return
    }

    deleteMutation.mutate(subjectToDelete.id)
  }

  return (
    <Stack spacing={2.5}>
      <PageHeader
        actions={
          <AppButton
            onClick={() => codeInputRef.current?.focus()}
            variant="outlined"
          >
            Ir al formulario
          </AppButton>
        }
        description="Administra las materias que componen la oferta académica."
        title="Materias"
      />

      <SubjectForm
        codeInputRef={codeInputRef}
        errors={formErrors}
        isEditing={editingSubjectId !== null}
        isPending={saveMutation.isPending}
        onCancel={resetForm}
        onFieldChange={updateFormField}
        onSubmit={handleSubmit}
        values={formValues}
      />

      {subjectsQuery.isPending ? (
        <LoadingState message="Cargando materias..." />
      ) : null}

      {subjectsQuery.isError ? (
        <ErrorState
          error={subjectsQuery.error}
          onRetry={() => void subjectsQuery.refetch()}
        />
      ) : null}

      {subjectsQuery.data?.length === 0 ? (
        <EmptyState
          description="Registra la primera materia para que aparezca en la oferta académica."
          title="Todavía no hay materias"
        />
      ) : null}

      {subjectsQuery.data && subjectsQuery.data.length > 0 ? (
        <DataTable
          ariaLabel="Materias registradas"
          columns={subjectColumns}
          getRowId={(subject) => subject.id}
          rows={subjectsQuery.data}
        />
      ) : null}

      <ConfirmDialog
        confirmLabel="Eliminar materia"
        description={
          subjectToDelete === null
            ? ''
            : `Se eliminará ${subjectToDelete.code} · ${subjectToDelete.name}. Si tiene cursos asociados, el servidor rechazará la operación.`
        }
        isPending={deleteMutation.isPending}
        onCancel={() => setSubjectToDelete(null)}
        onConfirm={confirmDelete}
        open={subjectToDelete !== null}
        title="¿Eliminar esta materia?"
      />

      <AppNotification
        message={notification?.message ?? ''}
        onClose={() => setNotification(null)}
        open={notification !== null}
        severity={notification?.severity ?? 'success'}
      />
    </Stack>
  )
}
