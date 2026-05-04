import React, { useState } from 'react';
import { IMaskInput } from 'react-imask';
import { motion } from 'motion/react';
import { Shield } from 'lucide-react';
import { useAuth } from './AuthContext';

export function ProfileCompletionModal() {
  const { completeProfile, user } = useAuth();
  const [whatsapp, setWhatsapp] = useState('');
  const [cpf, setCpf] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsapp.length < 14 || cpf.length < 14) return;
    await completeProfile({ whatsapp, cpf });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0a0a0a] rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow"></div>
        
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center flex-shrink-0 border border-white/5">
            <Shield size={24} className="text-arena-yellow" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter text-white">Finalize seu Cadastro</h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Bem-vindo(a), {user?.displayName?.split(' ')[0]}!</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">WhatsApp (Obrigatório)</label>
            <IMaskInput
              mask="(00) 00000-0000"
              value={whatsapp}
              unmask={false}
              onAccept={(value) => setWhatsapp(value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arena-pink transition-colors font-mono"
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-2">CPF (Nota Fiscal / Controle)</label>
            <IMaskInput
              mask="000.000.000-00"
              value={cpf}
              unmask={false}
              onAccept={(value) => setCpf(value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-arena-pink transition-colors font-mono"
              placeholder="000.000.000-00"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={whatsapp.length < 14 || cpf.length < 14}
            className="w-full py-4 mt-4 bg-gradient-to-r from-arena-orange to-arena-pink hover:opacity-90 disabled:opacity-50 disabled:grayscale text-white text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg"
          >
            Concluir Cadastro
          </button>
        </form>
      </motion.div>
    </div>
  );
}
