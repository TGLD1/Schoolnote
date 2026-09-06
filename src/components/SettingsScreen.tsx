import React, { useState, useRef } from 'react';
import {
  Settings,
  User,
  HardDrive,
  Download,
  Upload,
  FileText,
  Share2,
  Trash2,
  Sparkles,
  Check,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Save,
  CloudUpload
} from 'lucide-react';
import { StudentProfile, SubjectCalculated } from '../types';
import {
  BulletinExtra,
  exportBackupData,
  importBackupData,
  seedDemoData
} from '../services/storage';

interface SettingsScreenProps {
  profile: StudentProfile;
  subjectsCalculated: SubjectCalculated[];
  totalCoeffs: number;
  totalPoints: number;
  generalAverage: number;
  bulletinExtra: BulletinExtra;
  onUpdateProfile: (profile: StudentProfile) => void;
  onOpenBulletinModal: () => void;
  onReloadAllData: () => void;
  onResetAllData: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  profile,
  subjectsCalculated,
  totalCoeffs,
  totalPoints,
  generalAverage,
  bulletinExtra,
  onUpdateProfile,
  onOpenBulletinModal,
  onReloadAllData,
  onResetAllData,
}) => {
  // Form Profil state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [gradeLevel, setGradeLevel] = useState(profile.gradeLevel);
  const [schoolName, setSchoolName] = useState(profile.schoolName);
  const [academicYear, setAcademicYear] = useState(profile.academicYear);
  const [term, setTerm] = useState(profile.term);
  const [matricule, setMatricule] = useState(profile.matricule);
  const [gender, setGender] = useState(profile.gender);

  const [notification, setNotification] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: StudentProfile = {
      ...profile,
      firstName: firstName.trim() || 'Élève',
      lastName: lastName.trim(),
      gradeLevel: gradeLevel.trim(),
      schoolName: schoolName.trim(),
      academicYear: academicYear.trim(),
      term,
      matricule: matricule.trim(),
      gender,
    };
    onUpdateProfile(updated);
    setIsEditingProfile(false);
    showToast('Profil élève mis à jour avec succès !');
  };

  // Export Sauvegarde pour Google Drive / Local
  const handleExportBackup = () => {
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TGLD_School_Backup_${profile.lastName}_${new Date().toISOString().split('T')[0]}.tgld.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Fichier de sauvegarde téléchargé ! Vous pouvez l’enregistrer sur Google Drive.');
  };

  // Sauvegarde directe vers Google Drive (Web Intent / File Picker Save)
  const handleSaveToGoogleDrive = () => {
    // Proposer l'export json et guider vers drive.google.com
    const jsonStr = exportBackupData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const filename = `TGLD_School_Backup_${profile.lastName}.tgld.json`;
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Ouvre également Google Drive pour permettre le téléversement direct sans restriction backend
    window.open('https://drive.google.com/drive/my-drive', '_blank');
    showToast(`Sauvegarde prête (${filename}) et Google Drive ouvert pour import !`);
  };

  // Import Sauvegarde
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = importBackupData(content);
      if (success) {
        onReloadAllData();
        showToast('Données restaurées avec succès !');
      } else {
        alert('Le fichier sélectionné est invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 pb-14">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <span>Paramètres & Bulletin</span>
        </h1>
        <p className="text-xs text-slate-500">
          Gestion du compte élève, sauvegarde Google Drive et bulletin scolaire.
        </p>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* CARTE BULLETIN SCOLAIRE OFFICIEL DU BÉNIN */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Modèle Officiel République du Bénin</span>
            </div>
            <h2 className="text-lg font-black text-white">
              Bulletin Scolaire Numérique
            </h2>
            <p className="text-xs text-indigo-200/90 mt-1 max-w-sm">
              Tableau des disciplines, moyennes d'interrogations, devoirs, coefficients, décision du conseil et signatures.
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-white/15 flex flex-col sm:flex-row gap-2">
          <button
            id="btn-open-bulletin"
            type="button"
            onClick={onOpenBulletinModal}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-slate-950 font-extrabold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Voir & Générer le Bulletin PDF</span>
          </button>
        </div>
      </div>

      {/* Profil de l'Élève */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Profil de l'Élève
              </h3>
              <p className="text-[11px] text-slate-500">
                Identifiants figurant sur les relevés et le bulletin
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-all"
          >
            {isEditingProfile ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Classe
                </label>
                <input
                  type="text"
                  value={gradeLevel}
                  onChange={e => setGradeLevel(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Période / Trimestre
                </label>
                <select
                  value={term}
                  onChange={e => setTerm(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                >
                  <option value="1er Trimestre">1er Trimestre</option>
                  <option value="2ème Trimestre">2ème Trimestre</option>
                  <option value="3ème Trimestre">3ème Trimestre</option>
                  <option value="1er Semestre">1er Semestre</option>
                  <option value="2ème Semestre">2ème Semestre</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Établissement scolaire
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={e => setSchoolName(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Matricule
                </label>
                <input
                  type="text"
                  value={matricule}
                  onChange={e => setMatricule(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Année scolaire
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-sm"
              >
                Enregistrer le profil
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block">Élève :</span>
              <strong className="text-slate-900 font-bold">
                {profile.firstName} {profile.lastName}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Classe & Période :</span>
              <span className="text-slate-800 font-semibold">
                {profile.gradeLevel} ({profile.term})
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 text-[10px] block">Établissement :</span>
              <span className="text-slate-800">{profile.schoolName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Matricule :</span>
              <span className="text-slate-700 font-mono">{profile.matricule || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Année :</span>
              <span className="text-slate-700">{profile.academicYear}</span>
            </div>
          </div>
        )}
      </div>

      {/* SAUVEGARDE GOOGLE DRIVE & EXPORT LOCAL */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <CloudUpload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Sauvegarde & Google Drive
            </h3>
            <p className="text-[11px] text-slate-500">
              100% hors-ligne avec option d'export et synchronisation Google Drive
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={handleSaveToGoogleDrive}
            className="p-3 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 rounded-2xl text-left transition-all group flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <CloudUpload className="w-4 h-4 text-blue-600" />
                <span>Sauvegarder sur Google Drive</span>
              </div>
              <p className="text-[10px] text-blue-700/80 mt-0.5">
                Exporte votre fichier et ouvre Google Drive
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={handleExportBackup}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl text-left transition-all group flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <Download className="w-4 h-4 text-slate-600" />
                <span>Télécharger la Sauvegarde (.tgld)</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Export JSON complet pour copie de sécurité
              </p>
            </div>
          </button>
        </div>

        {/* Restauration */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,.tgld"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurer une sauvegarde antérieure</span>
          </button>

          <button
            onClick={() => {
              seedDemoData();
              onReloadAllData();
              showToast('Données démo Terminale C Bénin chargées !');
            }}
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Recharger données démo</span>
          </button>
        </div>
      </div>

      {/* Zone Danger : Réinitialisation */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-4 flex items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-rose-950">
            Réinitialiser l'application
          </h4>
          <p className="text-[11px] text-rose-800/80">
            Supprime toutes les notes, matières et événements locaux.
          </p>
        </div>

        <button
          onClick={() => {
            if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes vos données scolaires ? Cette action est irréversible.')) {
              onResetAllData();
            }
          }}
          className="bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold px-3 py-2 rounded-xl shrink-0 transition-all"
        >
          Réinitialiser
        </button>
      </div>

      {/* Mentions Légales, Auteur et Créateur */}
      <div className="text-center pt-2 text-xs text-slate-400 space-y-1">
        <div className="font-extrabold text-slate-700 flex items-center justify-center gap-1.5">
          <span>TGLD School V1</span>
          <span>•</span>
          <span className="text-indigo-600">Application mobile de suivi scolaire</span>
        </div>
        <p className="text-[11px]">
          Créé par <strong className="text-slate-800 font-bold">TGLD</strong> — Powered by <strong className="text-rose-600 font-bold">FASTEK</strong>
        </p>
        <p className="text-[10px] text-slate-400">
          100% hors-ligne • Données stockées localement en toute confidentialité • Conçu pour smartphones Android et ordinateurs.
        </p>
      </div>
    </div>
  );
};
