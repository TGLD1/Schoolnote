import {
  StudentProfile,
  Subject,
  Grade,
  SchoolEvent,
  SubjectCalculated,
  SubjectStatus
} from '../types';

const STORAGE_KEYS = {
  PROFILE: 'tgld_school_profile_v1',
  SUBJECTS: 'tgld_school_subjects_v1',
  GRADES: 'tgld_school_grades_v1',
  EVENTS: 'tgld_school_events_v1',
  BULLETIN_EXTRA: 'tgld_school_bulletin_extra_v1',
};

export const DEFAULT_PROPOSED_SUBJECTS: Array<{ name: string; coeff: number; target: number; color: string }> = [
  { name: 'Mathématiques', coeff: 4, target: 14, color: '#3b82f6' },
  { name: 'Français', coeff: 3, target: 13, color: '#ec4899' },
  { name: 'Anglais', coeff: 2, target: 14, color: '#8b5cf6' },
  { name: 'Physique-Chimie (PCT)', coeff: 4, target: 13, color: '#06b6d4' },
  { name: 'SVT (Biologie)', coeff: 3, target: 14, color: '#10b981' },
  { name: 'Histoire-Géographie', coeff: 2, target: 13, color: '#f59e0b' },
  { name: 'Philosophie', coeff: 2, target: 12, color: '#6366f1' },
  { name: 'EPS (Sport)', coeff: 1, target: 16, color: '#14b8a6' },
  { name: 'Espagnol / LV2', coeff: 2, target: 13, color: '#f97316' },
  { name: 'Informatique', coeff: 1, target: 15, color: '#0284c7' },
];

export const INITIAL_PROFILE: StudentProfile = {
  id: 'student_main',
  firstName: 'Koffi',
  lastName: 'AGBOSSA',
  gradeLevel: 'Terminale D',
  schoolName: 'Lycée Béhanzin de Porto-Novo',
  academicYear: '2024 - 2025',
  term: '1er Trimestre',
  matricule: 'TGLD-2024-042',
  gender: 'M',
  isOnboarded: false,
};

// Storage Helpers
export function loadProfile(): StudentProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load profile', e);
  }
  return INITIAL_PROFILE;
}

export function saveProfile(profile: StudentProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
}

export function loadSubjects(): Subject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load subjects', e);
  }
  return [];
}

export function saveSubjects(subjects: Subject[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects', e);
  }
}

export function loadGrades(): Grade[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GRADES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load grades', e);
  }
  return [];
}

export function saveGrades(grades: Grade[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
  } catch (e) {
    console.error('Failed to save grades', e);
  }
}

export function loadEvents(): SchoolEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load events', e);
  }
  return [];
}

export function saveEvents(events: SchoolEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  } catch (e) {
    console.error('Failed to save events', e);
  }
}

export interface BulletinExtra {
  classSize: number;
  classAverage: number;
  bestAverage: number;
  lowestAverage: number;
  rank: string;
  absencesJustified: number;
  absencesUnjustified: number;
  latenessCount: number;
  conductAppreciation: string;
  councilDecision: string;
  teacherRemarks: Record<string, string>;
}

export const DEFAULT_BULLETIN_EXTRA: BulletinExtra = {
  classSize: 45,
  classAverage: 11.85,
  bestAverage: 17.20,
  lowestAverage: 6.40,
  rank: '4ème',
  absencesJustified: 2,
  absencesUnjustified: 0,
  latenessCount: 1,
  conductAppreciation: 'Élève très sérieux, travailleur et assidu.',
  councilDecision: 'Tableau d’Honneur avec Félicitations du Conseil.',
  teacherRemarks: {
    'Mathématiques': 'Très bon raisonnement, poursuivez ainsi !',
    'Français': 'Bonne expression écrite et participation active.',
    'Physique-Chimie (PCT)': 'Bon travail en travaux pratiques et théorie.',
    'SVT (Biologie)': 'Excellente maîtrise des schémas d’expériences.',
    'Anglais': 'Bonne aisance à l’oral et bonne compréhension.',
    'Histoire-Géographie': 'Bonne analyse de documents historiques.',
    'Philosophie': 'Pensée structurée, continuez à développer vos arguments.',
  },
};

export function loadBulletinExtra(): BulletinExtra {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BULLETIN_EXTRA);
    if (raw) return { ...DEFAULT_BULLETIN_EXTRA, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Failed to load bulletin extra', e);
  }
  return DEFAULT_BULLETIN_EXTRA;
}

export function saveBulletinExtra(extra: BulletinExtra): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BULLETIN_EXTRA, JSON.stringify(extra));
  } catch (e) {
    console.error('Failed to save bulletin extra', e);
  }
}

/**
 * Calcul de la moyenne d'une matière selon la règle pédagogique officielle :
 * Au Bénin, la moyenne trimestrielle de la matière est généralement :
 * (Moyenne des Interrogations + 2 * Note du Devoir surveillé) / 3
 * Si seulement des interros ou seulement des devoirs existent, on calcule la moyenne arithmétique.
 */
export function calculateSubjectDetails(subject: Subject, allGrades: Grade[]): SubjectCalculated {
  const subjectGrades = allGrades.filter(g => g.subjectId === subject.id);

  if (subjectGrades.length === 0) {
    return {
      subject,
      grades: [],
      interroAverage: null,
      devoirAverage: null,
      currentAverage: 0,
      hasGrades: false,
      status: 'neutral',
      points: 0,
    };
  }

  const interros = subjectGrades.filter(g => g.type === 'Interrogation');
  const devoirs = subjectGrades.filter(g => g.type === 'Devoir');
  const autres = subjectGrades.filter(g => g.type === 'Autre');

  const interroAvg = interros.length > 0
    ? interros.reduce((sum, g) => sum + g.value, 0) / interros.length
    : null;

  const devoirAvg = devoirs.length > 0
    ? devoirs.reduce((sum, g) => sum + g.value, 0) / devoirs.length
    : null;

  let finalAverage = 0;

  if (interroAvg !== null && devoirAvg !== null) {
    // Règle classique béninoise : Moyenne Trimestrielle = (MI + 2*MD) / 3
    finalAverage = (interroAvg + 2 * devoirAvg) / 3;
  } else if (devoirAvg !== null) {
    finalAverage = devoirAvg;
  } else if (interroAvg !== null) {
    finalAverage = interroAvg;
  } else if (autres.length > 0) {
    finalAverage = autres.reduce((sum, g) => sum + g.value, 0) / autres.length;
  }

  // Arrondi à 2 décimales
  finalAverage = Math.round(finalAverage * 100) / 100;

  // Statut par rapport à l'objectif :
  // Vert: Moyenne >= objectif
  // Jaune: (objectif - 2) <= Moyenne < objectif
  // Rouge: Moyenne < (objectif - 2)
  let status: SubjectStatus = 'green';
  if (finalAverage >= subject.targetGrade) {
    status = 'green';
  } else if (finalAverage >= subject.targetGrade - 2) {
    status = 'yellow';
  } else {
    status = 'red';
  }

  return {
    subject,
    grades: subjectGrades,
    interroAverage: interroAvg !== null ? Math.round(interroAvg * 100) / 100 : null,
    devoirAverage: devoirAvg !== null ? Math.round(devoirAvg * 100) / 100 : null,
    currentAverage: finalAverage,
    hasGrades: true,
    status,
    points: Math.round(finalAverage * subject.coefficient * 100) / 100,
  };
}

export function calculateGeneralStats(subjects: Subject[], grades: Grade[]) {
  const calculatedList = subjects.map(s => calculateSubjectDetails(s, grades));
  const subjectsWithGrades = calculatedList.filter(c => c.hasGrades);

  let greenCount = 0;
  let yellowCount = 0;
  let redCount = 0;

  subjectsWithGrades.forEach(c => {
    if (c.status === 'green') greenCount++;
    else if (c.status === 'yellow') yellowCount++;
    else if (c.status === 'red') redCount++;
  });

  const totalCoeffs = subjectsWithGrades.reduce((sum, c) => sum + c.subject.coefficient, 0);
  const totalPoints = subjectsWithGrades.reduce((sum, c) => sum + c.points, 0);

  const generalAverage = totalCoeffs > 0
    ? Math.round((totalPoints / totalCoeffs) * 100) / 100
    : 0;

  return {
    calculatedList,
    subjectsWithGrades,
    greenCount,
    yellowCount,
    redCount,
    totalCoeffs,
    totalPoints: Math.round(totalPoints * 100) / 100,
    generalAverage,
  };
}

export function seedDemoData(): { subjects: Subject[]; grades: Grade[]; events: SchoolEvent[]; profile: StudentProfile } {
  const profile: StudentProfile = {
    id: 'demo_student',
    firstName: 'Bio',
    lastName: 'KORA',
    gradeLevel: 'Terminale C',
    schoolName: 'Lycée Mathieu Bouké de Parakou',
    academicYear: '2024 - 2025',
    term: '1er Trimestre',
    matricule: 'TGLD-BJ-902',
    gender: 'M',
    isOnboarded: true,
  };

  const subjects: Subject[] = [
    { id: 'sub_math', name: 'Mathématiques', coefficient: 5, targetGrade: 14, color: '#2563eb' },
    { id: 'sub_pct', name: 'Physique-Chimie (PCT)', coefficient: 4, targetGrade: 14, color: '#0891b2' },
    { id: 'sub_fr', name: 'Français', coefficient: 3, targetGrade: 13, color: '#db2777' },
    { id: 'sub_svt', name: 'SVT (Biologie)', coefficient: 3, targetGrade: 13, color: '#059669' },
    { id: 'sub_ang', name: 'Anglais', coefficient: 2, targetGrade: 15, color: '#7c3aed' },
    { id: 'sub_hg', name: 'Histoire-Géographie', coefficient: 2, targetGrade: 12, color: '#d97706' },
    { id: 'sub_philo', name: 'Philosophie', coefficient: 2, targetGrade: 12, color: '#4f46e5' },
    { id: 'sub_eps', name: 'EPS', coefficient: 1, targetGrade: 16, color: '#0d9488' },
  ];

  const now = new Date();
  const formatDaysAgo = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const grades: Grade[] = [
    // Mathématiques
    { id: 'g1', subjectId: 'sub_math', value: 15.5, total: 20, type: 'Interrogation', date: formatDaysAgo(22), title: 'Limites et Continuité' },
    { id: 'g2', subjectId: 'sub_math', value: 13.0, total: 20, type: 'Interrogation', date: formatDaysAgo(15), title: 'Dérivabilité' },
    { id: 'g3', subjectId: 'sub_math', value: 14.5, total: 20, type: 'Devoir', date: formatDaysAgo(8), title: 'Devoir Surveillé N°1' },

    // PCT
    { id: 'g4', subjectId: 'sub_pct', value: 12.0, total: 20, type: 'Interrogation', date: formatDaysAgo(20), title: 'Cinétique Chimique' },
    { id: 'g5', subjectId: 'sub_pct', value: 13.5, total: 20, type: 'Devoir', date: formatDaysAgo(6), title: 'Devoir Surveillé N°1' },

    // Français
    { id: 'g6', subjectId: 'sub_fr', value: 14.0, total: 20, type: 'Interrogation', date: formatDaysAgo(18), title: 'Figure de style & Poésie' },
    { id: 'g7', subjectId: 'sub_fr', value: 12.5, total: 20, type: 'Devoir', date: formatDaysAgo(5), title: 'Dissertation littéraire' },

    // SVT
    { id: 'g8', subjectId: 'sub_svt', value: 16.0, total: 20, type: 'Interrogation', date: formatDaysAgo(14), title: 'Génétique mendélienne' },
    { id: 'g9', subjectId: 'sub_svt', value: 15.0, total: 20, type: 'Devoir', date: formatDaysAgo(7), title: 'Devoir Surveillé N°1' },

    // Anglais
    { id: 'g10', subjectId: 'sub_ang', value: 16.5, total: 20, type: 'Interrogation', date: formatDaysAgo(12), title: 'Grammar & Vocabulary' },
    { id: 'g11', subjectId: 'sub_ang', value: 17.0, total: 20, type: 'Devoir', date: formatDaysAgo(4), title: 'Reading & Essay' },

    // Histoire-Géo
    { id: 'g12', subjectId: 'sub_hg', value: 11.5, total: 20, type: 'Interrogation', date: formatDaysAgo(16), title: 'La Décolonisation en Afrique' },
    { id: 'g13', subjectId: 'sub_hg', value: 12.0, total: 20, type: 'Devoir', date: formatDaysAgo(3), title: 'Devoir Surveillé N°1' },

    // Philo
    { id: 'g14', subjectId: 'sub_philo', value: 11.0, total: 20, type: 'Interrogation', date: formatDaysAgo(10), title: 'La Conscience et l’Inconscient' },
    { id: 'g15', subjectId: 'sub_philo', value: 11.5, total: 20, type: 'Devoir', date: formatDaysAgo(2), title: 'Commentaire de texte' },

    // EPS
    { id: 'g16', subjectId: 'sub_eps', value: 17.0, total: 20, type: 'Interrogation', date: formatDaysAgo(9), title: 'Course de vitesse (100m)' },
  ];

  const formatDaysAhead = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const events: SchoolEvent[] = [
    {
      id: 'ev1',
      title: 'Interrogation Écrite N°3 (Suites numériques)',
      date: formatDaysAhead(1), // dans les 48h!
      time: '08:00',
      subjectId: 'sub_math',
      type: 'Interrogation',
      description: 'Réviser les théorèmes de convergence et suites arithmético-géométriques.',
    },
    {
      id: 'ev2',
      title: 'Devoir Surveillé N°2 (Optique et Dosages)',
      date: formatDaysAhead(2), // dans les 48h!
      time: '10:30',
      subjectId: 'sub_pct',
      type: 'Devoir',
      description: 'Calculatrice scientifique obligatoire. Durée 3h.',
    },
    {
      id: 'ev3',
      title: 'Devoir de SVT (Immunologie)',
      date: formatDaysAhead(5),
      time: '15:00',
      subjectId: 'sub_svt',
      type: 'Devoir',
      description: 'Apporter crayons de couleur pour schémas de phagocytose.',
    },
    {
      id: 'ev4',
      title: 'Examen Blanc Régional de Mathématiques',
      date: formatDaysAhead(12),
      time: '07:30',
      subjectId: 'sub_math',
      type: 'Examen',
      description: 'Épreuve coef 5. Salle 14.',
    },
  ];

  saveProfile(profile);
  saveSubjects(subjects);
  saveGrades(grades);
  saveEvents(events);

  return { profile, subjects, grades, events };
}

export function exportBackupData(): string {
  const profile = loadProfile();
  const subjects = loadSubjects();
  const grades = loadGrades();
  const events = loadEvents();
  const bulletinExtra = loadBulletinExtra();

  const backup = {
    app: 'TGLD School V1',
    creator: 'TGLD - Powered by FASTEK',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: {
      profile,
      subjects,
      grades,
      events,
      bulletinExtra,
    },
  };

  return JSON.stringify(backup, null, 2);
}

export function importBackupData(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || !parsed.data) throw new Error('Format invalide');

    const { profile, subjects, grades, events, bulletinExtra } = parsed.data;

    if (profile) saveProfile(profile);
    if (subjects) saveSubjects(subjects);
    if (grades) saveGrades(grades);
    if (events) saveEvents(events);
    if (bulletinExtra) saveBulletinExtra(bulletinExtra);

    return true;
  } catch (err) {
    console.error('Erreur importation backup', err);
    return false;
  }
}
