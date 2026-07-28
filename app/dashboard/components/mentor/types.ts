export interface MentorProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  whatsapp?: string | null;
  institution?: string | null;
  studyProgram?: string | null;
  specialization?: string | null;
  selectedProgram?: string | null;
  avatarUrl?: string | null;
}

export interface MentorDashboardProps {
  profile?: MentorProfile;
  onProfileUpdate?: () => void;
}

export interface MentorClass {
  id: string;
  batchId: string;
  programId: string;
  mentorId?: string | null;
  enrolledStudentsCount?: number;
  enrolledStudents?: any[];
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
  materials?: {
    id: string;
    title: string;
    type?: string;
    competency?: string;
    url?: string;
    content?: string;
  }[];
  assignments?: {
    id: string;
    title: string;
    description?: string;
    competency?: string;
    dueDate?: string;
    submissionType?: string;
    weight?: number;
    submissions?: any[];
  }[];
  facilitators?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    whatsapp?: string | null;
    institution?: string | null;
    studyProgram?: string | null;
    selectedProgram?: string | null;
    status: string;
  }[];
}

export interface CompetencyItem {
  id: string;
  name: string;
  category: string;
  phase?: string;
  programId?: string;
  rubric?: any;
  programCompetency?: any;
}

export interface ProgramCompetency {
  id: string;
  name: string;
  category: string;
  phase?: string;
  programId?: string;
  syllabuses?: CompetencyItem[];
}
