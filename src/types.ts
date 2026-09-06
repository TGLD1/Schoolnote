export type EvaluationType = 'Devoir' | 'Interrogation' | 'Autre';

export type TermPeriod = '1er Trimestre' | '2ème Trimestre' | '3ème Trimestre' | '1er Semestre' | '2ème Semestre';

export interface Grade {
  id: string;
  subjectId: string;
  value: number; // 0 - 20
  total: number; // usually 20
  type: EvaluationType;
  date: string; // YYYY-MM-DD
  title?: string;
  coefficient?: number; // evaluation coeff, default 1
}

export interface Subject {
  id: string;
  name: string;
  coefficient: number; // 1 to 5
  targetGrade: number; // Objectif visé sur 20 (ex: 14)
  color?: string; // hex or tailwind class
  iconName?: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD or ISO
  time?: string; // HH:mm
  subjectId: string;
  type: 'Devoir' | 'Interrogation' | 'Examen' | 'Révision' | 'Autre';
  description?: string;
}

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  gradeLevel: string; // e.g. "Terminale D", "3ème", "Seconde C"
  schoolName: string; // e.g. "Lycée Béhanzin (Porto-Novo)"
  academicYear: string; // e.g. "2024 - 2025"
  term: TermPeriod;
  matricule: string;
  gender: 'M' | 'F';
  isOnboarded: boolean;
}

export type SubjectStatus = 'green' | 'yellow' | 'red' | 'neutral';

export interface SubjectCalculated {
  subject: Subject;
  grades: Grade[];
  interroAverage: number | null;
  devoirAverage: number | null;
  currentAverage: number;
  hasGrades: boolean;
  status: SubjectStatus;
  points: number; // currentAverage * coefficient
}

export interface BulletinData {
  profile: StudentProfile;
  subjectsCalculated: SubjectCalculated[];
  totalCoefficients: number;
  totalPoints: number;
  generalAverage: number;
  rank?: string;
  classSize?: number;
  classAverage?: number;
  bestAverage?: number;
  lowestAverage?: number;
  absencesJustified: number;
  absencesUnjustified: number;
  latenessCount: number;
  conductAppreciation: string;
  councilDecision: string;
}
