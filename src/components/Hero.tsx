import React, { useState } from 'react';
import { ChevronDown, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EditableText, EditableImage } from './Editable';
import { motion, AnimatePresence } from 'motion/react';

export function Hero() {
  const slides = useStore(state => state.slides);
  const updateSlide = useStore(state => state.updateSlide);
  const isAdminMode = useStore(state => state.isAdminMode);
  const [currentSlide, setCurrentSlide] = useState(0);

  const scrollToBooking = () => {
    document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];

  if (!slide) return null;

  return (
    <section className="relative h-screen overflow-hidden group bg-arena-dark">
      {/* Background Image Carousel */}
      <AnimatePresence mode="popLayout">
        <motion.div 
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <EditableImage 
            src={slide.bg} 
            loading="eager"
            onSave={(url) => updateSlide(slide.id, { bg: url })}
            className="w-full h-full object-cover"
            buttonPosition="top-left"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-arena-dark/70 via-arena-dark/80 to-arena-dark pointer-events-none"></div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-20 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <button onClick={prevSlide} className="pointer-events-auto w-12 h-12 bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-arena-orange hover:text-white hover:border-transparent transition-colors backdrop-blur-sm rounded-full">
          <ChevronLeft size={24} />
        </button>
        <button onClick={nextSlide} className="pointer-events-auto w-12 h-12 bg-black/50 border border-white/10 flex items-center justify-center text-white hover:bg-arena-orange hover:text-white hover:border-transparent transition-colors backdrop-blur-sm rounded-full">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 text-center lg:text-left px-4 max-w-7xl mx-auto flex flex-col justify-center items-center pointer-events-none pt-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
            className={`flex flex-col lg:flex-row items-center justify-between w-full gap-12 ${slide.cardImage ? '' : 'justify-center text-center lg:text-center'}`}
          >
            <div className={`flex flex-col ${slide.cardImage ? 'lg:items-start items-center' : 'items-center'} max-w-3xl`}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 scale-90 md:scale-100 rounded-sm bg-gradient-to-r from-arena-orange/20 to-arena-pink/20 border border-arena-orange/30 text-arena-yellow font-black text-xs uppercase tracking-widest mb-6 backdrop-blur-md pointer-events-auto"
              >
                <MapPin size={14} />
                <EditableText value={slide.badge} onSave={(v) => updateSlide(slide.id, { badge: v })} />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
                className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter mb-4 leading-[0.9] pointer-events-auto w-full"
              >
                <span className="block text-white drop-shadow-md">
                  <EditableText value={slide.titleLine1} onSave={(v) => updateSlide(slide.id, { titleLine1: v })} />
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow drop-shadow-lg">
                  <EditableText value={slide.titleLine2} onSave={(v) => updateSlide(slide.id, { titleLine2: v })} />
                </span>
              </motion.h1>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className={`text-zinc-300 text-lg md:text-xl mb-10 font-medium pointer-events-auto w-full leading-relaxed drop-shadow ${slide.cardImage ? 'max-w-xl' : 'max-w-2xl mx-auto'}`}
              >
                <EditableText value={slide.desc} onSave={(v) => updateSlide(slide.id, { desc: v })} multiline />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pointer-events-auto"
              >
                <button 
                  onClick={scrollToBooking}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-arena-orange to-arena-pink hover:opacity-90 text-white text-sm font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-arena-orange/20"
                >
                  Agendar Horário
                </button>
                <a
                  href="#facilities" 
                  className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white/20 hover:border-white/50 text-white text-sm font-black uppercase tracking-widest transition-all backdrop-blur-sm"
                >
                  Nossa Estrutura
                </a>
              </motion.div>
            </div>

            {slide.cardImage && (
              <motion.div 
                 initial={{ opacity: 0, x: 100, rotate: 10 }}
                 animate={{ opacity: 1, x: 0, rotate: 5 }}
                 whileHover={{ rotate: 0, scale: 1.05 }}
                 transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                 className="hidden lg:block relative pointer-events-auto"
              >
                <div className="absolute -inset-4 bg-gradient-to-tr from-arena-orange via-arena-pink to-arena-yellow blur-2xl opacity-40 rounded-3xl animate-pulse"></div>
                <div className="relative w-80 h-[450px] border border-white/20 rounded-xl overflow-hidden bg-[#0A0A0A] p-2 shadow-2xl backdrop-blur-md">
                  <div className="w-full h-full relative overflow-hidden rounded-lg group">
                    <EditableImage 
                      src={slide.cardImage} 
                      loading="eager"
                      onSave={(v) => updateSlide(slide.id, { cardImage: v })} 
                      className="w-full h-full object-cover grayscale mix-blend-luminosity group-hover:grayscale-0 group-hover:mix-blend-normal transition-all duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 border-l-4 border-arena-yellow flex items-center justify-between">
                      <div>
                        <p className="text-arena-yellow font-black italic uppercase text-xl leading-none">MVP</p>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Destaque C4</p>
                      </div>
                      <div className="w-10 h-10 bg-arena-dark border border-white/10 flex items-center justify-center text-arena-yellow">
                        <span className="font-black">#1</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Carousel dots */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2 pointer-events-auto">
        {slides.map((_, idx) => (
          <button 
            key={idx} 
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-gradient-to-r from-arena-orange to-arena-pink' : 'bg-white/30 hover:bg-white/50'}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center animate-bounce text-zinc-500">
        <span className="text-[10px] uppercase font-black tracking-widest mb-2">Role para baixo</span>
        <ChevronDown size={20} />
      </div>
    </section>
  );
}
