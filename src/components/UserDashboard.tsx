import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Calendar, CheckCircle2, Clock, Map } from 'lucide-react';
import { useAuth } from './AuthContext';

export function UserDashboard({ onClose }: { onClose: () => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const bks: any[] = [];
      snap.forEach(d => bks.push({ id: d.id, ...d.data() }));
      // Sort by date (in real app prefer proper date parsing, for now just general sorting)
      bks.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setBookings(bks);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookings'));
    return () => unsub();
  }, [user]);

  return (
    <div className="fixed inset-0 bg-black/90 z-[200] flex justify-end p-4 lg:p-10 overflow-hidden backdrop-blur-md">
      <motion.div 
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%' }}
        className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 lg:p-10 flex flex-col h-full shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white font-black uppercase text-xs">X Fechar</button>
        
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">
          Meus <span className="text-transparent bg-clip-text bg-gradient-to-r from-arena-orange to-arena-pink">Agendamentos</span>
        </h2>
        <p className="text-zinc-500 text-sm mb-8">Acompanhe suas partidas e horários.</p>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {bookings.length === 0 ? (
             <p className="text-zinc-600 italic text-sm">Você ainda não tem agendamentos.</p>
          ) : bookings.map(b => {
             const isWO = b.status === 'wo';
             const isConfirmed = b.status === 'confirmed';

             return (
               <div key={b.id} className="p-5 rounded-2xl bg-zinc-900 border border-white/5 relative overflow-hidden">
                 {isConfirmed && <div className="absolute top-0 left-0 w-1 h-full bg-arena-yellow"></div>}
                 
                 <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-sm ${b.status === 'pending' ? 'bg-zinc-800 text-zinc-400' : isConfirmed ? 'bg-arena-yellow/20 text-arena-yellow' : 'bg-red-500/20 text-red-500'}`}>
                       {b.status === 'pending' ? 'Pendente' : isConfirmed ? 'Confirmado' : 'W.O.'}
                     </span>
                   </div>
                   <span className="text-xs text-zinc-500 font-mono">ID: {b.id.slice(-6)}</span>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-start gap-3">
                     <Map size={18} className="text-arena-orange mt-0.5" />
                     <div>
                       <p className="text-[10px] uppercase text-zinc-500 font-black">Quadra</p>
                       <p className="text-sm font-bold text-white uppercase">{b.sport}</p>
                     </div>
                   </div>
                   <div className="flex items-start gap-3">
                     <Calendar size={18} className="text-arena-pink mt-0.5" />
                     <div>
                       <p className="text-[10px] uppercase text-zinc-500 font-black">Data/Hora</p>
                       <p className="text-sm font-bold text-white uppercase">{b.dateId} - {b.time}h</p>
                     </div>
                   </div>
                 </div>
               </div>
             );
          })}
        </div>
      </motion.div>
    </div>
  );
}
