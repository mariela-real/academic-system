export type UserRole = 'admin' | 'teacher' | 'student'

export type AuthUser = {
  id: string
  email: string
  fullName: string
  role: UserRole
}
