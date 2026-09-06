import React from 'react';
import {
  X,
  User,
  LayoutDashboard,
  BookOpen,
  FileEdit,
  Calendar,
  TrendingUp,
  FileText,
  Settings,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { ScreenTab } from './BottomNavBar';
import { StudentProfile } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  profile: StudentProfile;
  generalAverage: number;
  onOpenBulletinModal: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  currentTab,
  onSelectTab,
  profile,
  generalAverage,
  onOpenBulletinModal,
}) => {
  if (!isOpen) return null;

  const navItems: Array<{ id: ScreenTab; label: string; icon: React.ElementType; desc: string }> = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, desc: 'Vue d’ensemble et moyennes' },
    { id: 'subjects', label: 'Mes Matières', icon: BookOpen, desc: 'Coefficients et objectifs' },
    { id: 'grades', label: 'Saisie des Notes', icon: FileEdit, desc: 'Interrogations et devoirs' },
    { id: 'schedule', label: 'Planning & Alertes', icon: Calendar, desc: 'Rappels 48h à 18h' },
    { id: 'stats', label: 'Statistiques & Simulateur', icon: TrendingUp, desc: 'Projections et courbes' },
    { id: 'settings', label: 'Paramètres & Sauvegarde', icon: Settings, desc: 'Profil et Google Drive' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-start">
      <div className="bg-white w-4/5 max-w-xs h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slide-in-left">
        {/* Drawer Header with Profile */}
        <div className="bg-gradient-to-br from-indigo-800 to-indigo-950 text-white p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>TGLD School V1</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center font-black text-lg text-white shadow-inner">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-black text-white truncate">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-xs text-indigo-200 truncate">
                {profile.gradeLevel} • {profile.schoolName}
              </p>
              <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.2 rounded-md">
                <span>Moyenne : {generalAverage > 0 ? generalAverage.toFixed(2) : '--'}/20</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                    : 'text-slate-700 hover:bg-slate-100 font-medium'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isActive ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs">{item.label}</div>
                  <div className="text-[10px] text-slate-400 font-normal">{item.desc}</div>
                </div>
              </button>
            );
          })}

          {/* Raccourci Bulletin Officiel Bénin */}
          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onOpenBulletinModal();
              }}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl p-3 text-left flex items-center gap-3 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-black text-white">Bulletin Scolaire Bénin</div>
                <div className="text-[10px] text-emerald-100">Format officiel imprimable</div>
              </div>
            </button>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Hors-ligne
            </span>
            <span>Version 1.0</span>
          </div>

          <div className="text-[10px] text-slate-400 leading-tight">
            Créé par <strong className="text-slate-700">TGLD</strong> • Powered by <strong className="text-rose-600">FASTEK</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
