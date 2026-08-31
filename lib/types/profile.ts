export type UserRole = "admin" | "facilitator" | "mentor" | "student";
export type UserStatus = "invited" | "active" | "suspended" | "graduated";

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  status: UserStatus;
  avatarUrl?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
  selectedProgram?: string | null;
  programId?: string | null;
  specialization?: string | null;
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
  isPasswordChanged?: boolean;
}
