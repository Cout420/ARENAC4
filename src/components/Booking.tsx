import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Map, CheckCircle2, ChevronRight, Info, AlertOctagon, Lock, Check, Copy, ExternalLink, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './AuthContext';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc, serverTimestamp, query, where } from 'firebase/firestore';

const SPORTS = [
  {
    id: 'society',
    name: 'Quadra Society Oficial',
    pricePerHour: 180,
    duration: '1 ou 2 horas',
    description: 'Quadra de grama sintética padrão FIFA. 7 na linha. Ideal para o Fut7.',
    colorHover: 'hover:border-[#FFD700]',
    colorActive: 'border-[#FFD700] bg-[#FFD700]/5 text-[#FFD700]'
  },
  {
    id: 'sand',
    name: 'Quadra de Areia',
    pricePerHour: 100,
    duration: '1 hora e 30 min',
    description: 'Areia tratada e fina, ideal para Futevôlei, Vôlei de Areia e Beach Tennis.',
    colorHover: 'hover:border-[#CCFF00]',
    colorActive: 'border-[#CCFF00] bg-[#CCFF00]/5 text-[#CCFF00]'
  }
];

const GENERATE_DATES = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    dates.push({
      date: nextDate,
      dateString: nextDate.toISOString().split('T')[0],
      dayName: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][nextDate.getDay()],
      dayNum: nextDate.getDate(),
      month: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][nextDate.getMonth()]
    });
  }
  return dates;
};

const DATES = GENERATE_DATES();
const TIME_SLOTS = ['18:00', '19:00', '19:30', '20:00', '21:00', '21:30', '22:00'];

export function Booking() {
  const [selectedSport, setSelectedSport] = useState<string>(SPORTS[0].id);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [firestoreBookings, setFirestoreBookings] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [pixStep, setPixStep] = useState(false);
  const [bookingStatusInfo, setBookingStatusInfo] = useState<{ id: string, sport: string, date: string, time: string } | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { user, profile, signIn } = useAuth();
  const { isAdminMode, settings } = useStore();

  const activeSport = SPORTS.find(s => s.id === selectedSport)!;

  useEffect(() => {
    setIsLoadingBookings(true);
    // Listen for bookings of the active sport
    const q = query(collection(db, 'bookings'), where('sport', '==', selectedSport));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const _bookings: Record<string, any> = {};
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.sport === selectedSport) {
            const key = `${data.sport}-${data.dateId}-${data.time}`;
            _bookings[key] = data;
          }
        });
        setFirestoreBookings(_bookings);
        setIsLoadingBookings(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'bookings');
      }
    );
    return () => unsubscribe();
  }, [selectedSport]);

  const handleBooking = async () => {
    if (!selectedTime || !user) return;
    setIsSubmitting(true);
    const dateString = DATES[selectedDate].dateString;
    const bookingId = `${selectedSport}_${dateString}_${selectedTime.replace(':', '')}`;
    
    try {
      await setDoc(doc(db, 'bookings', bookingId), {
        userId: user.uid,
        userName: profile?.name || user.displayName || 'Jogador',
        userEmail: profile?.email || user.email || '',
        sport: selectedSport,
        dateId: dateString,
        dateFormatted: `${DATES[selectedDate].dayNum} de ${DATES[selectedDate].month}`,
        time: selectedTime,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setBookingStatusInfo({
        id: bookingId,
        date: `${DATES[selectedDate].dayNum} de ${DATES[selectedDate].month}`,
        time: selectedTime,
        sport: activeSport.name
      });
      setPixStep(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bookings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendProof = () => {
    if (!bookingStatusInfo) return;
    const { date, time, sport } = bookingStatusInfo;
    const rawWhatsApp = settings.whatsapp.replace(/\D/g, '');
    const userName = profile?.name || user?.displayName || 'Jogador';
    const message = `Olá Arena C4! Gostaria de confirmar minha reserva: ${userName}, ${sport}, ${date} às ${time}. Segue o comprovante do Pix em anexo.`;
    
    window.open(`https://wa.me/55${rawWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
    
    setPixStep(false);
    setBookingStatusInfo(null);
    setSelectedTime('');
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
    }, 4000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(settings.whatsapp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSlotClick = (time: string, currentStatus: string | undefined) => {
    const dateString = DATES[selectedDate].dateString;
    const key = `${selectedSport}-${dateString}-${time}`;
    if (isAdminMode) {
      // In a real app we'd trigger a modal to edit booking or create maintenance.
      // For now, allow selection for admin or show details.
    } else {
      if (currentStatus !== 'booked' && currentStatus !== 'maintenance' && currentStatus !== 'pending' && currentStatus !== 'confirmed') {
        setSelectedTime(time);
      }
    }
  };


  return (
    <section id="booking-section" className="py-24 px-4 bg-arena-dark relative z-10 leading-relaxed">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow opacity-50 pointer-events-none"></div>
      
      <AnimatePresence>
        {pixStep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={() => setPixStep(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors p-2"
              >
                <X size={20} />
              </button>

              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-arena-orange to-arena-yellow"></div>
              
              <div className="text-center mb-8 pt-4">
                <div className="mx-auto w-16 h-16 bg-[#CCFF00]/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-[#CCFF00]" />
                </div>
                <h3 className="text-2xl font-black uppercase italic mb-2">Horário Reservado!</h3>
                <p className="text-zinc-400 text-sm">Seu horário está garantido como <strong className="text-white">Pendente</strong>. Para confirmar definitivamente, realize o pagamento via Pix.</p>
              </div>

              <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 mb-6">
                <div className="mb-4">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Chave Pix (Celular)</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-black rounded-lg py-3 px-4 font-mono text-arena-yellow border border-white/5 text-lg truncate">
                      {settings.whatsapp}
                    </div>
                    <button 
                      onClick={handleCopyPix}
                      className="h-[52px] px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center transition-colors text-white"
                    >
                      {copied ? <Check size={20} className="text-[#CCFF00]" /> : <Copy size={20} />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 text-center">Titular: Arena C4 Esportes LTDA<br/>Instituição: Nubank</p>
              </div>
              
              <div className="mb-6 space-y-2 text-sm text-zinc-300">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-500">Quadra:</span>
                  <span className="font-bold">{bookingStatusInfo?.sport}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-zinc-500">Data:</span>
                  <span className="font-bold">{bookingStatusInfo?.date} às {bookingStatusInfo?.time}h</span>
                </div>
                <div className="flex justify-between pt-1 text-lg">
                  <span className="text-zinc-400">Valor Total:</span>
                  <span className="font-black text-arena-yellow">R$ {activeSport.pricePerHour}</span>
                </div>
              </div>

              <button 
                onClick={handleSendProof}
                className="w-full py-4 rounded-xl bg-[#25D366] text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-[#25D366]/20"
              >
                Enviar p/ WhatsApp
                <ExternalLink size={18} />
              </button>
              <p className="text-[10px] text-zinc-500 text-center mt-4 uppercase tracking-widest font-bold">O comprovante é obrigatório para confirmar</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Booking Form */}
          <div className="flex-1 space-y-10 p-6 md:p-10 rounded-2xl border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Progress Bar Top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-900 border-b border-white/5 pointer-events-none">
              <motion.div 
                className="h-full bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow"
                initial={{ width: '33%' }}
                animate={{ width: selectedTime ? '100%' : '66%' }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-2">Agendamento <span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow">Inteligente</span></h2>
              <p className="text-zinc-400">Escolha a quadra, dia e horário para garantir o seu jogo. Visualização em tempo real.</p>
            </div>

            {/* 1. Sport Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-white font-bold uppercase tracking-widest text-[10px]">
                <span className="text-zinc-500">Esporte / Tipo de Quadra</span>
                <span className={`px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-black`}>Passo 01</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SPORTS.map(sport => {
                  const isSelected = selectedSport === sport.id;
                  const isSociety = sport.id === 'society';
                  return (
                    <motion.button
                      key={sport.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { setSelectedSport(sport.id); setSelectedTime(''); }}
                      className={`text-left p-6 rounded-xl border-2 transition-all relative overflow-hidden ${
                        isSelected 
                          ? 'border-transparent bg-gradient-to-br from-arena-orange/10 to-arena-pink/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,77,0,0.15)]'
                          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 border-2 border-transparent rounded-xl pointer-events-none" style={{ background: 'linear-gradient(to right, var(--color-arena-orange), var(--color-arena-pink)) border-box', WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'destination-out', maskComposite: 'exclude' }}></div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Modalidade</p>
                            {isSociety && (
                              <span className="px-2 py-0.5 bg-gradient-to-r from-arena-orange to-arena-pink text-white text-[8px] font-black uppercase tracking-widest rounded-full shadow-lg">
                                Oficial
                              </span>
                            )}
                          </div>
                          <h3 className={`font-black italic uppercase text-lg sm:text-lg tracking-tight ${isSelected ? 'text-white' : 'text-zinc-300'}`}>{sport.name}</h3>
                        </div>
                        {isSelected && (
                           <div className="w-6 h-6 rounded-full bg-gradient-to-r from-arena-orange to-arena-pink flex items-center justify-center flex-shrink-0 mt-1 shadow-lg">
                             <CheckCircle2 size={14} className="text-white" />
                           </div>
                        )}
                      </div>
                      <p className={`text-xs tracking-wide mb-4 leading-relaxed mt-2 relative z-10 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>{sport.description}</p>
                      <div className={`text-sm font-black font-mono relative z-10 ${isSelected ? 'text-arena-yellow' : 'text-zinc-400'}`}>R$ {sport.pricePerHour} <span className="text-[10px] text-zinc-500 font-sans tracking-widest">/ HORA</span></div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 2. Date Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-white font-bold uppercase tracking-widest text-[10px]">
                <span className="text-zinc-500">Data do Jogo</span>
                <span className={`px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-black`}>Passo 02</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x px-1">
                {DATES.map((d, idx) => {
                  const isSelected = selectedDate === idx;
                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setSelectedDate(idx); setSelectedTime(''); }}
                      className={`snap-center flex-shrink-0 flex flex-col items-center justify-center min-w-[80px] h-[100px] rounded-xl border transition-all ${
                        isSelected 
                          ? `border-arena-yellow bg-arena-yellow/10 text-arena-yellow shadow-[0_0_15px_rgba(255,215,0,0.15)] scale-105` 
                          : 'border-zinc-800 bg-zinc-900/50 text-zinc-500 hover:text-white hover:border-zinc-700 hover:bg-zinc-800'
                      }`}
                    >
                      <span className={`text-[10px] uppercase tracking-widest ${isSelected ? 'font-black text-arena-yellow' : 'font-medium'}`}>{d.dayName}</span>
                      <span className={`text-3xl font-black italic mt-1 mb-1 ${isSelected ? 'text-white' : ''}`}>{d.dayNum}</span>
                      <span className="text-[10px] font-mono uppercase">{d.month}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* 3. Time Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-white font-bold uppercase tracking-widest text-[10px]">
                <span className="text-zinc-500">Horários Disponíveis</span>
                <span className={`px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 font-black`}>Passo 03</span>
              </div>
              <motion.div 
                 key={selectedDate} // triggers re-render stagger
                 initial="hidden"
                 animate="visible"
                 variants={{
                   visible: { transition: { staggerChildren: 0.05 } },
                   hidden: {}
                 }}
                 className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {TIME_SLOTS.map((time, idx) => {
                  if (isLoadingBookings) {
                    return (
                      <div key={`skeleton-${idx}`} className="h-[76px] rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse flex flex-col items-center justify-center py-4">
                        <div className="w-16 h-5 bg-zinc-800 rounded mb-2"></div>
                        <div className="w-20 h-2 bg-zinc-800 rounded"></div>
                      </div>
                    );
                  }

                  const dateString = DATES[selectedDate].dateString;
                  const key = `${selectedSport}-${dateString}-${time}`;
                  const slotStatus = firestoreBookings[key]?.status;
                  const isPending = slotStatus === 'pending';
                  const isBooked = slotStatus === 'booked' || slotStatus === 'confirmed';
                  const isMaintenance = slotStatus === 'maintenance';
                  const isUnavailable = isBooked || isMaintenance || isPending;
                  const isSelected = selectedTime === time;

                  return (
                    <motion.button
                      variants={{
                        hidden: { opacity: 0, scale: 0.9 },
                        visible: { opacity: 1, scale: 1 }
                      }}
                      key={idx}
                      disabled={isUnavailable && !isAdminMode}
                      onClick={() => handleSlotClick(time, slotStatus)}
                      className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all uppercase relative overflow-hidden ${
                        isMaintenance 
                          ? 'border-yellow-900 bg-yellow-950/30 text-yellow-600 opacity-70'
                          : isBooked 
                            ? 'border-red-500/30 bg-[#050505]/50 text-red-500/50 cursor-not-allowed opacity-40 line-through' 
                            : isPending
                              ? `border-[#FFD700]/30 ${isAdminMode ? 'bg-[#FFD700]/10 text-[#FFD700]' : 'bg-[#050505]/50 text-zinc-600 cursor-not-allowed opacity-60'}`
                              : isSelected
                                ? `border-arena-yellow bg-arena-yellow/10 text-arena-yellow shadow-[0_0_20px_rgba(255,215,0,0.2)]`
                                : `border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 text-zinc-400`
                      } ${isAdminMode ? 'cursor-pointer' : ''}`}
                    >
                      <span className={`text-lg font-mono font-black mb-1 ${isSelected ? 'text-white drop-shadow-md' : ''} ${isBooked ? 'line-through' : ''}`}>{time}</span>
                      <span className={`text-[8px] tracking-widest font-bold mt-1 text-center leading-tight sm:px-2 ${
                        isMaintenance ? 'text-yellow-600' : 
                        isBooked ? 'text-red-500/50' : 
                        isPending ? (isAdminMode ? 'text-[#FFD700]' : 'text-zinc-500') : ''
                      }`}>
                        {isMaintenance ? 'MANUTENÇÃO' : isBooked ? 'JOGO CONFIRMADO' : isPending ? (isAdminMode ? 'AGUARDANDO PIX' : 'PENDENTE') : 'DISPONÍVEL'}
                      </span>
                      {isBooked && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-full h-[1px] bg-red-500/30 rotate-12 absolute scale-150"></div>
                        </div>
                      )}
                      {isSelected && (
                         <div className="absolute top-2 right-2 text-arena-yellow">
                           <Check size={14} strokeWidth={4} />
                         </div>
                      )}
                    </motion.button>
                  );
                })}
              </motion.div>
            </div>

          </div>

          {/* Sidebar / Resume */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="sticky top-24 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              {/* Ticket cutouts */}
              <div className="absolute top-[55%] -left-3 w-6 h-6 bg-arena-dark rounded-full -translate-y-1/2 border-r border-white/10 shadow-inner"></div>
              <div className="absolute top-[55%] -right-3 w-6 h-6 bg-arena-dark rounded-full -translate-y-1/2 border-l border-white/10 shadow-inner"></div>
              
              <h3 className="font-black uppercase italic text-xl mb-6 border-b border-white/10 pb-4 text-center tracking-widest">Resumo da Reserva</h3>
              
              <div className="space-y-4 mb-10 relative z-10 p-2">
                <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arena-orange/20 to-arena-pink/20 flex items-center justify-center text-arena-orange flex-shrink-0 shadow-inner">
                    <Map size={18} />
                  </div>
                  <div>
                    <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Local</p>
                    <p className="font-bold text-white uppercase text-sm leading-tight">{activeSport.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arena-pink/20 to-arena-yellow/20 flex items-center justify-center text-arena-yellow flex-shrink-0 shadow-inner">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Data & Hora</p>
                    <p className="font-bold text-white uppercase text-sm leading-tight">
                      {DATES[selectedDate].dayNum} de {DATES[selectedDate].month}
                    </p>
                  </div>
                  {selectedTime && (
                    <div className="text-right border-l border-white/10 pl-3">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Horário</p>
                      <p className="text-arena-yellow font-black font-mono text-base">{selectedTime}h</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Dotted separator line */}
              <div className="w-full border-t-2 border-dashed border-white/10 mb-8 mt-4 relative"></div>

              <div className="mb-8 flex justify-between items-end px-2">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest">Valor do Jogo</p>
                  <p className="text-[9px] text-zinc-600 uppercase mt-0.5">pagamento no local</p>
                </div>
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-arena-orange to-arena-yellow font-mono drop-shadow-md">
                  R$ {activeSport.pricePerHour}
                </span>
              </div>

              {bookingSuccess ? (
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black uppercase text-sm tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <CheckCircle2 size={20} />
                  Confirmada!
                </motion.div>
              ) : (
                <motion.button 
                  whileHover={selectedTime ? { scale: 1.02, filter: 'brightness(1.1)' } : {}}
                  whileTap={selectedTime ? { scale: 0.98 } : {}}
                  onClick={user ? handleBooking : signIn}
                  disabled={!selectedTime || isSubmitting}
                  className={`w-full py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-2 relative overflow-hidden ${
                    selectedTime 
                      ? 'bg-gradient-to-r from-arena-orange via-arena-pink to-arena-yellow text-white shadow-[0_0_30px_rgba(255,77,0,0.3)]' 
                      : 'bg-zinc-800/50 text-zinc-600 cursor-not-allowed border border-zinc-800'
                  }`}
                >
                  {selectedTime && !isSubmitting && (
                    <motion.span 
                      animate={{ opacity: [0, 0.2, 0] }} 
                      transition={{ duration: 2, repeat: Infinity }} 
                      className="absolute inset-0 bg-white"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isSubmitting ? '...' : user ? 'Confirmar Reserva' : 'Entrar com Google'} 
                    {!isSubmitting && <ChevronRight size={18} />}
                  </span>
                </motion.button>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
