import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  LogOut, 
  ShieldCheck, 
  User, 
  CheckCircle2, 
  Lock, 
  ChevronDown, 
  RefreshCw,
  Building,
  Sparkles
} from 'lucide-react';

export const Header = ({ onOpenBuildingSwitch }) => {
  const { 
    activeBuildingMeta, 
    userRole, 
    session, 
    logout, 
    buildings, 
    switchBuilding, 
    quickDemoLogin,
    appSettings 
  } = useAuth();
  
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Rol Etiketi ve Rengi
  const getRoleBadge = () => {
    switch (userRole) {
      case 'superadmin':
        return { label: 'Süper Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Lock };
      case 'manager':
        return { label: 'Yönetici', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: ShieldCheck };
      case 'auditor':
        return { label: 'Denetçi', bg: 'bg-teal-100 text-teal-800 border-teal-200', icon: CheckCircle2 };
      case 'resident':
        return { 
          label: `Daire ${session?.flatNo} Sakini`, 
          bg: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: User 
        };
      default:
        return { label: 'Misafir', bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: User };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <header className="no-print sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* SOL: APARTMAN BİLGİSİ (DİNAMİK) */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 shrink-0">
              <Building2 className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate tracking-tight">
                  {activeBuildingMeta?.name || 'ŞeffafBina Apartmanı'}
                </h1>

                {/* Çoklu bina varsa geçiş dropdownu */}
                {buildings.length > 1 && (
                  <button
                    onClick={onOpenBuildingSwitch}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="Bina Değiştir"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate hidden sm:block">
                {activeBuildingMeta?.address || 'Apartman ve Site Yönetimi'}
              </p>
            </div>
          </div>

          {/* SAĞ: ROL ROZETİ VE ÇIKIŞ BUTONU */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Hızlı Rol Değiştirme Butonu (Demo Kolaylığı) */}
            {appSettings?.showQuickDemoBar && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  title="Test Rolü Değiştir"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Test Rolü</span>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 text-xs">
                    <div className="px-3 py-1.5 font-bold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100">
                      Hızlı Test Rolü Seç
                    </div>
                    <button
                      onClick={() => { quickDemoLogin('manager'); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Yönetici (PIN: 1923)
                    </button>
                    <button
                      onClick={() => { quickDemoLogin('auditor'); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-teal-50 hover:text-teal-700 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      Denetçi (PIN: 2025)
                    </button>
                    <button
                      onClick={() => { quickDemoLogin('resident', 1); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      Daire 1 Sakini (1001)
                    </button>
                    <button
                      onClick={() => { quickDemoLogin('superadmin'); setShowRoleMenu(false); }}
                      className="w-full text-left px-3 py-2 text-slate-700 hover:bg-purple-50 hover:text-purple-700 flex items-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-purple-600" />
                      Süper Admin (9999)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Aktif Rol Rozeti */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${roleBadge.bg}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              <span>{roleBadge.label}</span>
            </div>

            {/* Çıkış Yap Butonu */}
            <button
              onClick={logout}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
              title="Çıkış Yap"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
export default Header;
