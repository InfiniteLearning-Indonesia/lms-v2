import { Profile } from "@/lib/types/profile";

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: "admin" | "facilitator" | "mentor" | "student";
  roles?: ("admin" | "facilitator" | "mentor" | "student")[];
  status: "invited" | "active" | "suspended" | "graduated";
  createdAt: string;
  lastLoginAt: string | null;
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
  selectedProgram?: string | null;
  specialization?: string | null;
  batches?: { id: string; name: string }[];
}

export interface AdminDashboardProps {
  profile?: Profile;
  onProfileUpdate?: () => void;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  batchId?: string;
  batchName?: string;
  batchesCount?: number;
  mentorsCount?: number;
  studentsCount?: number;
  activeBatch?: any;
  batch?: any;
  batches?: Batch[];
  mentors?: { id: string; name: string; email: string }[];
  students?: { id: string; name: string; email: string }[];
  isTranscriptReleased?: boolean;
  isCertificateReleased?: boolean;
}

export interface Batch {
  id: string;
  name: string;
  programId?: string;
  programName?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  status: "active" | "completed" | "upcoming" | "draft";
  studentsCount?: number;
  mentorsCount?: number;
  classCount?: number;
  studentCount?: number;
  description?: string;
  includedProgramIds?: string[];
  includedPrograms?: { id: string; name: string; mentorsCount?: number; studentsCount?: number }[];
  students?: { id: string; name: string; email: string }[];
  mentors?: { id: string; name: string; email: string }[];
}
