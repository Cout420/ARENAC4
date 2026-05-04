import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Calendar, UserX, Check, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useAuth } from './AuthContext';

export function AdminDashboard({ onClose }: { onClose: () => void }) {
  const [bookings, setBookings] = useState<any[]>([]);
  const [usersCache, setUsersCache] = useState<Record<string, any>>({});
  const { profile } = useAuth();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'bookings'), (snap) => {
      const bks: any[] = [];
      snap.forEach(d => bks.push({ id: d.id, ...d.data() }));
      bks.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setBookings(bks);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'bookings'));
    return () => unsub();
  }, []);

  useEffect(() => {
    bookings.forEach(async (b) => {
      if (!usersCache[b.userId]) {
        try {
          const userDoc = await getDoc(doc(db, 'users', b.userId));
          if (userDoc.exists()) {
            setUsersCache(prev => ({ ...prev, [b.userId]: userDoc.data() }));
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, 'users');
        }
      }
    });
  }, [bookings]);

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'bookings');
    }
  };

  const blockUser = async (userId: string) => {
    if (!window.confirm("Bloquear este usuário permanentemente?")) return;
    try {
      await updateDoc(doc(db, 'users', userId), { isBlocked: true });
      // Update cache locally for immediate UI response
      setUsersCache(prev => ({...prev, [userId]: {...prev[userId], isBlocked: true}}));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'users');
    }
  };

  if (profile?.role !== 'admin') {
    return <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center text-white"><p>Sem permissão.</p><button onClick={onClose} className="mt-4 px-4 py-2 bg-arena-orange">Sair</button></div>;
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-[200] flex justify-end p-4 lg:p-10 overflow-hidden backdrop-blur-sm">
      <motion.div 
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%' }}
        className="w-full max-w-4xl bg-zinc-950 border border-white/10 rounded-2xl p-6 lg:p-10 flex flex-col h-full shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white font-black uppercase text-xs">X Fechar Painel</button>
        
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-8 border-b border-white/5 pb-4">
          <ShieldAlert className="inline-block mr-3 text-arena-orange" />
          Painel de Admin
        </h2>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {bookings.length === 0 ? (
             <p className="text-zinc-500 italic text-sm">Nenhum agendamento encontrado.</p>
          ) : bookings.map(b => {
             const user = usersCache[b.userId];
             const isWO = b.status === 'wo';
             const isConfirmed = b.status === 'confirmed';

             return (
               <div key={b.id} className={`p-4 rounded-xl border ${isWO ? 'border-red-500/20 bg-red-950/10' : 'border-white/5 bg-zinc-900'} grid grid-cols-1 md:grid-cols-12 gap-4 items-center`}>
                 <div className="col-span-4">
                   <div className="flex items-center gap-2 mb-1">
                     <Calendar size={14} className="text-zinc-500" />
                     <span className="text-sm font-bold text-white uppercase">{b.sport} • {b.dateId} às {b.time}</span>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-sm ${b.status === 'pending' ? 'bg-[#FFD700] text-black animate-pulse' : isConfirmed ? 'bg-arena-yellow text-black' : 'bg-red-500 text-white'}`}>
                       {b.status === 'pending' ? 'AGUARDANDO PIX' : b.status}
                     </span>
                   </div>
                 </div>

                 <div className="col-span-5 border-l border-white/5 pl-4">
                   {user ? (
                     <>
                       <p className="text-sm font-black uppercase text-white truncate">{user.name} {user.isBlocked && <span className="text-red-500 ml-2">(Bloqueado)</span>}</p>
                       <p className="text-xs text-zinc-400 font-mono mt-1">Zap: {user.whatsapp} • CPF: {user.cpf}</p>
                     </>
                   ) : <p className="text-xs text-zinc-500">Carregando perfil...</p>}
                 </div>

                 <div className="col-span-3 flex justify-end gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                   {b.status !== 'confirmed' && (
                     <button onClick={() => updateBookingStatus(b.id, 'confirmed')} className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-colors" title="Confirmar Jogo">
                       <Check size={18} strokeWidth={3} />
                     </button>
                   )}
                   {b.status !== 'wo' && (
                     <button onClick={() => updateBookingStatus(b.id, 'wo')} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors" title="Marcar como W.O.">
                       <AlertTriangle size={18} strokeWidth={3} />
                     </button>
                   )}
                   {user && !user.isBlocked && isWO && (
                     <button onClick={() => blockUser(b.userId)} className="p-2 flex items-center gap-1 rounded-lg bg-red-600 text-white hover:bg-red-500 text-[10px] font-black uppercase transition-colors" title="Bloquear Conta">
                       <UserX size={14} /> Banir
                     </button>
                   )}
                 </div>
               </div>
             );
          })}
        </div>
      </motion.div>
    </div>
  );
}
