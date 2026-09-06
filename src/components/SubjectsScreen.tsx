import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ChevronRight,
  Target,
  FileSpreadsheet,
  X,
  Check,
  Award,
  AlertCircle
} from 'lucide-react';
import { Subject, Grade, SubjectCalculated } from '../types';
import { calculateSubjectDetails } from '../services/storage';

interface SubjectsScreenProps {
  subjects: Subject[];
  grades: Grade[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  onSelectSubjectForGrades: (subjectId: string) => void;
}

const PALETTE = ['#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#6366f1', '#14b8a6', '#f97316', '#ef4444'];

export const SubjectsScreen: React.FC<SubjectsScreenProps> = ({
  subjects,
  grades,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onSelectSubjectForGrades,
}) => {
  const [modalMode, setModalMode] = useState<'none' | 'add' | 'edit'>('none');
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Modal Form State
  const [name, setName] = useState('');
  const [coeff, setCoeff] = useState(2);
  const [target, setTarget] = useState(14);
  const [color, setColor] = useState(PALETTE[0]);

  // Selected subject modal for seeing grades preview
  const [activeSubjectDetails, setActiveSubjectDetails] = useState<SubjectCalculated | null>(null);

  const openAddModal = () => {
    setName('');
    setCoeff(2);
    setTarget(14);
    setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    setModalMode('add');
  };

  const openEditModal = (subject: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSubject(subject);
    setName(subject.name);
    setCoeff(subject.coefficient);
    setTarget(subject.targetGrade);
    setColor(subject.color || PALETTE[0]);
    setModalMode('edit');
  };

  const handleDelete = (subject: Subject, e: React.MouseEvent) => {
    e.stopPropagation();
    const count = grades.filter(g => g.subjectId === subject.id).length;
    const confirmMsg = count > 0
      ? `Supprimer la matière "${subject.name}" supprimera également ses ${count} note(s). Confirmer ?`
      : `Voulez-vous supprimer la matière "${subject.name}" ?`;

    if (window.confirm(confirmMsg)) {
      onDeleteSubject(subject.id);
      if (activeSubjectDetails?.subject.id === subject.id) {
        setActiveSubjectDetails(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (modalMode === 'add') {
      onAddSubject({
        name: name.trim(),
        coefficient: Math.max(1, Math.min(5, coeff)),
        targetGrade: Math.max(0, Math.min(20, target)),
        color,
      });
    } else if (modalMode === 'edit' && editingSubject) {
      onUpdateSubject({
        ...editingSubject,
        name: name.trim(),
        coefficient: Math.max(1, Math.min(5, coeff)),
        targetGrade: Math.max(0, Math.min(20, target)),
        color,
      });
    }

    setModalMode('none');
    setEditingSubject(null);
  };

  const calculatedSubjects = subjects.map(s => calculateSubjectDetails(s, grades));

  return (
    <div className="space-y-4 pb-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <span>Mes Matières</span>
          </h1>
          <p className="text-xs text-slate-500">
            {subjects.length} matière(s) enregistrée(s)
          </p>
        </div>

        <button
          id="btn-add-subject-top"
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle matière</span>
        </button>
      </div>

      {/* Cards List */}
      {calculatedSubjects.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Aucune matière configurée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Ajoutez vos matières pour commencer à saisir vos notes et calculer vos moyennes.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une matière</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {calculatedSubjects.map(item => {
            const { subject, hasGrades, currentAverage, status, grades: subGrades } = item;

            let badgeClass = 'bg-slate-100 text-slate-600 border-slate-200';
            let statusText = 'Non évalué';
            if (hasGrades) {
              if (status === 'green') {
                badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                statusText = 'Objectif atteint';
              } else if (status === 'yellow') {
                badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                statusText = 'Attention (Obj - 2)';
              } else {
                badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                statusText = 'En alerte';
              }
            }

            return (
              <div
                key={subject.id}
                onClick={() => setActiveSubjectDetails(item)}
                className="bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 shadow-sm transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-3.5 h-12 rounded-xl shrink-0 mt-0.5"
                      style={{ backgroundColor: subject.color || '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900 truncate">
                          {subject.name}
                        </h2>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded-lg border border-indigo-100">
                          Coef. {subject.coefficient}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${badgeClass}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Target className="w-3.5 h-3.5 text-indigo-500" />
                          Visé : <strong className="text-slate-800">{subject.targetGrade}/20</strong>
                        </span>
                        <span>•</span>
                        <span>{subGrades.length} évaluation(s)</span>
                      </div>
                    </div>
                  </div>

                  {/* Moyenne & Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-slate-900">
                        {hasGrades ? currentAverage.toFixed(2) : '--'}
                        <span className="text-xs text-slate-400 font-normal">/20</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => openEditModal(subject, e)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Modifier la matière"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(subject, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Supprimer la matière"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectSubjectForGrades(subject.id);
                        }}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        title="Gérer les notes"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Détails des notes de la matière (au clic sur une matière) */}
      {activeSubjectDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3.5 h-9 rounded-lg"
                  style={{ backgroundColor: activeSubjectDetails.subject.color || '#6366f1' }}
                />
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {activeSubjectDetails.subject.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Coef. {activeSubjectDetails.subject.coefficient} • Objectif : {activeSubjectDetails.subject.targetGrade}/20
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSubjectDetails(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Résumé des moyennes de la matière */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl mb-3 border border-slate-200/80 text-center">
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Moy. Interros</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  {activeSubjectDetails.interroAverage !== null ? `${activeSubjectDetails.interroAverage.toFixed(2)}` : '--'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-semibold block">Moy. Devoirs</span>
                <span className="text-sm font-bold text-slate-800 font-mono">
                  {activeSubjectDetails.devoirAverage !== null ? `${activeSubjectDetails.devoirAverage.toFixed(2)}` : '--'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block text-indigo-700">Moy. Matière</span>
                <span className="text-base font-black text-indigo-600 font-mono">
                  {activeSubjectDetails.hasGrades ? `${activeSubjectDetails.currentAverage.toFixed(2)}` : '--'}
                </span>
              </div>
            </div>

            {/* Liste des notes */}
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Évaluations ({activeSubjectDetails.grades.length})</span>
              <button
                onClick={() => {
                  onSelectSubjectForGrades(activeSubjectDetails.subject.id);
                  setActiveSubjectDetails(null);
                }}
                className="text-indigo-600 text-xs font-bold hover:underline"
              >
                + Ajouter une note
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {activeSubjectDetails.grades.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Aucune note saisie pour cette matière.
                </div>
              ) : (
                activeSubjectDetails.grades.map(g => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-800">
                          {g.title || g.type}
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                          {g.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">{g.date}</span>
                    </div>

                    <div className="text-right">
                      <span className={`text-base font-extrabold font-mono ${
                        g.value >= 14 ? 'text-emerald-600' : g.value >= 10 ? 'text-blue-600' : 'text-rose-600'
                      }`}>
                        {g.value.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">/20</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => {
                  onSelectSubjectForGrades(activeSubjectDetails.subject.id);
                  setActiveSubjectDetails(null);
                }}
                className="flex-1 bg-indigo-600 text-white font-bold py-2.5 rounded-2xl text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Saisir une nouvelle note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajout / Modification de Matière */}
      {modalMode !== 'none' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {modalMode === 'add' ? 'Ajouter une matière' : 'Modifier la matière'}
              </h3>
              <button
                onClick={() => setModalMode('none')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de la matière *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mathématiques, SVT, Philosophie"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-600"
                  autoFocus
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Coefficient (1 à 5) :</span>
                  <span className="text-indigo-600">{coeff}</span>
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCoeff(c)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        coeff === c
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Objectif visé sur 20 :</span>
                  <span className="text-emerald-600 font-extrabold">{target}/20</span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="20"
                  step="1"
                  value={target}
                  onChange={e => setTarget(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Couleur d'identification
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PALETTE.map(pColor => (
                    <button
                      key={pColor}
                      type="button"
                      onClick={() => setColor(pColor)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        color === pColor ? 'border-slate-950 scale-110 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: pColor }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalMode('none')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 rounded-xl text-xs transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold py-2 rounded-xl text-xs shadow-md shadow-indigo-600/30 transition-all"
                >
                  {modalMode === 'add' ? 'Ajouter' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
