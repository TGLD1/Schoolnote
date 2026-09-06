import React from 'react';
import {
  X,
  BellRing,
  Calendar,
  Clock,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SchoolEvent, Subject } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  urgentEvents: SchoolEvent[];
  subjects: Subject[];
  onNavigateToSchedule: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  urgentEvents,
  subjects,
  onNavigateToSchedule,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Alertes 48h & Rappel 18h
              </h3>
              <p className="text-[10px] text-slate-500">
                Évaluations imminentes à réviser
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {urgentEvents.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-slate-800">Aucune évaluation dans les 48h !</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Vous êtes à jour dans votre planning.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {urgentEvents.map(ev => {
              const sub = subjects.find(s => s.id === ev.subjectId);

              return (
                <div
                  key={ev.id}
                  className="p-3 bg-amber-50/60 border border-amber-300/80 rounded-2xl text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-full">
                      {ev.type}
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-2 text-[11px]">
                    <span className="font-semibold text-slate-800">{sub?.name || 'Matière'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      {ev.date} {ev.time && `à ${ev.time}`}
                    </span>
                  </div>
                  {ev.description && (
                    <p className="text-[10px] text-slate-600 italic">
                      {ev.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-[11px] text-slate-600">
          <strong className="text-slate-900">Rappel quotidien WorkManager :</strong> Une notification de révision est planifiée chaque jour à 18h00 pour les évaluations des prochaines 48 heures.
        </div>

        <button
          onClick={() => {
            onClose();
            onNavigateToSchedule();
          }}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-2xl text-xs transition-all"
        >
          Ouvrir le Planning complet
        </button>
      </div>
    </div>
  );
};
