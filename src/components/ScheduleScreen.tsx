import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Bell,
  BellRing,
  Trash2,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Send,
  Sparkles,
  Layers
} from 'lucide-react';
import { Subject, SchoolEvent } from '../types';

interface ScheduleScreenProps {
  subjects: Subject[];
  events: SchoolEvent[];
  onAddEvent: (event: Omit<SchoolEvent, 'id'>) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({
  subjects,
  events,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | '48h' | 'devoirs'>('all');
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('08:00');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [type, setType] = useState<SchoolEvent['type']>('Devoir');
  const [description, setDescription] = useState('');

  // 48h calculation
  const now = new Date();
  const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const isWithin48h = (evDateStr: string, evTimeStr?: string) => {
    const d = new Date(evDateStr + (evTimeStr ? `T${evTimeStr}` : 'T18:00'));
    return d >= now && d <= in48Hours;
  };

  const upcoming48hList = events.filter(e => isWithin48h(e.date, e.time));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    onAddEvent({
      title: title.trim(),
      date,
      time,
      subjectId,
      type,
      description: description.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setIsAdding(false);
  };

  // Test du rappel de 18h (Simulation WorkManager & Notification API)
  const handleTrigger18hNotification = async () => {
    setTestNotificationSent(true);

    const message = upcoming48hList.length > 0
      ? `🔔 TGLD School (Rappel 18h) : Vous avez "${upcoming48hList[0].title}" le ${upcoming48hList[0].date} ! Préparez vos révisions.`
      : `🔔 TGLD School (Rappel 18h) : Pensez à réviser vos leçons pour demain !`;

    // Try browser notification if permitted
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('TGLD School - Rappel de 18h', {
          body: message,
          icon: '/favicon.ico',
        });
      } else if (Notification.permission !== 'denied') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification('TGLD School - Rappel de 18h', {
            body: message,
            icon: '/favicon.ico',
          });
        }
      }
    }

    setTimeout(() => {
      setTestNotificationSent(false);
    }, 5000);
  };

  // Filtrage des événements
  const filteredEvents = events.filter(ev => {
    if (filterMode === '48h') return isWithin48h(ev.date, ev.time);
    if (filterMode === 'devoirs') return ev.type === 'Devoir' || ev.type === 'Examen';
    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-4 pb-14">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" />
            <span>Planning & Événements</span>
          </h1>
          <p className="text-xs text-slate-500">
            Évaluations prévues et alertes automatiques 48h (Rappel 18h).
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-2xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Fermer' : 'Ajouter'}</span>
        </button>
      </div>

      {/* Bannière de rappel automatique 48h / WorkManager */}
      <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/10 border border-amber-400/40 rounded-3xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                  Rappels automatiques WorkManager
                </h3>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  18h00 chaque jour
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-0.5">
                Les évaluations des <strong>48h à venir</strong> déclenchent une notification quotidienne à 18h pour planifier vos révisions.
              </p>
              {upcoming48hList.length > 0 && (
                <div className="mt-2 text-xs font-bold text-amber-950 bg-amber-200/60 px-2.5 py-1 rounded-xl inline-block">
                  ⚡ {upcoming48hList.length} évaluation(s) urgente(s) dans les prochaines 48h !
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleTrigger18hNotification}
            className="shrink-0 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            <span>Tester rappel 18h</span>
          </button>
        </div>

        {testNotificationSent && (
          <div className="mt-3 p-2.5 bg-emerald-600 text-white rounded-xl text-xs flex items-center gap-2 animate-fade-in shadow-md">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Notification WorkManager envoyée avec succès pour 18h00 !</span>
          </div>
        )}
      </div>

      {/* Formulaire d'ajout rapide */}
      {isAdding && (
        <div className="bg-white border border-indigo-200 rounded-3xl p-4 sm:p-5 shadow-md">
          <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Ajouter une évaluation ou un événement</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Titre de l'évaluation *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Devoir Surveillé N°2 (Trigonométrie)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Matière associée *
                </label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type d'événement
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as SchoolEvent['type'])}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="Devoir">Devoir Surveillé (DS)</option>
                  <option value="Interrogation">Interrogation Écrite (IE)</option>
                  <option value="Examen">Examen Blanc</option>
                  <option value="Révision">Séance de Révision</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date de l'évaluation *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Heure (facultatif)
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Consignes ou chapitres à réviser
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Chapitre 4 et 5. Matériel : calculatrice et compas."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-slate-100 text-slate-700 font-semibold py-2 rounded-xl text-xs"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs shadow-md shadow-indigo-600/30"
              >
                Enregistrer l'événement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtres d'affichage */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tous ({events.length})
        </button>

        <button
          onClick={() => setFilterMode('48h')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterMode === '48h'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          <span>Dans les 48h ({upcoming48hList.length})</span>
        </button>

        <button
          onClick={() => setFilterMode('devoirs')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'devoirs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
          }`}
        >
          Devoirs & Examens
        </button>
      </div>

      {/* Liste des événements */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-slate-300">
          <CalendarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">Aucun événement à venir</h3>
          <p className="text-xs text-slate-500 mt-1">
            Ajoutez vos prochains devoirs et interrogations pour recevoir vos rappels de révision.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredEvents.map(ev => {
            const sub = subjects.find(s => s.id === ev.subjectId);
            const urgent48h = isWithin48h(ev.date, ev.time);

            return (
              <div
                key={ev.id}
                className={`bg-white rounded-2xl p-3.5 border transition-all shadow-xs ${
                  urgent48h
                    ? 'border-amber-400 bg-amber-50/30 ring-1 ring-amber-400/40'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className="w-3.5 h-12 rounded-xl shrink-0 mt-0.5"
                      style={{ backgroundColor: sub?.color || '#6366f1' }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {ev.title}
                        </h4>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                          {ev.type}
                        </span>
                        {urgent48h && (
                          <span className="text-[10px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <Clock className="w-3 h-3" />
                            <span>Proche (&lt;48h)</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700">{sub?.name || 'Matière'}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3 text-slate-400" />
                          {ev.date} {ev.time && `à ${ev.time}`}
                        </span>
                      </div>

                      {ev.description && (
                        <p className="text-xs text-slate-600 mt-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100">
                          {ev.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Supprimer cet événement du planning ?')) {
                        onDeleteEvent(ev.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all shrink-0"
                    title="Supprimer"
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
  );
};
