import React from 'react';
import { MapPin, Phone, Instagram, Mail, Lock, Clock, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EditableText } from './Editable';

interface Props {
  onAdminClick?: () => void;
}

export function Footer({ onAdminClick }: Props) {
  const { settings, updateSettings, isAdminMode } = useStore();

  const formatPhone = (phone: string) => {
    // Basic format assuming 11 digits
    const cleaned = ('' + phone).replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  return (
    <footer className="bg-[#080808] border-t border-gradient-to-r from-transparent via-[#FFD700]/10 to-transparent pt-16 pb-24 md:pb-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Column 1: Branding */}
          <div>
            <h3 className="text-3xl font-black italic uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#CCFF00]">
              ARENA C4 <br/><span className="text-white">Food&Beer</span>
            </h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">
              Onde o jogo vira resenha.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-white/5 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#FFD700] hover:border-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-white/5 bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-[#FFD700] hover:border-[#FFD700] hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] transition-all">
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Column 2: Contatos & Info */}
          <div>
            <h4 className="font-black uppercase tracking-widest mb-6 text-[10px] text-zinc-500">Contatos & Info</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-[#0F0F0F] border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-[#FFD700]/30 group-hover:shadow-[0_0_15px_rgba(255,215,0,0.1)] transition-all">
                  <Phone size={16} className="text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">WhatsApp</p>
                  <div className="text-white font-mono text-sm group-hover:text-[#FFD700] transition-colors">
                    {isAdminMode ? (
                      <EditableText 
                        value={settings.whatsapp} 
                        onSave={(val) => updateSettings({ whatsapp: val })} 
                      />
                    ) : (
                      formatPhone(settings.whatsapp)
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-[#0F0F0F] border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-[#FFD700]/30 group-hover:shadow-[0_0_15px_rgba(255,215,0,0.1)] transition-all">
                  <Clock size={16} className="text-[#FFD700]" />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Funcionamento</p>
                  <div className="text-white font-mono text-sm group-hover:text-[#FFD700] transition-colors">
                    {isAdminMode ? (
                      <EditableText 
                        value={settings.hours} 
                        onSave={(val) => updateSettings({ hours: val })} 
                      />
                    ) : (
                      settings.hours
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Localização */}
          <div>
            <h4 className="font-black uppercase tracking-widest mb-6 text-[10px] text-zinc-500">Localização</h4>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#0F0F0F] border border-white/5 flex items-center justify-center flex-shrink-0">
                <MapPin size={16} className="text-[#FFD700]" />
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-bold tracking-wide">
                  {isAdminMode ? (
                    <EditableText 
                      value={settings.address} 
                      onSave={(val) => updateSettings({ address: val })} 
                    />
                  ) : (
                    settings.address
                  )}
                </div>
                <p className="text-zinc-500 text-xs font-medium mt-1 mb-3">Parque Rodrigo Barreto<br/>Arujá - SP, 07417-575</p>
                <a 
                  href="https://goo.gl/maps/WdGow1k5f8WnUoJv5" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] text-[#FFD700] text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border border-[#FFD700]/20 hover:border-[#FFD700]/50 hover:shadow-[0_0_15px_rgba(255,215,0,0.15)]"
                >
                  <MapPin size={12} /> Como Chegar <ExternalLink size={12} />
                </a>
              </div>
            </div>
            
            {/* Dark mode styled map placeholder / mini frame */}
            <div className="mt-6 h-24 rounded-xl relative overflow-hidden group border border-white/5">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale transition-all group-hover:opacity-50"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent"></div>
            </div>
          </div>

        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-600 font-mono uppercase">
            &copy; 2026 Arena C4 Food&Beer.
          </p>
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-600 relative z-50">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAdminClick) onAdminClick();
              }} 
              className="relative z-50 flex items-center justify-center w-6 h-6 rounded bg-[#0F0F0F] border border-white/5 hover:text-[#FFD700] hover:border-[#FFD700]/30 transition-colors pointer-events-auto" 
              title="Acesso Restrito"
            >
              <Lock size={12} />
            </button>
            <a href="#" className="hover:text-[#FFD700] transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-[#FFD700] transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
