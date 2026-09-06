import React, { useState, useEffect, useMemo } from 'react';
import {
  Menu,
  Bell,
  Sparkles,
  Smartphone,
  Maximize2,
  FileText,
  CheckCircle2,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import {
  StudentProfile,
  Subject,
  Grade,
  SchoolEvent
} from './types';
import {
  loadProfile,
  saveProfile,
  loadSubjects,
  saveSubjects,
  loadGrades,
  saveGrades,
  loadEvents,
  saveEvents,
  loadBulletinExtra,
  saveBulletinExtra,
  calculateGeneralStats,
  seedDemoData,
  BulletinExtra
} from './services/storage';

import { OnboardingScreen } from './components/OnboardingScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { SubjectsScreen } from './components/SubjectsScreen';
import { GradesScreen } from './components/GradesScreen';
import { ScheduleScreen } from './components/ScheduleScreen';
import { StatsScreen } from './components/StatsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNavBar, ScreenTab } from './components/BottomNavBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { BulletinModal } from './components/BulletinModal';
import { NotificationModal } from './components/NotificationModal';

export default function App() {
  // Application Data State
  const [profile, setProfile] = useState<StudentProfile>(loadProfile);
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects);
  const [grades, setGrades] = useState<Grade[]>(loadGrades);
  const [events, setEvents] = useState<SchoolEvent[]>(loadEvents);
  const [bulletinExtra, setBulletinExtra] = useState<BulletinExtra>(loadBulletinExtra);

  // Navigation & Modals State
  const [currentTab, setCurrentTab] = useState<ScreenTab>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBulletinModalOpen, setIsBulletinModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [targetSubjectForGrades, setTargetSubjectForGrades] = useState<string | undefined>(undefined);

  // Viewport mode: Smartphone Android frame or Full view
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Synchronisation avec le stockage local
  const refreshAllData = () => {
    setProfile(loadProfile());
    setSubjects(loadSubjects());
    setGrades(loadGrades());
    setEvents(loadEvents());
    setBulletinExtra(loadBulletinExtra());
  };

  // Calculs généraux
  const generalStats = useMemo(
    () => calculateGeneralStats(subjects, grades),
    [subjects, grades]
  );

  // Événements urgents dans les 48h
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const urgentEvents = useMemo(() => {
    return events.filter(ev => {
      const evDate = new Date(ev.date + (ev.time ? `T${ev.time}` : 'T18:00'));
      return evDate >= now && evDate <= in48Hours;
    });
  }, [events]);

  // Actions Sujet
  const handleAddSubject = (newSubject: Omit<Subject, 'id'>) => {
    const subject: Subject = {
      ...newSubject,
      id: `sub_${Date.now()}`,
    };
    const updated = [...subjects, subject];
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleUpdateSubject = (updatedSub: Subject) => {
    const updated = subjects.map(s => (s.id === updatedSub.id ? updatedSub : s));
    setSubjects(updated);
    saveSubjects(updated);
  };

  const handleDeleteSubject = (id: string) => {
    const updatedSubs = subjects.filter(s => s.id !== id);
    const updatedGrades = grades.filter(g => g.subjectId !== id);
    const updatedEvents = events.filter(e => e.subjectId !== id);

    setSubjects(updatedSubs);
    saveSubjects(updatedSubs);

    setGrades(updatedGrades);
    saveGrades(updatedGrades);

    setEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  // Actions Notes
  const handleAddGrade = (newGrade: Omit<Grade, 'id'>) => {
    const grade: Grade = {
      ...newGrade,
      id: `grade_${Date.now()}`,
    };
    const updated = [...grades, grade];
    setGrades(updated);
    saveGrades(updated);
  };

  const handleDeleteGrade = (gradeId: string) => {
    const updated = grades.filter(g => g.id !== gradeId);
    setGrades(updated);
    saveGrades(updated);
  };

  // Actions Planning
  const handleAddEvent = (newEvent: Omit<SchoolEvent, 'id'>) => {
    const event: SchoolEvent = {
      ...newEvent,
      id: `event_${Date.now()}`,
    };
    const updated = [...events, event];
    setEvents(updated);
    saveEvents(updated);
  };

  const handleDeleteEvent = (eventId: string) => {
    const updated = events.filter(e => e.id !== eventId);
    setEvents(updated);
    saveEvents(updated);
  };

  // Actions Onboarding
  const handleOnboardingComplete = (newProfile: StudentProfile, initialSubjects: Subject[]) => {
    setProfile(newProfile);
    saveProfile(newProfile);

    setSubjects(initialSubjects);
    saveSubjects(initialSubjects);

    setCurrentTab('dashboard');
  };

  const handleLoadDemo = () => {
    const demo = seedDemoData();
    setProfile(demo.profile);
    setSubjects(demo.subjects);
    setGrades(demo.grades);
    setEvents(demo.events);
    setCurrentTab('dashboard');
  };

  const handleResetAllData = () => {
    localStorage.clear();
    setProfile({
      id: 'student_main',
      firstName: '',
      lastName: '',
      gradeLevel: 'Terminale D',
      schoolName: 'Lycée Béhanzin de Porto-Novo',
      academicYear: '2024 - 2025',
      term: '1er Trimestre',
      matricule: '',
      gender: 'M',
      isOnboarded: false,
    });
    setSubjects([]);
    setGrades([]);
    setEvents([]);
    setCurrentTab('dashboard');
  };

  // Navigation helpers
  const navigateToGrades = (subjectId?: string) => {
    setTargetSubjectForGrades(subjectId);
    setCurrentTab('grades');
  };

  // Titres des écrans pour la barre supérieure
  const screenTitles: Record<ScreenTab, string> = {
    dashboard: 'Tableau de bord',
    subjects: 'Mes Matières',
    grades: 'Saisie des Notes',
    schedule: 'Planning & Rappels',
    stats: 'Statistiques & Simulateur',
    settings: 'Paramètres & Bulletin',
  };

  // Si pas encore configuré (premier lancement)
  if (!profile.isOnboarded && subjects.length === 0) {
    return (
      <OnboardingScreen
        onComplete={handleOnboardingComplete}
        onLoadDemo={handleLoadDemo}
      />
    );
  }

  // Contenu actif selon l'onglet
  const renderActiveScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardScreen
            profile={profile}
            subjects={subjects}
            grades={grades}
            events={events}
            onNavigateToGrades={navigateToGrades}
            onNavigateToSubjects={() => setCurrentTab('subjects')}
            onNavigateToSchedule={() => setCurrentTab('schedule')}
            onNavigateToStats={() => setCurrentTab('stats')}
          />
        );
      case 'subjects':
        return (
          <SubjectsScreen
            subjects={subjects}
            grades={grades}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onSelectSubjectForGrades={navigateToGrades}
          />
        );
      case 'grades':
        return (
          <GradesScreen
            subjects={subjects}
            grades={grades}
            initialSubjectId={targetSubjectForGrades}
            onAddGrade={handleAddGrade}
            onDeleteGrade={handleDeleteGrade}
          />
        );
      case 'schedule':
        return (
          <ScheduleScreen
            subjects={subjects}
            events={events}
            onAddEvent={handleAddEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        );
      case 'stats':
        return (
          <StatsScreen
            subjects={subjects}
            grades={grades}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            profile={profile}
            subjectsCalculated={generalStats.calculatedList}
            totalCoeffs={generalStats.totalCoeffs}
            totalPoints={generalStats.totalPoints}
            generalAverage={generalStats.generalAverage}
            bulletinExtra={bulletinExtra}
            onUpdateProfile={(p) => {
              setProfile(p);
              saveProfile(p);
            }}
            onOpenBulletinModal={() => setIsBulletinModalOpen(true)}
            onReloadAllData={refreshAllData}
            onResetAllData={handleResetAllData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col items-center ${isMobileFrame ? 'py-4 sm:py-8' : ''}`}>
      {/* Conteneur de l'application (adapté au format smartphone Material 3) */}
      <div
        className={`w-full bg-slate-50 min-h-screen relative flex flex-col transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[420px] rounded-[42px] border-[10px] border-slate-900 shadow-2xl overflow-hidden ring-1 ring-slate-800/30'
            : 'max-w-md shadow-md sm:border-x sm:border-slate-200'
        }`}
      >
        {/* Top App Bar Material Design 3 */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <button
              id="btn-open-drawer"
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 -ml-1.5 rounded-2xl hover:bg-slate-100 text-slate-700 active:scale-95 transition-all cursor-pointer"
              title="Menu principal"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded-md">
                  TGLD School
                </span>
                <span className="text-[9px] text-slate-400 font-semibold">V1</span>
              </div>
              <h1 className="text-sm font-black text-slate-900 leading-tight">
                {screenTitles[currentTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Cloche de notifications 48h */}
            <button
              id="btn-bell-notifications"
              type="button"
              onClick={() => setIsNotificationModalOpen(true)}
              className="p-2 rounded-2xl hover:bg-slate-100 text-slate-600 relative active:scale-95 transition-all cursor-pointer"
              title="Alertes 48h"
            >
              <Bell className="w-4 h-4" />
              {urgentEvents.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Basculer le mode cadre smartphone / plein écran */}
            <button
              type="button"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className="p-2 rounded-2xl hover:bg-slate-100 text-slate-500 hover:text-indigo-600 active:scale-95 transition-all"
              title={isMobileFrame ? 'Plein écran' : 'Cadre mobile Android'}
            >
              {isMobileFrame ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Zone de contenu principale défilable */}
        <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto">
          {renderActiveScreen()}
        </main>

        {/* Barre de navigation inférieure Material 3 */}
        <BottomNavBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          urgentEventsCount={urgentEvents.length}
        />

        {/* Tiroir de navigation latéral (Navigation Drawer) */}
        <NavigationDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          profile={profile}
          generalAverage={generalStats.generalAverage}
          onOpenBulletinModal={() => setIsBulletinModalOpen(true)}
        />

        {/* Modal du Bulletin Scolaire Béninois Officiel */}
        <BulletinModal
          isOpen={isBulletinModalOpen}
          onClose={() => setIsBulletinModalOpen(false)}
          profile={profile}
          subjectsCalculated={generalStats.calculatedList}
          totalCoeffs={generalStats.totalCoeffs}
          totalPoints={generalStats.totalPoints}
          generalAverage={generalStats.generalAverage}
          initialExtra={bulletinExtra}
          onUpdateExtra={(updated) => setBulletinExtra(updated)}
        />

        {/* Modal des alertes 48h et rappel WorkManager de 18h */}
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          urgentEvents={urgentEvents}
          subjects={subjects}
          onNavigateToSchedule={() => {
            setIsNotificationModalOpen(false);
            setCurrentTab('schedule');
          }}
        />
      </div>
    </div>
  );
}
