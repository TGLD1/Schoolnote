import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Sparkles,
  Calculator,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  BookOpen,
  Sliders,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Subject, Grade, EvaluationType } from '../types';
import { calculateGeneralStats, calculateSubjectDetails } from '../services/storage';

interface StatsScreenProps {
  subjects: Subject[];
  grades: Grade[];
}

export const StatsScreen: React.FC<StatsScreenProps> = ({ subjects, grades }) => {
  // Simulator state
  const [simSubjectId, setSimSubjectId] = useState<string>(() => subjects[0]?.id || '');
  const [simGradeValue, setSimGradeValue] = useState<number>(15);
  const [simGradeType, setSimGradeType] = useState<EvaluationType>('Devoir');

  const { calculatedList, generalAverage, totalCoeffs, subjectsWithGrades } = useMemo(
    () => calculateGeneralStats(subjects, grades),
    [subjects, grades]
  );

  const selectedSimSubject = subjects.find(s => s.id === simSubjectId);

  // Évolution de la moyenne générale sur les 30 derniers jours (ou par note chronologique)
  const chartPoints = useMemo(() => {
    if (grades.length === 0) return [];

    // Trier les notes chronologiquement
    const sortedGrades = [...grades].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const points: Array<{ date: string; average: number; label: string }> = [];

    // Calculer la moyenne générale cumulative après chaque évaluation
    for (let i = 0; i < sortedGrades.length; i++) {
      const subset = sortedGrades.slice(0, i + 1);
      const stats = calculateGeneralStats(subjects, subset);
      points.push({
        date: sortedGrades[i].date,
        average: stats.generalAverage,
        label: `${sortedGrades[i].date} : ${stats.generalAverage.toFixed(2)}/20`,
      });
    }

    return points;
  }, [grades, subjects]);

  // Calcul du simulateur
  const simulationResult = useMemo(() => {
    if (!selectedSimSubject) return null;

    const currentDetails = calculateSubjectDetails(selectedSimSubject, grades);
    const beforeSubjectAvg = currentDetails.currentAverage;
    const beforeGeneralAvg = generalAverage;

    // Simulation avec la note ajoutée
    const hypotheticalGrades: Grade[] = [
      ...grades,
      {
        id: 'hypothetical',
        subjectId: selectedSimSubject.id,
        value: simGradeValue,
        total: 20,
        type: simGradeType,
        date: new Date().toISOString().split('T')[0],
      },
    ];

    const afterDetails = calculateSubjectDetails(selectedSimSubject, hypotheticalGrades);
    const afterGeneralStats = calculateGeneralStats(subjects, hypotheticalGrades);

    const subjectDiff = afterDetails.currentAverage - beforeSubjectAvg;
    const generalDiff = afterGeneralStats.generalAverage - beforeGeneralAvg;

    return {
      beforeSubjectAvg,
      afterSubjectAvg: afterDetails.currentAverage,
      subjectDiff: Math.round(subjectDiff * 100) / 100,
      beforeGeneralAvg,
      afterGeneralAvg: afterGeneralStats.generalAverage,
      generalDiff: Math.round(generalDiff * 100) / 100,
      targetReached: afterDetails.currentAverage >= selectedSimSubject.targetGrade,
      targetGrade: selectedSimSubject.targetGrade,
    };
  }, [selectedSimSubject, simGradeValue, simGradeType, grades, subjects, generalAverage]);

  // Meilleurs et moins bons résultats
  const sortedByAvg = [...calculatedList]
    .filter(s => s.hasGrades)
    .sort((a, b) => b.currentAverage - a.currentAverage);

  const bestSubject = sortedByAvg[0];
  const lowestSubject = sortedByAvg[sortedByAvg.length - 1];

  return (
    <div className="space-y-4 pb-14">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          <span>Statistiques & Simulateur</span>
        </h1>
        <p className="text-xs text-slate-500">
          Suivi de votre progression et projections pour les prochains devoirs.
        </p>
      </div>

      {/* Graphique de l'évolution de la moyenne générale */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span>Évolution de la Moyenne Générale</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Trajectoire au fil des {grades.length} évaluations enregistrées
            </p>
          </div>
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-xl border border-indigo-100">
            Actuelle : {generalAverage.toFixed(2)}/20
          </span>
        </div>

        {chartPoints.length < 2 ? (
          <div className="bg-slate-50 rounded-2xl p-6 text-center text-slate-400 text-xs border border-dashed border-slate-200">
            Saisissez au moins 2 notes pour afficher la courbe d'évolution temporelle.
          </div>
        ) : (
          <div className="relative pt-2">
            {/* SVG Interactive Line Chart */}
            <div className="w-full h-44">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grille horizontale (Notes 5, 10, 15, 20) */}
                {[0, 25, 50, 75, 100].map((pct, idx) => {
                  const y = 110 - (pct / 100) * 100;
                  const gradeMark = (pct / 100) * 20;
                  return (
                    <g key={idx}>
                      <line
                        x1="30"
                        y1={y}
                        x2="315"
                        y2={y}
                        stroke="#e2e8f0"
                        strokeWidth="0.8"
                        strokeDasharray={pct === 50 ? '0' : '2,2'}
                      />
                      <text x="24" y={y + 3} fill="#94a3b8" fontSize="7" textAnchor="end" fontWeight="bold">
                        {gradeMark}
                      </text>
                    </g>
                  );
                })}

                {/* Tracé de la ligne */}
                {(() => {
                  const xStart = 35;
                  const xEnd = 310;
                  const count = chartPoints.length;
                  const getX = (index: number) => xStart + (index / (count - 1)) * (xEnd - xStart);
                  const getY = (val: number) => 110 - (Math.min(20, Math.max(0, val)) / 20) * 100;

                  const lineCoords = chartPoints
                    .map((p, i) => `${getX(i)},${getY(p.average)}`)
                    .join(' ');

                  const areaCoords = `${getX(0)},110 ${lineCoords} ${getX(count - 1)},110`;

                  return (
                    <>
                      {/* Aire sous la courbe */}
                      <polygon points={areaCoords} fill="url(#chartGradient)" />

                      {/* Ligne principale */}
                      <polyline
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={lineCoords}
                      />

                      {/* Points */}
                      {chartPoints.map((pt, i) => (
                        <g key={i}>
                          <circle
                            cx={getX(i)}
                            cy={getY(pt.average)}
                            r="3.5"
                            fill="#ffffff"
                            stroke="#4f46e5"
                            strokeWidth="2"
                          />
                        </g>
                      ))}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
              <span>{chartPoints[0]?.date}</span>
              <span className="font-semibold text-slate-500">Progression globale</span>
              <span>{chartPoints[chartPoints.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>

      {/* SIMULATEUR : "Si j'ai X au prochain devoir, ma moyenne devient Y" */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">
              Simulateur de Notes Intelligente
            </h2>
            <p className="text-xs text-indigo-200/80">
              Calculez l'impact exact d'une prochaine évaluation sur vos moyennes.
            </p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <p className="text-xs text-indigo-300">Ajoutez des matières pour utiliser le simulateur.</p>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Sélecteur de matière */}
            <div>
              <label className="block text-xs font-bold text-indigo-200 mb-1">
                Choisir la matière à simuler :
              </label>
              <select
                value={simSubjectId}
                onChange={e => setSimSubjectId(e.target.value)}
                className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-400 font-semibold"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-900">
                    {s.name} (Coef. {s.coefficient} • Objectif : {s.targetGrade}/20)
                  </option>
                ))}
              </select>
            </div>

            {/* Type d'évaluation pour la simulation */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSimGradeType('Devoir')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  simGradeType === 'Devoir'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/10 text-slate-300'
                }`}
              >
                Devoir Surveillé (DS)
              </button>
              <button
                type="button"
                onClick={() => setSimGradeType('Interrogation')}
                className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                  simGradeType === 'Interrogation'
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-sm'
                    : 'bg-slate-900/60 border-white/10 text-slate-300'
                }`}
              >
                Interrogation (MI)
              </button>
            </div>

            {/* Slider de la note hypothétique X */}
            <div className="bg-white/10 border border-white/15 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-200">
                  Si j'obtiens la note X de :
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black font-mono text-amber-300">
                    {simGradeValue.toFixed(1)}
                  </span>
                  <span className="text-xs text-indigo-200">/ 20</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={simGradeValue}
                onChange={e => setSimGradeValue(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2.5 bg-slate-900 rounded-lg"
              />

              <div className="flex justify-between text-[10px] text-indigo-300 mt-1">
                <span>0</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            {/* Résultat de la simulation : Y et Z */}
            {simulationResult && selectedSimSubject && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/40 rounded-2xl p-4 space-y-3">
                <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-300">
                  Résultat de la simulation :
                </div>

                {/* Évolution Matière Y */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div>
                    <div className="text-xs text-indigo-200">
                      Moyenne en <strong>{selectedSimSubject.name}</strong> :
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Actuelle : {simulationResult.beforeSubjectAvg.toFixed(2)}/20
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-black font-mono text-white">
                      {simulationResult.afterSubjectAvg.toFixed(2)}
                      <span className="text-xs text-indigo-300">/20</span>
                    </div>
                    <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                      simulationResult.subjectDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {simulationResult.subjectDiff >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {simulationResult.subjectDiff >= 0 ? '+' : ''}
                        {simulationResult.subjectDiff.toFixed(2)} pt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Évolution Moyenne Générale Z */}
                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <div className="text-xs text-indigo-200">
                      Moyenne Générale Globale :
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Actuelle : {simulationResult.beforeGeneralAvg.toFixed(2)}/20
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-amber-300">
                      {simulationResult.afterGeneralAvg.toFixed(2)}
                      <span className="text-xs text-indigo-300">/20</span>
                    </div>
                    <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${
                      simulationResult.generalDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {simulationResult.generalDiff >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {simulationResult.generalDiff >= 0 ? '+' : ''}
                        {simulationResult.generalDiff.toFixed(2)} pt
                      </span>
                    </div>
                  </div>
                </div>

                {/* Objectif Atteint ? */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-indigo-200">
                    Objectif visé ({simulationResult.targetGrade}/20) :
                  </span>
                  {simulationResult.targetReached ? (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/40">
                      <CheckCircle className="w-3.5 h-3.5" /> Objectif Dépassé !
                    </span>
                  ) : (
                    <span className="text-amber-300 font-semibold">
                      À {(simulationResult.targetGrade - simulationResult.afterSubjectAvg).toFixed(2)} pt du but
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bento Récapitulatif : Matière forte vs Matière à soutenir */}
      <div className="grid grid-cols-2 gap-2.5">
        {bestSubject && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 mb-1">
              <Award className="w-4 h-4" />
              <span>Point Fort</span>
            </div>
            <div className="text-sm font-black text-slate-900 truncate">
              {bestSubject.subject.name}
            </div>
            <div className="text-base font-extrabold font-mono text-emerald-600 mt-1">
              {bestSubject.currentAverage.toFixed(2)}/20
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Coef. {bestSubject.subject.coefficient}
            </div>
          </div>
        )}

        {lowestSubject && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 mb-1">
              <Target className="w-4 h-4" />
              <span>Priorité Révision</span>
            </div>
            <div className="text-sm font-black text-slate-900 truncate">
              {lowestSubject.subject.name}
            </div>
            <div className="text-base font-extrabold font-mono text-rose-600 mt-1">
              {lowestSubject.currentAverage.toFixed(2)}/20
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Coef. {lowestSubject.subject.coefficient}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
