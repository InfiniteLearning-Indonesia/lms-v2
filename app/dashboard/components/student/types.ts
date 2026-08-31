import { Profile } from "@/lib/types/profile";

export type StudentProfile = Profile;

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
  importantLinks?: any[];
  program?: {
    id: string;
    name: string;
    description?: string;
    importantLinks?: any[];
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
