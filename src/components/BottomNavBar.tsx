import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileEdit,
  Calendar,
  TrendingUp,
  FileText
} from 'lucide-react';

export type ScreenTab = 'dashboard' | 'subjects' | 'grades' | 'schedule' | 'stats' | 'settings';

interface BottomNavBarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  urgentEventsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  urgentEventsCount,
}) => {
  const tabs: Array<{ id: ScreenTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
    { id: 'subjects', label: 'Matières', icon: BookOpen },
    { id: 'grades', label: 'Notes', icon: FileEdit },
    { id: 'schedule', label: 'Planning', icon: Calendar, badge: urgentEventsCount },
    { id: 'stats', label: 'Stats', icon: TrendingUp },
    { id: 'settings', label: 'Bulletin', icon: FileText },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 max-w-md mx-auto shadow-lg">
      <div className="flex items-center justify-around px-1 py-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all relative select-none ${
                isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {/* Active Indicator Pill */}
              <div
                className={`w-11 h-6 rounded-full flex items-center justify-center transition-all ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              </div>

              <span className="text-[10px] mt-0.5 tracking-tight">
                {tab.label}
              </span>

              {/* Badge 48h */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-amber-500 text-white font-extrabold text-[9px] rounded-full flex items-center justify-center ring-2 ring-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
