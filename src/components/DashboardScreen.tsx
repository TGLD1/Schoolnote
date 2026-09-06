import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  Calendar,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  BellRing
} from 'lucide-react';
import { StudentProfile, Subject, Grade, SchoolEvent, SubjectCalculated, SubjectStatus } from '../types';
import { calculateGeneralStats } from '../services/storage';

interface DashboardScreenProps {
  profile: StudentProfile;
  subjects: Subject[];
  grades: Grade[];
  events: SchoolEvent[];
  onNavigateToGrades: (subjectId?: string) => void;
  onNavigateToSubjects: () => void;
  onNavigateToSchedule: () => void;
  onNavigateToStats: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  profile,
  subjects,
  grades,
  events,
  onNavigateToGrades,
  onNavigateToSubjects,
  onNavigateToSchedule,
  onNavigateToStats,
}) => {
  const [filterStatus, setFilterStatus] = useState<SubjectStatus | 'all'>('all');

  const {
    calculatedList,
    greenCount,
    yellowCount,
    redCount,
    totalCoeffs,
    totalPoints,
    generalAverage,
  } = calculateGeneralStats(subjects, grades);

  // Événements dans les 48h
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const upcoming48hEvents = events.filter(ev => {
    const evDate = new Date(ev.date + (ev.time ? `T${ev.time}` : 'T18:00'));
    return evDate >= now && evDate <= in48Hours;
  });

  // Calcul du cercle de progression (circonférence = 2 * PI * r)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = Math.min(20, Math.max(0, generalAverage)) / 20;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Filtrage des matières
  const filteredSubjects = calculatedList.filter(item => {
    if (filterStatus === 'all') return true;
    return item.status === filterStatus;
  });

  // Mentions scolaires Bénin
  const getMentionLabel = (avg: number) => {
    if (avg >= 16) return { text: 'Très Bien (Excellence)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (avg >= 14) return { text: 'Bien (Tableau d’Honneur)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (avg >= 12) return { text: 'Assez Bien (Encouragements)', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
    if (avg >= 10) return { text: 'Passable (Admis)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (avg >= 8) return { text: 'Insuffisant (Efforts requis)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { text: 'En difficulté (Soutien)', color: 'text-rose-700 bg-rose-50 border-rose-200' };
  };

  const mention = getMentionLabel(generalAverage);

  return (
    <div className="space-y-4 pb-12">
      {/* En-tête : "Bonjour [Prénom]" + moyenne générale */}
      <div className="bg-gradient-to-br from-indigo-700 via-indigo-800 to-indigo-950 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
        {/* Éléments décoratifs en arrière-plan */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-100 text-[11px] font-medium backdrop-blur-sm mb-1">
              <span>{profile.gradeLevel}</span>
              <span>•</span>
              <span className="truncate max-w-[150px]">{profile.term}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Bonjour {profile.firstName} 👋
            </h1>
            <p className="text-xs text-indigo-200/80 mt-0.5 truncate max-w-[260px]">
              {profile.schoolName}
            </p>
          </div>

          <button
            id="btn-quick-add-grade"
            type="button"
            onClick={() => onNavigateToGrades()}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-bold px-3 py-2 rounded-2xl shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Note</span>
          </button>
        </div>

        {/* Cercle de progression & Moyenne Générale */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center justify-between gap-4">
          <div className="flex-1">
            <span className="text-[11px] uppercase tracking-wider text-indigo-200 font-bold block">
              Moyenne Générale
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {generalAverage > 0 ? generalAverage.toFixed(2) : '--'}
              </span>
              <span className="text-base text-indigo-300 font-bold">/ 20</span>
            </div>

            <div className="mt-2">
              <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${mention.color}`}>
                {generalAverage > 0 ? mention.text : 'En attente de notes'}
              </span>
            </div>

            <div className="mt-2 text-[11px] text-indigo-200/80 flex items-center gap-3">
              <span>Total Points : <strong className="text-white">{totalPoints.toFixed(1)}</strong></span>
              <span>Coeffs : <strong className="text-white">{totalCoeffs}</strong></span>
            </div>
          </div>

          {/* Cercle SVG circulaire */}
          <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
              {/* Cercle d'arrière plan */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-indigo-900/60"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Cercle animé de progression */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={
                  generalAverage >= 14
                    ? '#10b981'
                    : generalAverage >= 10
                    ? '#f59e0b'
                    : '#ef4444'
                }
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-black text-white font-mono">
                {generalAverage > 0 ? generalAverage.toFixed(1) : '0'}
              </span>
              <span className="text-[10px] text-indigo-200 font-semibold">sur 20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerte des événements dans les 48h si existants */}
      {upcoming48hEvents.length > 0 && (
        <div
          onClick={onNavigateToSchedule}
          className="bg-amber-500/10 border border-amber-400/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-slate-800 cursor-pointer hover:bg-amber-500/15 transition-all shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <BellRing className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-amber-900">
                  Évaluation dans les 48h !
                </span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                  Rappel 18h
                </span>
              </div>
              <p className="text-xs text-amber-800 line-clamp-1">
                {upcoming48hEvents[0].title} ({upcoming48hEvents[0].date})
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-700 shrink-0" />
        </div>
      )}

      {/* 3 Cartes statistiques demandées : Vert, Jaune, Rouge */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Objectifs par matière
          </h2>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="text-xs text-indigo-600 font-bold hover:underline"
            >
              Afficher tout ({calculatedList.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Carte Verte */}
          <div
            onClick={() => setFilterStatus(filterStatus === 'green' ? 'all' : 'green')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer select-none text-center ${
              filterStatus === 'green'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                : 'bg-emerald-50/80 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950 shadow-sm'
            }`}
          >
            <div className="flex justify-center mb-1">
              <CheckCircle2
                className={`w-5 h-5 ${
                  filterStatus === 'green' ? 'text-white' : 'text-emerald-600'
                }`}
              />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono leading-none mb-1">
              {greenCount}
            </div>
            <div
              className={`text-[11px] font-bold leading-tight ${
                filterStatus === 'green' ? 'text-emerald-100' : 'text-emerald-800'
              }`}
            >
              Atteint
            </div>
            <div
              className={`text-[9px] mt-0.5 ${
                filterStatus === 'green' ? 'text-emerald-200' : 'text-emerald-600'
              }`}
            >
              Moyenne ≥ Obj.
            </div>
          </div>

          {/* Carte Jaune */}
          <div
            onClick={() => setFilterStatus(filterStatus === 'yellow' ? 'all' : 'yellow')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer select-none text-center ${
              filterStatus === 'yellow'
                ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-400/40'
                : 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-200 text-amber-950 shadow-sm'
            }`}
          >
            <div className="flex justify-center mb-1">
              <AlertTriangle
                className={`w-5 h-5 ${
                  filterStatus === 'yellow' ? 'text-slate-950' : 'text-amber-600'
                }`}
              />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono leading-none mb-1">
              {yellowCount}
            </div>
            <div
              className={`text-[11px] font-bold leading-tight ${
                filterStatus === 'yellow' ? 'text-amber-950 font-extrabold' : 'text-amber-800'
              }`}
            >
              À portée
            </div>
            <div
              className={`text-[9px] mt-0.5 ${
                filterStatus === 'yellow' ? 'text-amber-900' : 'text-amber-600'
              }`}
            >
              Obj - 2 ≤ Moy
            </div>
          </div>

          {/* Carte Rouge */}
          <div
            onClick={() => setFilterStatus(filterStatus === 'red' ? 'all' : 'red')}
            className={`p-3 rounded-2xl border transition-all cursor-pointer select-none text-center ${
              filterStatus === 'red'
                ? 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-400/40'
                : 'bg-rose-50/80 hover:bg-rose-100/70 border-rose-200 text-rose-950 shadow-sm'
            }`}
          >
            <div className="flex justify-center mb-1">
              <XCircle
                className={`w-5 h-5 ${
                  filterStatus === 'red' ? 'text-white' : 'text-rose-600'
                }`}
              />
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono leading-none mb-1">
              {redCount}
            </div>
            <div
              className={`text-[11px] font-bold leading-tight ${
                filterStatus === 'red' ? 'text-rose-100' : 'text-rose-800'
              }`}
            >
              En alerte
            </div>
            <div
              className={`text-[9px] mt-0.5 ${
                filterStatus === 'red' ? 'text-rose-200' : 'text-rose-600'
              }`}
            >
              Moy &lt; Obj - 2
            </div>
          </div>
        </div>
      </div>

      {/* Liste des matières */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Liste des matières ({filteredSubjects.length})</span>
          </h2>
          <button
            onClick={onNavigateToSubjects}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Gérer</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredSubjects.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
            Aucune matière ne correspond à ce filtre.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSubjects.map(item => {
              // Badge statut
              let badgeBg = 'bg-slate-100 text-slate-600 border-slate-200';
              let badgeText = 'Sans note';
              let dotColor = 'bg-slate-400';

              if (item.hasGrades) {
                if (item.status === 'green') {
                  badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  badgeText = 'Objectif atteint';
                  dotColor = 'bg-emerald-500';
                } else if (item.status === 'yellow') {
                  badgeBg = 'bg-amber-100 text-amber-900 border-amber-300';
                  badgeText = 'Attention';
                  dotColor = 'bg-amber-500';
                } else {
                  badgeBg = 'bg-rose-100 text-rose-800 border-rose-300';
                  badgeText = 'Alerte soutien';
                  dotColor = 'bg-rose-500';
                }
              }

              return (
                <div
                  key={item.subject.id}
                  onClick={() => onNavigateToGrades(item.subject.id)}
                  className="bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-indigo-300 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-sm transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Indicateur couleur matière */}
                    <div
                      className="w-3 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: item.subject.color || '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {item.subject.name}
                        </h3>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded-md shrink-0">
                          Coef. {item.subject.coefficient}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span>Obj: <strong className="text-slate-700">{item.subject.targetGrade}/20</strong></span>
                        <span>•</span>
                        <span>{item.grades.length} note(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Moyenne & Badge couleur */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold font-mono text-slate-900">
                        {item.hasGrades ? item.currentAverage.toFixed(2) : '--'}
                        <span className="text-xs text-slate-400 font-normal">/20</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 mt-0.5">
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        <span className="text-[10px] font-medium text-slate-600">
                          {badgeText}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Raccourci vers simulateur de moyenne */}
      <div
        onClick={onNavigateToStats}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-2xl p-4 flex items-center justify-between cursor-pointer shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Simulateur & Graphique
            </div>
            <div className="text-sm font-extrabold text-white">
              Si j'ai X au prochain devoir, ma moyenne devient... ?
            </div>
          </div>
        </div>
        <ArrowUpRight className="w-5 h-5 text-white/80" />
      </div>
    </div>
  );
};
