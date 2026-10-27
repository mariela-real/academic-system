import {
  apiRequest,
  expectArray,
  expectRecord,
  expectString,
} from '../../../shared/api/client'
import type { AuthUser, UserRole } from '../types/auth-user'

export async function getCurrentUser(): Promise<AuthUser> {
  return parseAuthUser(await apiRequest('/auth/me'))
}

export async function getUsers(): Promise<AuthUser[]> {
  return expectArray(await apiRequest('/auth/users'), 'usuarios').map(
    parseAuthUser,
  )
}

export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  return parseAuthUser(
    await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  )
}

export async function logout(): Promise<void> {
  await apiRequest('/auth/logout', { method: 'POST' })
}

export async function createUser(input: {
  email: string
  fullName: string
  password: string
  role: UserRole
}): Promise<AuthUser> {
  return parseAuthUser(
    await apiRequest('/auth/users', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  )
}

function parseAuthUser(value: unknown): AuthUser {
  const record = expectRecord(value, 'usuario')
  const role = expectString(record.role, 'role')

  if (isUserRole(role) === false) {
    throw new Error('La API devolvió un rol de usuario inválido.')
  }

  return {
    id: expectString(record.id, 'id'),
    email: expectString(record.email, 'email'),
    fullName: expectString(record.fullName, 'fullName'),
    role,
  }
}

function isUserRole(role: string): role is UserRole {
  return role === 'admin' || role === 'teacher' || role === 'student'
}
