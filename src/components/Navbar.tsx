import React, { useState, useEffect } from 'react';
import { MapPin, Instagram, Menu, X, MessageCircle } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-arena-dark/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow">
            ARENA C4
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#facilities" className="text-sm font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors">Estrutura</a>
          <a href="#booking-section" className="text-sm font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors">Reserva</a>
          <a href="#menu" className="text-sm font-bold uppercase tracking-widest text-zinc-300 hover:text-white transition-colors">Bar</a>
          
          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-arena-pink hover:text-white transition-colors">
              <Instagram size={18} />
            </a>
            <a href="https://wa.me/5511964149969" target="_blank" rel="noreferrer" className="h-10 px-4 rounded-full bg-gradient-to-r from-arena-orange to-arena-pink flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest hover:opacity-90 transition-opacity">
              <MessageCircle size={16} />
              (11) 96414-9969
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-arena-dark border-b border-white/10 flex flex-col p-4 gap-4 md:hidden">
          <a href="#facilities" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest p-4 border-b border-white/5">Estrutura</a>
          <a href="#booking-section" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest p-4 border-b border-white/5">Reserva</a>
          <a href="#menu" onClick={() => setMobileMenuOpen(false)} className="text-sm font-bold uppercase tracking-widest p-4 border-b border-white/5">Bar</a>
          
          <div className="flex flex-col gap-4 p-4">
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
              <MapPin size={14} />
              R. Anadir Coutinho de Ávila, 820, Arujá
            </div>
            
            <a href="https://wa.me/5511964149969" target="_blank" rel="noreferrer" className="w-full h-12 rounded bg-gradient-to-r from-arena-orange to-arena-pink flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest">
              <MessageCircle size={18} />
              Chamar no Zap
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
