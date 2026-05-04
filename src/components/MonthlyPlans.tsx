import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Star, MessageCircle, Crown, Shield } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EditableText } from './Editable';

export function MonthlyPlans() {
  const [activeSport, setActiveSport] = useState<'society' | 'areia'>('society');
  const { plans, updatePlan, isAdminMode } = useStore();

  const handleWhatsApp = (planName: string) => {
    const text = `Olá, gostaria de saber horários fixos disponíveis para a Quadra ${activeSport === 'society' ? 'Society' : 'de Areia'} no plano ${planName}.`;
    window.open(`https://wa.me/5511964149969?text=${encodeURIComponent(text)}`);
  };

  return (
    <section id="plans" className="py-24 px-4 bg-zinc-950 relative overflow-hidden">
      {/* Background with subtle carbon-like mesh/grid and neon gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDcwNzA3IiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cGF0aCBkPSJNMCAwdjhoOHYtOEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iMC4wNCIvPgo8L3N2Zz4=')] opacity-50 block mix-blend-overlay"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-arena-orange/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-arena-pink/10 blur-[100px] rounded-full"></div>
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-arena-yellow/10 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 text-white drop-shadow-md">
            Garanta sua <span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow">Cadeira Cativa</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium mb-10">
            Planos Mensais para times. Vaga garantida todo mês, descontos no Bar e prioridade na Área de Churrasqueira.
          </p>

          {/* Toggle Button */}
          <div className="inline-flex bg-[#0A0A0A] p-2 rounded-xl border border-white/10 shadow-2xl relative">
            <motion.div
              className="absolute top-2 bottom-2 w-[calc(50%-8px)] rounded-lg bg-gradient-to-r from-arena-orange to-arena-pink z-0"
              initial={false}
              animate={{ left: activeSport === 'society' ? '8px' : 'calc(50%)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            
            <button
              onClick={() => setActiveSport('society')}
              className={`relative z-10 px-8 py-3 text-sm font-black uppercase tracking-widest rounded-lg transition-colors min-w-[160px] ${
                activeSport === 'society' ? 'text-white drop-shadow-md' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Society
            </button>
            <button
              onClick={() => setActiveSport('areia')}
              className={`relative z-10 px-8 py-3 text-sm font-black uppercase tracking-widest rounded-lg transition-colors min-w-[160px] ${
                activeSport === 'areia' ? 'text-white drop-shadow-md' : 'text-zinc-500 hover:text-white'
              }`}
            >
              Areia
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, idx) => {
            const isPopular = plan.isPopular;
            const price = activeSport === 'society' ? plan.priceSociety : plan.priceAreia;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative bg-[#0a0a0a]/80 backdrop-blur-xl border rounded-2xl p-8 flex flex-col h-full shadow-2xl transition-all ${
                  isPopular 
                    ? 'border-transparent transform md:-translate-y-4 shadow-[0_0_40px_rgba(255,0,85,0.15)] ring-1 ring-white/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {isPopular && (
                  <>
                    <div className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(to bottom right, var(--color-arena-orange), var(--color-arena-pink)) border-box', WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'destination-out', maskComposite: 'exclude' }}></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="bg-gradient-to-r from-arena-orange to-arena-pink text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap">
                        <Star size={12} className="fill-white" /> Mais Procurado
                      </div>
                    </div>
                  </>
                )}

                <div className="text-left mb-8 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {plan.id === 'bronze' && <Shield size={24} className="text-zinc-400" />}
                    {plan.id === 'prata' && <Crown size={24} className="text-arena-pink" />}
                    {plan.id === 'ouro' && <Star size={24} className="text-arena-yellow" />}
                    <h3 className="text-2xl font-black uppercase italic tracking-widest text-white">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-400 min-h-[40px]">{plan.description}</p>
                </div>

                <div className="text-left mb-8">
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-lg font-bold text-zinc-500">R$</span>
                    {isAdminMode ? (
                      <span className="text-4xl font-black text-white font-mono leading-none border-b border-dashed border-arena-yellow cursor-text pb-1">
                        <EditableText 
                          value={price.toString()} 
                          onSave={(v) => {
                            const numericValue = parseFloat(v) || 0;
                            updatePlan(plan.id, activeSport === 'society' 
                              ? { priceSociety: numericValue } 
                              : { priceAreia: numericValue });
                          }} 
                        />
                      </span>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.span 
                          key={`${plan.id}-${activeSport}`}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-4xl font-black text-white font-mono leading-none"
                        >
                          {price}
                        </motion.span>
                      </AnimatePresence>
                    )}
                    <span className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-1">/mês</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8 text-left flex-1 border-t border-white/10 pt-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm text-zinc-300">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPopular ? 'bg-gradient-to-br from-arena-orange to-arena-pink text-white' : 'bg-white/10 text-white'}`}>
                        <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleWhatsApp(plan.name)}
                  className={`w-full py-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group ${
                    isPopular 
                      ? 'bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow text-white hover:opacity-90 shadow-[0_0_20px_rgba(255,0,85,0.3)]' 
                      : 'bg-[#111] hover:bg-zinc-800 text-white border border-white/10 hover:border-white/20'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  )}
                  <MessageCircle size={18} />
                  Consultar Zap
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
