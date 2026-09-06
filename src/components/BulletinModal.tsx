import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  FileText,
  Printer,
  Sparkles,
  Check,
  Award,
  Send,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentProfile, SubjectCalculated } from '../types';
import { BulletinExtra, saveBulletinExtra } from '../services/storage';
import { generateBeninBulletinPdf } from '../services/pdfGenerator';

interface BulletinModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  subjectsCalculated: SubjectCalculated[];
  totalCoeffs: number;
  totalPoints: number;
  generalAverage: number;
  initialExtra: BulletinExtra;
  onUpdateExtra: (extra: BulletinExtra) => void;
}

export const BulletinModal: React.FC<BulletinModalProps> = ({
  isOpen,
  onClose,
  profile,
  subjectsCalculated,
  totalCoeffs,
  totalPoints,
  generalAverage,
  initialExtra,
  onUpdateExtra,
}) => {
  const [extra, setExtra] = useState<BulletinExtra>(initialExtra);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFieldChange = <K extends keyof BulletinExtra>(field: K, value: BulletinExtra[K]) => {
    const updated = { ...extra, [field]: value };
    setExtra(updated);
    onUpdateExtra(updated);
    saveBulletinExtra(updated);
  };

  const handleDownloadPdf = () => {
    setIsGenerating(true);
    try {
      const doc = generateBeninBulletinPdf({
        profile,
        subjectsCalculated,
        totalCoeffs,
        totalPoints,
        generalAverage,
        extra,
      });

      const filename = `Bulletin_${profile.lastName}_${profile.firstName}_${profile.term.replace(/\s+/g, '_')}.pdf`;
      doc.save(filename);

      confetti({
        particleCount: 70,
        spread: 50,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Erreur génération PDF', err);
      alert('Erreur lors de la génération du bulletin PDF.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      const doc = generateBeninBulletinPdf({
        profile,
        subjectsCalculated,
        totalCoeffs,
        totalPoints,
        generalAverage,
        extra,
      });

      const blob = doc.output('blob');
      const filename = `Bulletin_${profile.lastName}_${profile.firstName}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Bulletin scolaire de ${profile.firstName} ${profile.lastName}`,
          text: `Voici mon bulletin du ${profile.term} (${profile.gradeLevel}) généré via TGLD School V1 (Powered by FASTEK). Moyenne générale : ${generalAverage.toFixed(2)}/20.`,
          files: [file],
        });
        setShareSuccess('Bulletin partagé avec succès !');
      } else {
        // Fallback WhatsApp message with download
        doc.save(filename);
        const text = encodeURIComponent(
          `*BULLETIN SCOLAIRE - TGLD School V1*\nÉlève : ${profile.firstName} ${profile.lastName}\nClasse : ${profile.gradeLevel} (${profile.schoolName})\nTrimestre : ${profile.term}\nMoyenne Générale : ${generalAverage.toFixed(2)}/20\nRang : ${extra.rank} sur ${extra.classSize}\nDécision : ${extra.councilDecision}\n\n_Créé par TGLD - Powered by FASTEK_`
        );
        window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
        setShareSuccess('PDF téléchargé et message WhatsApp préparé !');
      }
    } catch (err) {
      console.error('Erreur partage', err);
    }
  };

  const getMentionText = (avg: number) => {
    if (avg >= 16) return 'Très Bien (Félicitations)';
    if (avg >= 14) return 'Bien (Tableau d’Honneur)';
    if (avg >= 12) return 'Assez Bien (Encouragements)';
    if (avg >= 10) return 'Passable';
    if (avg >= 8) return 'Insuffisant';
    return 'Médiocre';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-indigo-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight">
                Bulletin Scolaire Officiel du Bénin
              </h2>
              <div className="text-[10px] text-indigo-200">
                Format conforme aux normes du Ministère des Enseignements Secondaire & Technique
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{isCustomizing ? 'Aperçu' : 'Personnaliser'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps : Aperçu authentique du Bulletin ou Formulaire de personnalisation */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-100">
          {shareSuccess && (
            <div className="mb-3 p-3 bg-emerald-100 text-emerald-900 rounded-2xl text-xs flex items-center gap-2 border border-emerald-300">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{shareSuccess}</span>
            </div>
          )}

          {isCustomizing ? (
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
                Données institutionnelles du bulletin
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rang de l'élève
                  </label>
                  <input
                    type="text"
                    value={extra.rank}
                    onChange={e => handleFieldChange('rank', e.target.value)}
                    placeholder="Ex: 4ème"
                    className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Effectif de la classe
                  </label>
                  <input
                    type="number"
                    value={extra.classSize}
                    onChange={e => handleFieldChange('classSize', parseInt(e.target.value) || 40)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Moyenne classe
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={extra.classAverage}
                    onChange={e => handleFieldChange('classAverage', parseFloat(e.target.value) || 10)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Plus forte moy.
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={extra.bestAverage}
                    onChange={e => handleFieldChange('bestAverage', parseFloat(e.target.value) || 16)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Plus faible moy.
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={extra.lowestAverage}
                    onChange={e => handleFieldChange('lowestAverage', parseFloat(e.target.value) || 6)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Absences justifiées (h)
                  </label>
                  <input
                    type="number"
                    value={extra.absencesJustified}
                    onChange={e => handleFieldChange('absencesJustified', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Absences non just. (h)
                  </label>
                  <input
                    type="number"
                    value={extra.absencesUnjustified}
                    onChange={e => handleFieldChange('absencesUnjustified', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Retards
                  </label>
                  <input
                    type="number"
                    value={extra.latenessCount}
                    onChange={e => handleFieldChange('latenessCount', parseInt(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Appréciation de la conduite
                </label>
                <input
                  type="text"
                  value={extra.conductAppreciation}
                  onChange={e => handleFieldChange('conductAppreciation', e.target.value)}
                  placeholder="Ex: Conduite exemplaire, travailleur et discipliné"
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Décision du Conseil de Classe
                </label>
                <input
                  type="text"
                  value={extra.councilDecision}
                  onChange={e => handleFieldChange('councilDecision', e.target.value)}
                  placeholder="Ex: Tableau d’Honneur avec Félicitations du Conseil"
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsCustomizing(false)}
                  className="w-full bg-indigo-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-indigo-700"
                >
                  Voir l'aperçu du bulletin
                </button>
              </div>
            </div>
          ) : (
            /* Feuille de Style Papier Officiel Béninois */
            <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 shadow-lg text-[11px] font-serif text-slate-900">
              {/* Drapeau Bénin Tricolore */}
              <div className="h-1.5 w-full flex mb-3 rounded-full overflow-hidden">
                <div className="flex-1 bg-emerald-600" />
                <div className="flex-1 bg-amber-400" />
                <div className="flex-1 bg-rose-600" />
              </div>

              {/* En-tête officiel Bénin */}
              <div className="flex items-start justify-between border-b border-slate-300 pb-3">
                <div className="leading-tight">
                  <div className="font-bold uppercase text-[10px] tracking-wide">
                    RÉPUBLIQUE DU BÉNIN
                  </div>
                  <div className="italic text-[9px] text-slate-600 mb-1">
                    Fraternité - Justice - Travail
                  </div>
                  <div className="text-[9px] font-sans text-slate-700 uppercase font-semibold">
                    Ministère des Enseignements Secondaire,
                    <br />
                    Technique et de la Formation Professionnelle
                  </div>
                  <div className="font-bold text-xs uppercase text-indigo-900 mt-1">
                    {profile.schoolName}
                  </div>
                </div>

                <div className="text-right leading-tight">
                  <div className="font-bold text-[10px]">
                    ANNÉE SCOLAIRE : {profile.academicYear}
                  </div>
                  <div className="mt-1 inline-block bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg">
                    <div className="font-sans font-black text-xs text-indigo-900">
                      BULLETIN DE NOTES
                    </div>
                    <div className="font-sans font-bold text-[10px] text-rose-600 uppercase">
                      {profile.term}
                    </div>
                  </div>
                </div>
              </div>

              {/* Encadré Élève */}
              <div className="my-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 font-sans text-xs">
                <div>
                  <span className="text-slate-500 text-[10px] block">Nom & Prénoms :</span>
                  <strong className="text-slate-900 uppercase">
                    {profile.lastName} {profile.firstName}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Classe :</span>
                  <strong className="text-slate-900">{profile.gradeLevel}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Matricule :</span>
                  <strong className="text-slate-900">{profile.matricule || 'N/A'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Effectif :</span>
                  <strong className="text-slate-900">{extra.classSize} élèves</strong>
                </div>
              </div>

              {/* Tableau officiel des notes */}
              <div className="overflow-x-auto my-3">
                <table className="w-full border-collapse border border-slate-300 font-sans text-[11px]">
                  <thead>
                    <tr className="bg-indigo-900 text-white text-[10px]">
                      <th className="border border-slate-300 p-1.5 text-left">Disciplines</th>
                      <th className="border border-slate-300 p-1.5 text-center">Moy. Int.</th>
                      <th className="border border-slate-300 p-1.5 text-center">Devoir</th>
                      <th className="border border-slate-300 p-1.5 text-center font-bold">Moyenne</th>
                      <th className="border border-slate-300 p-1.5 text-center">Coef.</th>
                      <th className="border border-slate-300 p-1.5 text-center">Points</th>
                      <th className="border border-slate-300 p-1.5 text-left">Appréciations & Visa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectsCalculated.map(s => {
                      let appreciation = extra.teacherRemarks[s.subject.name] || '';
                      if (!appreciation && s.hasGrades) {
                        if (s.currentAverage >= 14) appreciation = 'Très bon travail';
                        else if (s.currentAverage >= 10) appreciation = 'Passable, persévérer';
                        else appreciation = 'Efforts insuffisants';
                      }

                      return (
                        <tr key={s.subject.id} className="hover:bg-slate-50 border-b border-slate-200">
                          <td className="border border-slate-300 p-1.5 font-bold text-slate-900">
                            {s.subject.name}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-center font-mono">
                            {s.interroAverage !== null ? s.interroAverage.toFixed(2) : '-'}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-center font-mono">
                            {s.devoirAverage !== null ? s.devoirAverage.toFixed(2) : '-'}
                          </td>
                          <td className={`border border-slate-300 p-1.5 text-center font-mono font-bold ${
                            s.currentAverage < 10 ? 'text-rose-600' : 'text-slate-900'
                          }`}>
                            {s.hasGrades ? s.currentAverage.toFixed(2) : '-'}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-center font-bold">
                            {s.subject.coefficient}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-center font-mono">
                            {s.hasGrades ? (s.currentAverage * s.subject.coefficient).toFixed(2) : '-'}
                          </td>
                          <td className="border border-slate-300 p-1.5 text-[10px] text-slate-700 italic">
                            {appreciation}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                      <td colSpan={3} className="border border-slate-300 p-2 text-right">
                        TOTAUX & MOYENNE GÉNÉRALE :
                      </td>
                      <td className="border border-slate-300 p-2 text-center text-sm font-black font-mono text-indigo-700">
                        {generalAverage.toFixed(2)}/20
                      </td>
                      <td className="border border-slate-300 p-2 text-center">
                        {totalCoeffs}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-mono">
                        {totalPoints.toFixed(2)}
                      </td>
                      <td className="border border-slate-300 p-2 text-emerald-800 text-[10px]">
                        Mention : {getMentionText(generalAverage)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Bilan Classe & Discipline */}
              <div className="grid grid-cols-2 gap-3 my-3 text-[10px] font-sans">
                <div className="border border-slate-300 p-2 rounded-xl bg-slate-50">
                  <div className="font-bold text-indigo-900 mb-1 uppercase">
                    Bilan de la Classe
                  </div>
                  <div>• Rang : <strong>{extra.rank}</strong> sur {extra.classSize}</div>
                  <div>• Moyenne classe : {extra.classAverage.toFixed(2)}/20</div>
                  <div>• Plus forte / Plus faible : {extra.bestAverage.toFixed(2)} / {extra.lowestAverage.toFixed(2)}</div>
                </div>

                <div className="border border-slate-300 p-2 rounded-xl bg-slate-50">
                  <div className="font-bold text-indigo-900 mb-1 uppercase">
                    Discipline & Décision
                  </div>
                  <div>• Absences : {extra.absencesJustified}h (just.) / {extra.absencesUnjustified}h (injust.)</div>
                  <div>• Conduite : {extra.conductAppreciation}</div>
                  <div className="text-emerald-700 font-bold mt-0.5">
                    • Décision : {extra.councilDecision}
                  </div>
                </div>
              </div>

              {/* Signatures & Cachet */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-300 text-[9px] text-center font-sans">
                <div>
                  <div className="font-bold text-slate-800">Le Professeur Principal</div>
                  <div className="h-10 flex items-center justify-center text-slate-400 italic">
                    (Visa)
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-800">Le Chef d'Établissement</div>
                  <div className="h-10 border border-dashed border-indigo-300 rounded-lg flex flex-col items-center justify-center text-indigo-800 font-bold text-[8px] bg-indigo-50/50">
                    <span>RÉPUBLIQUE DU BÉNIN</span>
                    <span>★ VU & CERTIFIÉ ★</span>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-800">Visa des Parents</div>
                  <div className="h-10 flex items-center justify-center text-slate-400 italic">
                    (Signature)
                  </div>
                </div>
              </div>

              {/* Footer Mention TGLD & FASTEK */}
              <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500 font-sans">
                <div>
                  TGLD School V1 • Créé par <strong className="text-slate-800">TGLD</strong> — Powered by <strong className="text-rose-600">FASTEK</strong>
                </div>
                <div>
                  Édité le {new Date().toLocaleDateString('fr-FR')} (Bénin)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-white border-t border-slate-200 p-3.5 flex items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            Fermer
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSharePdf}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager (WhatsApp/Email)</span>
            </button>

            <button
              id="btn-download-pdf-bulletin"
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Création PDF...' : 'Télécharger Bulletin PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
