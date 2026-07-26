export interface Envelope<T> {
  data: T;
  error: ApiErrorBody | null;
  meta: Meta | null;
}

export interface ApiErrorBody {
  message: string;
  code: string;
  fields?: Record<string, string>;
}

export interface Meta {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  // grade summary meta
  gpa?: number | null;
  totalCredits?: number;
  count?: number;
  averageScore?: number | null;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  department: string | null;
  studentCount: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  dob: string;
  age: number | null;
  courseId: number;
  courseName: string | null;
  courseCode: string | null;
  enrollmentYear: number;
  status: string;
  archived: boolean;
  createdAt: string;
  gpa: number | null;
  academicStanding?: string;
  gradeCount: number;
  grades?: Grade[];
}

export interface Grade {
  id: number;
  studentId: number;
  subject: string;
  term: string;
  score: number;
  letter: string;
  credits: number;
  gradePoints: number;
  createdAt: string;
  studentName?: string;
}

export interface GradeSummary {
  gpa: number | null;
  totalCredits: number;
  count: number;
  averageScore: number | null;
}

export interface StudentInput {
  name: string;
  email: string;
  phone: string;
  dob: string;
  courseId: number;
  enrollmentYear: number;
}

export interface GradeInput {
  subject: string;
  term: string;
  score: number;
  credits: number;
  letter?: string;
}

export interface Stats {
  totalStudents: number;
  totalCourses: number;
  totalGrades: number;
  overallGpa: number | null;
  courseDistribution: { label: string; value: number }[];
  yearDistribution: { label: string; value: number }[];
  recentStudents: Student[];
  recentGrades: Grade[];
}
