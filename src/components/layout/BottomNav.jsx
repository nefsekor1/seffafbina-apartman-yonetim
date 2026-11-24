import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  MessageSquare, 
  FileText, 
  Building
} from 'lucide-react';

export const BottomNav = ({ activeTab, onTabChange }) => {
  const { userRole } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Özet', icon: LayoutDashboard },
    { id: 'flats', label: 'Daireler', icon: Users },
    { id: 'expenses', label: 'Kasa & Fişler', icon: Receipt },
    { id: 'communication', label: 'İletişim', icon: MessageSquare },
    { id: 'board', label: 'Pano & Ayarlar', icon: FileText },
  ];

  // Süper Admin için ek sekme
  if (userRole === 'superadmin') {
    navItems.push({ id: 'superadmin', label: 'Binalar', icon: Building });
  }

  return (
    <>
      {/* MASAÜSTÜ SEKMELER (Sayfa üstünde, Header altında) */}
      <div className="no-print hidden md:block bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MOBİL ALT NAVİGASYON ÇUBUĞU (Fixed Bottom Bar) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
        <div className="grid grid-flow-col auto-cols-fr h-16 items-center px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center h-full w-full py-1 transition-all ${
                  isActive ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'bg-emerald-100 text-emerald-700 scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
export default BottomNav;
