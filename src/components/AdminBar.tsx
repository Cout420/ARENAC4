import React from 'react';
import { useStore } from '../store/useStore';
import { Settings, LogOut, Edit3, LayoutDashboard } from 'lucide-react';
import { useAuth } from './AuthContext';

export function AdminBar({ onOpenDashboard }: { onOpenDashboard: () => void }) {
  const { profile, signOut } = useAuth();
  const { isAdminMode, toggleAdminMode } = useStore();

  if (profile?.role !== 'admin') return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-[#CCFF00] text-black z-[60] px-4 py-2 flex items-center justify-between border-b border-black/10">
      <div className="flex items-center gap-2">
        <Settings size={16} />
        <span className="font-black uppercase tracking-widest text-xs">Gestão C4</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button onClick={onOpenDashboard} className="flex items-center gap-1.5 text-xs font-black uppercase hover:bg-black/10 px-2 py-1 rounded">
          <LayoutDashboard size={14} /> Painel
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-black/60 hidden sm:inline">Modo Edição</span>
          <button 
            onClick={toggleAdminMode}
            className={`w-12 h-6 rounded-full p-1 transition-colors relative ${isAdminMode ? 'bg-black' : 'bg-black/20'}`}
          >
            <div className={`w-4 h-4 bg-[#CCFF00] rounded-full transition-transform ${isAdminMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
        
        <div className="w-px h-4 bg-black/20"></div>
        
        <button onClick={signOut} className="flex items-center gap-2 text-black/70 hover:text-black transition-colors text-xs font-bold uppercase">
          <LogOut size={14} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>
  );
}
