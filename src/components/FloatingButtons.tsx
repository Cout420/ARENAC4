import React from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export function FloatingButtons() {
  const { settings } = useStore();
  const rawWhatsApp = settings.whatsapp.replace(/\D/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <a 
        href="https://instagram.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-12 h-12 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform"
      >
        <Instagram size={24} />
      </a>
      <a 
        href={`https://wa.me/55${rawWhatsApp}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 hover:scale-110 transition-transform"
      >
        <MessageCircle size={24} className="fill-current" />
      </a>
    </div>
  );
}
