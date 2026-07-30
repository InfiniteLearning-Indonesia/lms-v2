export interface StudentProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  roles?: string[];
  status?: string | null;
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
  selectedProgram?: string | null;
  avatarUrl?: string | null;
  isPasswordChanged?: boolean;
}

export interface StudentDashboardProps {
  profile: StudentProfile;
  onProfileUpdate?: () => void;
}

export interface StudentClass {
  id: string;
  batchId: string;
  programId: string;
  mentorId?: string | null;
  batch?: {
    id: string;
    name: string;
    status: string;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
  };
  program?: {
    id: string;
    name: string;
    description?: string;
  };
  mentor?: {
    id: string;
    name: string;
    email?: string;
  };
  assignments?: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
  }[];
}
