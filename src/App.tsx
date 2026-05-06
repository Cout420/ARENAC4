import React, { useState, lazy, Suspense } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { FloatingButtons } from './components/FloatingButtons';
import { AdminBar } from './components/AdminBar';
import { useStore } from './store/useStore';
import { AuthProvider, useAuth } from './components/AuthContext';
import { ProfileCompletionModal } from './components/ProfileCompletionModal';
import { AnimatePresence, motion } from 'motion/react';

const Facilities = lazy(() => import('./components/Facilities').then(module => ({ default: module.Facilities })));
const Booking = lazy(() => import('./components/Booking').then(module => ({ default: module.Booking })));
const MonthlyPlans = lazy(() => import('./components/MonthlyPlans').then(module => ({ default: module.MonthlyPlans })));
const PhotographyHub = lazy(() => import('./components/PhotographyHub').then(module => ({ default: module.PhotographyHub })));
const Menu = lazy(() => import('./components/Menu').then(module => ({ default: module.Menu })));
const UserDashboard = lazy(() => import('./components/UserDashboard').then(module => ({ default: module.UserDashboard })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));

function DashboardRouter({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, profile, signIn } = useAuth();
  
  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
        <div className="bg-zinc-950 p-8 rounded-2xl border border-white/10 text-center max-w-sm w-full">
          <h2 className="text-xl font-black uppercase italic tracking-widest text-white mb-4">Acesso Restrito</h2>
          <p className="text-sm text-zinc-400 mb-6">Você precisa estar logado para acessar esta área.</p>
          <button onClick={() => { signIn(); onClose(); }} className="w-full bg-gradient-to-r from-arena-orange to-arena-pink text-white font-black uppercase text-sm py-4 rounded-xl">Entrar com Google</button>
          <button onClick={onClose} className="w-full mt-2 text-zinc-500 uppercase text-xs font-black py-2 hover:text-white">Cancelar</button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <Suspense fallback={<div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center"><LoadingFallback /></div>}>
        {profile?.role === 'admin' ? (
          <AdminDashboard onClose={onClose} />
        ) : (
          <UserDashboard onClose={onClose} />
        )}
      </Suspense>
    </AnimatePresence>
  );
}

function LoadingFallback() {
  return (
    <div className="py-24 flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-zinc-800 border-t-arena-orange rounded-full animate-spin"></div>
    </div>
  );
}

function AppContent() {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const { isLoggedIn, isAdminMode, _hasHydrated } = useStore();
  const { loading, requireProfileCompletion, user, profile, signOut } = useAuth();

  if (loading || !_hasHydrated) {
    return (
      <div className="min-h-screen bg-arena-dark flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-zinc-800 border-t-arena-orange rounded-full animate-spin"></div>
          <p className="mt-4 text-arena-yellow font-black uppercase italic tracking-widest text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-arena-dark text-white min-h-screen font-sans overflow-x-hidden selection:bg-arena-yellow selection:text-black ${isAdminMode ? 'pt-10' : ''}`}>
      {requireProfileCompletion && <ProfileCompletionModal />}
      <AdminBar onOpenDashboard={() => setIsDashboardOpen(true)} />
      <Navbar />
      <Hero />
      <Suspense fallback={<LoadingFallback />}>
        <Facilities />
        <Booking />
        <MonthlyPlans />
        <PhotographyHub />
        <Menu />
      </Suspense>
      <Footer onAdminClick={() => setIsDashboardOpen(true)} />
      <FloatingButtons />
      
      {/* Floating user menu if logged in and not admin */}
      {user && profile?.role !== 'admin' && (
        <div className="fixed bottom-6 left-6 z-50 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDashboardOpen(true)}
            className="px-4 py-2 bg-zinc-900 border border-white/10 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-xl flex items-center gap-2"
          >
            Meus Agendamentos
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={signOut}
            className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-xs font-black uppercase tracking-widest text-red-500 shadow-xl flex items-center gap-2"
          >
            Sair
          </motion.button>
        </div>
      )}

      <DashboardRouter isOpen={isDashboardOpen} onClose={() => setIsDashboardOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
