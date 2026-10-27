export type SubjectFormValues = {
  code: string
  name: string
  description: string
}

export type SubjectFormErrors = Partial<
  Record<keyof SubjectFormValues, string>
>

export function validateSubjectForm(
  values: SubjectFormValues,
): SubjectFormErrors {
  const errors: SubjectFormErrors = {}
  const code = values.code.trim()
  const name = values.name.trim()

  if (code.length === 0) {
    errors.code = 'El código es obligatorio.'
  } else if (code.length > 50) {
    errors.code = 'El código no puede superar 50 caracteres.'
  }

  if (name.length === 0) {
    errors.name = 'El nombre es obligatorio.'
  } else if (name.length > 150) {
    errors.name = 'El nombre no puede superar 150 caracteres.'
  }

  if (values.description.length > 2000) {
    errors.description = 'La descripción no puede superar 2000 caracteres.'
  }

  return errors
}
