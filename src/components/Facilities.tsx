import React from 'react';
import { Beer, Drumstick, PartyPopper } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EditableText, EditableImage } from './Editable';

const ICONS: Record<number, React.ReactNode> = {
  1: <Beer className="text-[#FFD700]" size={24} />,
  2: <Drumstick className="text-[#FFD700]" size={24} />,
  3: <PartyPopper className="text-[#FFD700]" size={24} />,
};

export function Facilities() {
  const facilities = useStore(state => state.facilities);
  const updateFacility = useStore(state => state.updateFacility);

  return (
    <section id="facilities" className="py-24 px-4 bg-[#0A0A0A] border-t border-white/5 relative">
      <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg width="240" height="240" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
            Resenha <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#CCFF00]">& Jogo</span>
          </h2>
          <p className="text-zinc-400 font-medium max-w-2xl mx-auto">
            Descubra os nossos diferenciais: estrutura de primeira, bebida gelada e espaço para você celebrar com os amigos e a empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          {facilities.map((facility) => (
            <div key={facility.id} className="group relative bg-[#0F0F0F] border border-white/5 overflow-hidden transition-colors duration-300">
              <div className="aspect-[4/3] w-full overflow-hidden grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal opacity-80 group-hover:opacity-100 transition-all duration-500 relative">
                <EditableImage 
                  src={facility.image} 
                  onSave={(url) => updateFacility(facility.id, { image: url })}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 pointer-events-auto"
                />
              </div>
              
              {/* Hover detail reveal */}
              <div className="absolute inset-x-0 bottom-0 top-0 translate-y-3/4 group-hover:translate-y-0 bg-gradient-to-t from-black via-black/90 to-transparent transition-transform duration-500 flex flex-col justify-end p-6 border-t border-white/5 pointer-events-none">
                <div className="w-12 h-12 bg-black border border-white/10 flex items-center justify-center z-10 text-[#FFD700] mb-4 pointer-events-none">
                  {ICONS[facility.id]}
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tight mb-2 pointer-events-auto w-fit">
                  <EditableText value={facility.title} onSave={(v) => updateFacility(facility.id, { title: v })} />
                </h3>
                <div className="text-zinc-400 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 pointer-events-auto">
                  <EditableText value={facility.description} onSave={(v) => updateFacility(facility.id, { description: v })} multiline />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
