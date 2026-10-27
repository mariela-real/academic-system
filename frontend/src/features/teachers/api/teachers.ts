import { createUser, getUsers } from '../../auth/api/auth'
import type { AuthUser } from '../../auth/types/auth-user'

export type Teacher = AuthUser & { role: 'teacher' }

export async function getTeachers(): Promise<Teacher[]> {
  const users = await getUsers()

  return users.filter(isTeacherAccount)
}

export async function createTeacher(input: {
  email: string
  fullName: string
  password: string
}): Promise<Teacher> {
  const user = await createUser({ ...input, role: 'teacher' })

  if (isTeacherAccount(user) === false) {
    throw new Error('La API no registró la cuenta con el rol Docente.')
  }

  return user
}

function isTeacherAccount(user: AuthUser): user is Teacher {
  return user.role === 'teacher'
}
