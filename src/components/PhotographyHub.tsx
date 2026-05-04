import React, { useState } from 'react';
import { Camera, Calendar as CalendarIcon, Download, Search, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EditableImage } from './Editable';

export function PhotographyHub() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { albums, photos, addPhoto, removePhoto, isAdminMode } = useStore();
  
  const filteredPhotos = activeFilter === 'all' 
    ? photos 
    : photos.filter(p => p.eventId === activeFilter);

  const handleAddPhoto = () => {
    addPhoto({
      id: Date.now(),
      eventId: activeFilter === 'all' ? albums[1]?.id || 'oficiais' : activeFilter,
      url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop',
      photographer: 'Novo Fotógrafo'
    });
  };

  return (
    <section className="py-24 px-4 bg-[#0F0F0F] border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 text-white text-[10px] uppercase font-bold tracking-widest mb-4">
              <Camera size={14} />
              <span>Hub do Atleta</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2">
              Galeria de <span className="text-[#FFD700]">Eventos</span>
            </h2>
            <p className="text-zinc-400 max-w-xl font-medium">
              Nossos fotógrafos parceiros registram os melhores lances. Encontre seu álbum por dia e evento e baixe suas fotos com alta qualidade.
            </p>
          </div>
          
          {/* Quick Search pseudo-input */}
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="BUSCAR POR NOME..." 
              className="w-full bg-zinc-900 border border-zinc-800 p-3 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-[#CCFF00] transition-colors uppercase placeholder:text-zinc-600"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
          {albums.map(event => (
            <button
              key={event.id}
              onClick={() => setActiveFilter(event.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === event.id 
                  ? 'bg-[#FFD700] text-black' 
                  : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <CalendarIcon size={14} />
              {event.name}
            </button>
          ))}
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
          {filteredPhotos.map(photo => (
            <div key={photo.id} className="group relative bg-[#0A0A0A] aspect-square overflow-hidden border border-white/5">
              <div className="w-full h-full grayscale mix-blend-luminosity opacity-80 group-hover:grayscale-0 group-hover:mix-blend-normal group-hover:opacity-100 transition-all duration-500 relative">
                <EditableImage 
                  src={photo.url} 
                  onSave={(url) => {
                    // Quick state update via global photo replacement logic
                    const currentPhoto = photos.find(p => p.id === photo.id);
                    if (currentPhoto) {
                      removePhoto(photo.id);
                      addPhoto({ ...currentPhoto, url });
                    }
                  }} 
                  className="w-full h-full object-cover pointer-events-auto"
                  loading="lazy"
                />
              </div>
              
              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[#FFD700] font-black uppercase italic mb-1 text-lg leading-none">
                      {albums.find(e => e.id === photo.eventId)?.name || 'Evento'}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest">📸 {photo.photographer}</p>
                  </div>
                  <div className="flex gap-2 pointer-events-auto">
                    {isAdminMode && (
                      <button onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }} className="w-10 h-10 bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                    <button className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-[#FFD700] transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isAdminMode && (
            <button onClick={handleAddPhoto} className="flex flex-col items-center justify-center gap-2 aspect-square border-2 border-dashed border-zinc-800 text-zinc-500 hover:text-[#FFD700] hover:border-[#FFD700] transition-colors bg-zinc-900/50">
              <Plus size={32} />
              <span className="text-xs uppercase font-bold tracking-widest">Adicionar Foto</span>
            </button>
          )}
        </div>
        
        {filteredPhotos.length === 0 && !isAdminMode && (
          <div className="py-20 text-center text-zinc-500 border border-zinc-800 bg-zinc-900">
            <Camera size={32} className="mx-auto mb-4 opacity-50" />
            <p className="text-xs uppercase font-bold tracking-widest">Nenhuma foto encontrada</p>
          </div>
        )}
      </div>
    </section>
  );
}
