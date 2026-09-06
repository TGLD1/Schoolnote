import React, { useState } from 'react';
import {
  GraduationCap,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, Subject } from '../types';
import { DEFAULT_PROPOSED_SUBJECTS } from '../services/storage';

interface OnboardingScreenProps {
  onComplete: (profile: StudentProfile, subjects: Subject[]) => void;
  onLoadDemo: () => void;
}

const CLASS_OPTIONS = [
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  'Seconde A',
  'Seconde C',
  'Première A',
  'Première B',
  'Première C',
  'Première D',
  'Terminale A',
  'Terminale B',
  'Terminale C',
  'Terminale D',
  'Autre classe',
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onLoadDemo,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  // Form profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Terminale D');
  const [customGrade, setCustomGrade] = useState('');
  const [schoolName, setSchoolName] = useState('Lycée Béhanzin de Porto-Novo');
  const [academicYear, setAcademicYear] = useState('2024 - 2025');
  const [matricule, setMatricule] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');

  // Selected subjects state
  const [subjectsConfig, setSubjectsConfig] = useState<
    Array<{
      id: string;
      name: string;
      coefficient: number;
      targetGrade: number;
      selected: boolean;
      color: string;
    }>
  >(() =>
    DEFAULT_PROPOSED_SUBJECTS.map((item, idx) => ({
      id: `init_sub_${idx}`,
      name: item.name,
      coefficient: item.coeff,
      targetGrade: item.target,
      selected: idx < 7, // 7 premiers cochés par défaut
      color: item.color,
    }))
  );

  const [newSubName, setNewSubName] = useState('');
  const [newSubCoeff, setNewSubCoeff] = useState(2);
  const [newSubTarget, setNewSubTarget] = useState(14);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleToggleSubject = (id: string) => {
    setSubjectsConfig(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, selected: !sub.selected } : sub))
    );
  };

  const handleCoeffChange = (id: string, coeff: number) => {
    const valid = Math.max(1, Math.min(5, coeff));
    setSubjectsConfig(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, coefficient: valid } : sub))
    );
  };

  const handleTargetChange = (id: string, target: number) => {
    const valid = Math.max(0, Math.min(20, target));
    setSubjectsConfig(prev =>
      prev.map(sub => (sub.id === id ? { ...sub, targetGrade: valid } : sub))
    );
  };

  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    setSubjectsConfig(prev => [
      ...prev,
      {
        id: `custom_sub_${Date.now()}`,
        name: newSubName.trim(),
        coefficient: newSubCoeff,
        targetGrade: newSubTarget,
        selected: true,
        color: '#6366f1',
      },
    ]);

    setNewSubName('');
    setNewSubCoeff(2);
    setNewSubTarget(14);
    setIsAddingCustom(false);
  };

  const handleRemoveSubject = (id: string) => {
    setSubjectsConfig(prev => prev.filter(sub => sub.id !== id));
  };

  const handleFinish = () => {
    const finalGrade = gradeLevel === 'Autre classe' ? customGrade || 'Lycéen' : gradeLevel;
    const finalProfile: StudentProfile = {
      id: 'student_main',
      firstName: firstName.trim() || 'Élève',
      lastName: lastName.trim() || '',
      gradeLevel: finalGrade,
      schoolName: schoolName.trim() || 'Collège / Lycée',
      academicYear: academicYear.trim() || '2024 - 2025',
      term: '1er Trimestre',
      matricule: matricule.trim() || `TGLD-${Math.floor(1000 + Math.random() * 9000)}`,
      gender,
      isOnboarded: true,
    };

    const finalSubjects: Subject[] = subjectsConfig
      .filter(s => s.selected)
      .map(s => ({
        id: s.id,
        name: s.name,
        coefficient: s.coefficient,
        targetGrade: s.targetGrade,
        color: s.color,
      }));

    if (finalSubjects.length === 0) {
      alert('Veuillez sélectionner au moins une matière.');
      return;
    }

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }

    onComplete(finalProfile, finalSubjects);
  };

  const selectedCount = subjectsConfig.filter(s => s.selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-950 text-white flex flex-col justify-between p-4 sm:p-6">
      {/* En-tête de bienvenue */}
      <div className="max-w-md w-full mx-auto pt-4 pb-2 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 px-3.5 py-1 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>TGLD School V1</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-1">
          Bienvenue sur TGLD School
        </h1>
        <p className="text-sm text-indigo-200/80">
          Suivi scolaire 100% hors-ligne pour lycéens et collégiens.
        </p>
        <div className="text-[11px] text-indigo-300/60 mt-1 font-medium">
          Créé par <span className="text-white font-bold">TGLD</span> • Powered by{' '}
          <span className="text-rose-400 font-bold">FASTEK</span>
        </div>
      </div>

      {/* Contenu principal étape 1 ou 2 */}
      <div className="max-w-md w-full mx-auto bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl my-3">
        {step === 1 ? (
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Mon Profil Élève</h2>
                  <p className="text-xs text-indigo-200">Renseignez vos informations scolaires</p>
                </div>
              </div>
              <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-medium">
                Étape 1 / 2
              </span>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-indigo-200 mb-1">
                    Prénom *
                  </label>
                  <input
                    id="input-firstname"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Ex: Koffi"
                    className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-200 mb-1">
                    Nom de famille *
                  </label>
                  <input
                    id="input-lastname"
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Ex: AGBOSSA"
                    className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1">
                  Classe *
                </label>
                <select
                  id="select-gradelevel"
                  value={gradeLevel}
                  onChange={e => setGradeLevel(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
                >
                  {CLASS_OPTIONS.map(c => (
                    <option key={c} value={c} className="bg-slate-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
                {gradeLevel === 'Autre classe' && (
                  <input
                    type="text"
                    value={customGrade}
                    onChange={e => setCustomGrade(e.target.value)}
                    placeholder="Précisez votre classe"
                    className="mt-2 w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1">
                  Établissement scolaire
                </label>
                <input
                  id="input-schoolname"
                  type="text"
                  value={schoolName}
                  onChange={e => setSchoolName(e.target.value)}
                  placeholder="Ex: Lycée Béhanzin de Porto-Novo"
                  className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-indigo-200 mb-1">
                    Année scolaire
                  </label>
                  <input
                    id="input-academicyear"
                    type="text"
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    placeholder="2024 - 2025"
                    className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-indigo-200 mb-1">
                    Genre
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('M')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        gender === 'M'
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-slate-900/40 border-white/10 text-slate-300'
                      }`}
                    >
                      Masculin
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('F')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                        gender === 'F'
                          ? 'bg-pink-600 border-pink-400 text-white'
                          : 'bg-slate-900/40 border-white/10 text-slate-300'
                      }`}
                    >
                      Féminin
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-indigo-200 mb-1">
                  Numéro Matricule (facultatif)
                </label>
                <input
                  id="input-matricule"
                  type="text"
                  value={matricule}
                  onChange={e => setMatricule(e.target.value)}
                  placeholder="Ex: TGLD-2024-042"
                  className="w-full bg-slate-900/60 border border-white/20 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                id="btn-next-step"
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 active:scale-[0.98] text-white font-bold py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all text-sm"
              >
                <span>Choisir mes matières</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="btn-load-demo"
                type="button"
                onClick={onLoadDemo}
                className="w-full bg-slate-800/80 hover:bg-slate-800 border border-white/15 active:scale-[0.98] text-indigo-200 hover:text-white text-xs font-medium py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Charger un exemple complet (Terminale C Bénin)</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Matières & Objectifs</h2>
                  <p className="text-xs text-indigo-200">
                    Cochez et configurez vos coefficients et objectifs /20
                  </p>
                </div>
              </div>
              <span className="text-xs bg-emerald-500/30 text-emerald-200 px-2.5 py-0.5 rounded-full font-bold">
                {selectedCount} sélectionnée(s)
              </span>
            </div>

            {/* Liste défilable des matières */}
            <div className="max-h-[310px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
              {subjectsConfig.map(sub => (
                <div
                  key={sub.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    sub.selected
                      ? 'bg-indigo-950/70 border-indigo-400/50 shadow-sm'
                      : 'bg-slate-900/40 border-white/5 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={sub.selected}
                        onChange={() => handleToggleSubject(sub.id)}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 rounded-sm"
                      />
                      <span className="text-sm font-semibold text-white">
                        {sub.name}
                      </span>
                    </label>

                    {sub.selected && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Retirer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {sub.selected && (
                    <div className="mt-2.5 grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                      <div>
                        <div className="flex justify-between text-[11px] text-indigo-200 mb-0.5">
                          <span>Coefficient :</span>
                          <span className="font-bold text-amber-300">{sub.coefficient}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(c => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => handleCoeffChange(sub.id, c)}
                              className={`flex-1 py-1 text-xs rounded-lg font-bold transition-all ${
                                sub.coefficient === c
                                  ? 'bg-amber-500 text-slate-950 shadow'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] text-indigo-200 mb-0.5">
                          <span>Objectif visé :</span>
                          <span className="font-bold text-emerald-300">{sub.targetGrade}/20</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <input
                            type="range"
                            min="8"
                            max="20"
                            step="1"
                            value={sub.targetGrade}
                            onChange={e => handleTargetChange(sub.id, parseInt(e.target.value))}
                            className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Formulaire ajout personnalisé */}
            {isAddingCustom ? (
              <form onSubmit={handleAddCustomSubject} className="mt-3 p-3 bg-slate-900/80 rounded-2xl border border-indigo-400/40">
                <div className="text-xs font-bold text-indigo-200 mb-2">Ajouter une autre matière :</div>
                <input
                  type="text"
                  placeholder="Nom de la matière (ex: Économie, Musique)"
                  value={newSubName}
                  onChange={e => setNewSubName(e.target.value)}
                  className="w-full bg-slate-950 border border-white/20 rounded-xl px-2.5 py-1.5 text-xs text-white mb-2 focus:outline-none focus:border-indigo-400"
                  autoFocus
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <span className="text-[10px] text-slate-300">Coeff (1-5):</span>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={newSubCoeff}
                      onChange={e => setNewSubCoeff(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-white/20 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-300">Objectif /20:</span>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={newSubTarget}
                      onChange={e => setNewSubTarget(parseInt(e.target.value) || 10)}
                      className="w-full bg-slate-950 border border-white/20 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-1.5 rounded-xl text-xs font-bold text-white"
                  >
                    Ajouter
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="px-3 bg-slate-800 hover:bg-slate-700 py-1.5 rounded-xl text-xs text-slate-300"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingCustom(true)}
                className="mt-2.5 w-full py-1.5 border border-dashed border-indigo-400/40 rounded-xl text-xs text-indigo-300 hover:text-white hover:border-indigo-400 flex items-center justify-center gap-1.5 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une matière personnalisée</span>
              </button>
            )}

            <div className="mt-4 pt-3 border-t border-white/10 flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-semibold text-slate-300 transition-all"
              >
                Retour
              </button>
              <button
                id="btn-start-app"
                type="button"
                onClick={handleFinish}
                disabled={selectedCount === 0}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-extrabold py-2.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 text-sm transition-all"
              >
                <span>Commencer</span>
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pied de page */}
      <div className="max-w-md w-full mx-auto text-center pb-2">
        <div className="flex items-center justify-center gap-4 text-xs text-indigo-300/70">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            100% Hors-ligne
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            Lycée & Collège
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Bulletin Béninois
          </span>
        </div>
      </div>
    </div>
  );
};
