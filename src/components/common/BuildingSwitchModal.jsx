import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, X, Check, ArrowRight } from 'lucide-react';

export const BuildingSwitchModal = ({ isOpen, onClose }) => {
  const { buildings, activeBuildingId, switchBuilding } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">Yönetilen Bina / Site Değiştir</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {buildings.map((b) => {
            const isSelected = b.id === activeBuildingId;
            return (
              <button
                key={b.id}
                onClick={() => {
                  switchBuilding(b.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/60 shadow-sm ring-1 ring-emerald-500'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>{b.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Seçili
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                    {b.address || 'Adres bilgisi yok'}
                  </div>
                </div>

                <div className="text-slate-400">
                  {isSelected ? <Check className="w-5 h-5 text-emerald-600" /> : <ArrowRight className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default BuildingSwitchModal;
