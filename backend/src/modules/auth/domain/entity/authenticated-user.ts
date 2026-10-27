import { UserRole } from './user-role.js';

export type AuthenticatedUser = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
};
