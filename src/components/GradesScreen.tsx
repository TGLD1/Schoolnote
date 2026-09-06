import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileEdit,
  SlidersHorizontal,
  Bookmark,
  TrendingUp
} from 'lucide-react';
import { Subject, Grade, EvaluationType } from '../types';
import { calculateSubjectDetails } from '../services/storage';

interface GradesScreenProps {
  subjects: Subject[];
  grades: Grade[];
  initialSubjectId?: string;
  onAddGrade: (grade: Omit<Grade, 'id'>) => void;
  onDeleteGrade: (gradeId: string) => void;
}

export const GradesScreen: React.FC<GradesScreenProps> = ({
  subjects,
  grades,
  initialSubjectId,
  onAddGrade,
  onDeleteGrade,
}) => {
  // Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    if (initialSubjectId && subjects.some(s => s.id === initialSubjectId)) {
      return initialSubjectId;
    }
    return subjects.length > 0 ? subjects[0].id : '';
  });

  const [gradeValue, setGradeValue] = useState<number>(14);
  const [gradeType, setGradeType] = useState<EvaluationType>('Interrogation');
  const [evalDate, setEvalDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState<string>('');

  // Active filter for grades list
  const [listFilterSubjectId, setListFilterSubjectId] = useState<string>('all');

  const activeSubject = subjects.find(s => s.id === selectedSubjectId);

  // Instant calculated average for the selected subject (Live preview including current form value)
  const currentSubjectDetails = activeSubject
    ? calculateSubjectDetails(activeSubject, grades)
    : null;

  // Real-time simulated average if we add this note
  const simulatedGrades = activeSubject
    ? [
        ...grades,
        {
          id: 'simulated',
          subjectId: activeSubject.id,
          value: gradeValue,
          total: 20,
          type: gradeType,
          date: evalDate,
        },
      ]
    : grades;

  const simulatedDetails = activeSubject
    ? calculateSubjectDetails(activeSubject, simulatedGrades)
    : null;

  const handleStepValue = (delta: number) => {
    const next = Math.max(0, Math.min(20, Math.round((gradeValue + delta) * 4) / 4));
    setGradeValue(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      alert('Veuillez choisir une matière.');
      return;
    }

    onAddGrade({
      subjectId: selectedSubjectId,
      value: Math.max(0, Math.min(20, gradeValue)),
      total: 20,
      type: gradeType,
      date: evalDate,
      title: title.trim() || undefined,
    });

    // Reset title, keep subject for next entry
    setTitle('');
  };

  // Liste filtrée des notes
  const displayedGrades = grades.filter(g => {
    if (listFilterSubjectId === 'all') return true;
    return g.subjectId === listFilterSubjectId;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300 my-6">
        <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h3 className="text-base font-bold text-slate-800">Aucune matière disponible</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          Vous devez créer au moins une matière avant de pouvoir saisir des notes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-14">
      {/* Titre */}
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <FileEdit className="w-5 h-5 text-indigo-600" />
          <span>Saisie des Notes</span>
        </h1>
        <p className="text-xs text-slate-500">
          Enregistrement rapide avec calcul de moyenne en temps réel.
        </p>
      </div>

      {/* Formulaire de saisie */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Sélection de la matière */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Matière concernée *
            </label>
            <select
              id="select-grade-subject"
              value={selectedSubjectId}
              onChange={e => setSelectedSubjectId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-indigo-600"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} (Coef. {s.coefficient} • Objectif : {s.targetGrade}/20)
                </option>
              ))}
            </select>
          </div>

          {/* Saisie Valeur de la note (avec pas rapide et curseur) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">
                Note obtenue :
              </label>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black font-mono text-indigo-600">
                  {gradeValue.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 20</span>
              </div>
            </div>

            {/* Curseur et boutons de pas */}
            <input
              type="range"
              min="0"
              max="20"
              step="0.25"
              value={gradeValue}
              onChange={e => setGradeValue(parseFloat(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />

            <div className="flex items-center justify-between gap-1 mt-2.5">
              <button
                type="button"
                onClick={() => handleStepValue(-1)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs"
              >
                -1.0
              </button>
              <button
                type="button"
                onClick={() => handleStepValue(-0.5)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs"
              >
                -0.5
              </button>
              <div className="flex gap-1">
                {[10, 12, 14, 16, 18].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setGradeValue(val)}
                    className={`px-1.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      gradeValue === val
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleStepValue(+0.5)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs"
              >
                +0.5
              </button>
              <button
                type="button"
                onClick={() => handleStepValue(+1)}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 shadow-xs"
              >
                +1.0
              </button>
            </div>
          </div>

          {/* Type d'évaluation (Devoir, Interrogation, Autre) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Type d'évaluation *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Interrogation', 'Devoir', 'Autre'] as EvaluationType[]).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGradeType(type)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    gradeType === type
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {type === 'Interrogation' ? 'Interro (MI)' : type === 'Devoir' ? 'Devoir (DS)' : 'Autre (TP)'}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Intitulé */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date de l'évaluation
              </label>
              <input
                type="date"
                value={evalDate}
                onChange={e => setEvalDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Titre / Thème (facultatif)
              </label>
              <input
                type="text"
                placeholder="Ex: Complexes, Dissertation, TP 1"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          {/* Impact instantané en temps réel sur la moyenne et la couleur */}
          {activeSubject && currentSubjectDetails && (
            <div className="bg-gradient-to-r from-indigo-50 to-slate-50 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-600">Moyenne actuelle : </span>
                  <strong className="text-slate-900 font-mono">
                    {currentSubjectDetails.hasGrades ? `${currentSubjectDetails.currentAverage.toFixed(2)}/20` : 'Aucune'}
                  </strong>
                  {simulatedDetails && (
                    <span className="ml-2 text-indigo-700 font-semibold">
                      ➜ Devient : <strong className="font-mono text-sm">{simulatedDetails.currentAverage.toFixed(2)}/20</strong>
                    </span>
                  )}
                </div>
              </div>

              {simulatedDetails && (
                <div className="shrink-0">
                  {simulatedDetails.status === 'green' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3" /> Vert (Atteint)
                    </span>
                  )}
                  {simulatedDetails.status === 'yellow' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                      <AlertTriangle className="w-3 h-3" /> Jaune (Attention)
                    </span>
                  )}
                  {simulatedDetails.status === 'red' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                      <XCircle className="w-3 h-3" /> Rouge (Alerte)
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bouton d'enregistrement */}
          <button
            id="btn-save-grade"
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Enregistrer cette note</span>
          </button>
        </form>
      </div>

      {/* Historique des notes avec filtre */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-sm font-bold text-slate-800">
            Historique des notes ({displayedGrades.length})
          </h2>

          <select
            value={listFilterSubjectId}
            onChange={e => setListFilterSubjectId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 font-medium"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {displayedGrades.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 text-slate-400 text-xs">
            Aucune note enregistrée pour le moment.
          </div>
        ) : (
          <div className="space-y-2">
            {displayedGrades.map(grade => {
              const sub = subjects.find(s => s.id === grade.subjectId);
              const subName = sub ? sub.name : 'Matière';
              const subColor = sub?.color || '#6366f1';

              let scoreColor = 'text-slate-900';
              if (grade.value >= 14) scoreColor = 'text-emerald-600';
              else if (grade.value >= 10) scoreColor = 'text-blue-600';
              else scoreColor = 'text-rose-600';

              return (
                <div
                  key={grade.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2.5 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: subColor }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {subName}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold shrink-0">
                          {grade.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span>{grade.title || 'Note de cours'}</span>
                        <span>•</span>
                        <span>{grade.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className={`text-base font-black font-mono ${scoreColor}`}>
                        {grade.value.toFixed(2)}
                        <span className="text-xs text-slate-400 font-normal">/20</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Voulez-vous supprimer cette note ?')) {
                          onDeleteGrade(grade.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Supprimer la note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
