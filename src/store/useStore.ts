import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StoreState {
  isLoggedIn: boolean;
  isAdminMode: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  toggleAdminMode: () => void;
  // Hero slides
  slides: Array<{ id: string; badge: string; titleLine1: string; titleLine2: string; desc: string; bg: string; cardImage?: string }>;
  updateSlide: (id: string, data: Partial<StoreState['slides'][0]>) => void;
  // Facilities
  facilities: Array<{ id: number; title: string; description: string; image: string }>;
  updateFacility: (id: number, data: Partial<StoreState['facilities'][0]>) => void;
  // Photography Hub
  albums: Array<{ id: string; name: string }>;
  addAlbum: (album: { id: string; name: string }) => void;
  photos: Array<{ id: number; eventId: string; url: string; photographer: string }>;
  addPhoto: (photo: { id: number; eventId: string; url: string; photographer: string }) => void;
  removePhoto: (id: number) => void;
  // Hydration state
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  // Bookings
  bookings: Record<string, 'booked' | 'maintenance'>; // key: "sportId-date-time"
  setBookingStatus: (key: string, status: 'booked' | 'maintenance' | 'available') => void;
  // Menu
  menuCategories: Array<{ id: string; name: string }>;
  menuItems: Array<{ id: number; category: string; name: string; price: number; description: string; isSoldOut?: boolean }>;
  updateMenuItem: (id: number, data: Partial<StoreState['menuItems'][0]>) => void;
  addMenuItem: (item: StoreState['menuItems'][0]) => void;
  removeMenuItem: (id: number) => void;
  // Plans
  plans: Array<{ id: string; name: string; description: string; priceSociety: number; priceAreia: number; features: string[]; isPopular?: boolean }>;
  updatePlan: (id: string, data: Partial<StoreState['plans'][0]>) => void;
  // Settings
  settings: { whatsapp: string; hours: string; address: string };
  updateSettings: (data: Partial<StoreState['settings']>) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
  isAdminMode: false,
  _hasHydrated: false,
  setHasHydrated: (state) => set({ _hasHydrated: state }),
  login: (password) => {
    if (password === 'admin123') {
      set({ isLoggedIn: true, isAdminMode: true });
      return true;
    }
    return false;
  },
  logout: () => set({ isLoggedIn: false, isAdminMode: false }),
  toggleAdminMode: () => set((state) => ({ isAdminMode: !state.isAdminMode })),
  
  slides: [
    {
      id: 's1',
      badge: 'Campeões da Semana',
      titleLine1: 'Destaque C4',
      titleLine2: 'Time Vencedor',
      desc: 'O Hall da Fama da ARENA C4. Celebre as conquistas da sua equipe em nossa Quadra Oficial.',
      bg: 'https://i.imgur.com/XJfo1xK.jpeg',
      cardImage: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800&auto=format&fit=crop'
    },
    {
      id: 's2',
      badge: 'Infraestrutura Premium',
      titleLine1: 'Eventos & Festas',
      titleLine2: 'Na Arena C4',
      desc: 'Celebre o seu aniversário, confraternização de empresa ou evento especial em nosso salão com bar completo.',
      bg: 'https://images.unsplash.com/photo-1514722718698-22707604d40b?q=80&w=2000&auto=format&fit=crop',
    }
  ],
  updateSlide: (id, data) => set((state) => ({
    slides: state.slides.map(s => s.id === id ? { ...s, ...data } : s)
  })),

  facilities: [
    {
      id: 1,
      title: "Bar & Drinks",
      description: "Cerveja trincando, drinks especiais, porções deliciosas e telão para você resenhar com o time pós-jogo.",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Área de Churrasco",
      description: "Espaço completo com grelhas premium e mesas amplas para fazer aquele churrasco de responsa.",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Salão de Festas",
      description: "Salão com infraestrutura completa para eventos, aniversários e festas corporativas da sua empresa.",
      image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=800&auto=format&fit=crop"
    }
  ],
  updateFacility: (id, data) => set((state) => ({
    facilities: state.facilities.map(f => f.id === id ? { ...f, ...data } : f)
  })),

  albums: [
    { id: 'all', name: 'Todos os Álbuns' },
    { id: 'sabado', name: 'Sábado (Amistosos)' },
    { id: 'domingo', name: 'Domingo (Campeonatos)' },
    { id: 'oficiais', name: 'Fotos Oficiais' }
  ],
  addAlbum: (album) => set((state) => ({ albums: [...state.albums, album] })),
  
  photos: [
    { id: 1, eventId: 'sabado', url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop', photographer: 'Arena Foco' },
    { id: 2, eventId: 'sabado', url: 'https://images.unsplash.com/photo-1518605368461-1ee7e54f0a0c?q=80&w=600&auto=format&fit=crop', photographer: 'Arena Foco' },
    { id: 3, eventId: 'domingo', url: 'https://images.unsplash.com/photo-1431324155629-1a6d0a6ebbfc?q=80&w=600&auto=format&fit=crop', photographer: 'Lens Sports' },
    { id: 4, eventId: 'domingo', url: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=600&auto=format&fit=crop', photographer: 'Lens Sports' },
    { id: 5, eventId: 'oficiais', url: 'https://images.unsplash.com/photo-1514722718698-22707604d40b?q=80&w=600&auto=format&fit=crop', photographer: 'C4 Oficial' },
    { id: 6, eventId: 'oficiais', url: 'https://images.unsplash.com/photo-1558223604-ee9e99c3e986?q=80&w=600&auto=format&fit=crop', photographer: 'C4 Oficial' },
  ],
  addPhoto: (photo) => set((state) => ({ photos: [...state.photos, photo] })),
  removePhoto: (id) => set((state) => ({ photos: state.photos.filter(p => p.id !== id) })),

  bookings: {
    'society-0-19:00': 'booked',
    'society-0-20:00': 'booked',
    'society-0-21:00': 'booked',
  },
  setBookingStatus: (key, status) => set((state) => {
    const newBookings = { ...state.bookings };
    if (status === 'available') {
      delete newBookings[key];
    } else {
      newBookings[key] = status;
    }
    return { bookings: newBookings };
  }),

  menuCategories: [
    { id: 'espetinhos', name: 'Espetinhos Premium' },
    { id: 'porcoes', name: 'Porções' },
    { id: 'bebidas', name: 'Cervejas & Drinks' },
  ],
  menuItems: [
    { id: 1, category: 'espetinhos', name: 'Picanha', price: 15, description: 'Acompanha farofa e vinagrete.' },
    { id: 2, category: 'espetinhos', name: 'Medalhão de Frango', price: 12, description: 'Frango com bacon crocante.' },
    { id: 3, category: 'espetinhos', name: 'Coração', price: 10, description: 'Tradicional.' },
    { id: 4, category: 'porcoes', name: 'Fritas c/ Cheddar e Bacon', price: 45, description: 'Porção grande (700g).' },
    { id: 5, category: 'porcoes', name: 'Isca de Peixe', price: 55, description: 'Acompanha molho tártaro.' },
    { id: 6, category: 'bebidas', name: 'Heineken 600ml', price: 18, description: 'Trincando.' },
    { id: 7, category: 'bebidas', name: 'Gin Tônica', price: 30, description: 'Gin, tônica, limão e especiarias.' },
    { id: 8, category: 'bebidas', name: 'Refrigerante Lata', price: 7, description: 'Coca-Cola, Guaraná, etc.' },
  ],
  updateMenuItem: (id, data) => set((state) => ({
    menuItems: state.menuItems.map(item => item.id === id ? { ...item, ...data } : item)
  })),
  addMenuItem: (item) => set((state) => ({ menuItems: [...state.menuItems, item] })),
  removeMenuItem: (id) => set((state) => ({ menuItems: state.menuItems.filter(item => item.id !== id) })),

  plans: [
    {
      id: 'bronze',
      name: 'Bronze',
      description: 'Ideal para grupos de amigos',
      priceSociety: 600,
      priceAreia: 400,
      features: ['Jogo 1x na semana', 'Vaga fixa garantida', 'Bola e coletes inclusos'],
    },
    {
      id: 'prata',
      name: 'Prata',
      description: 'O mais procurado por times',
      priceSociety: 800,
      priceAreia: 600,
      isPopular: true,
      features: ['Jogo 1x na semana', 'Prioridade na Churrasqueira', '10% OFF no Bar & Drinks', 'Bola e coletes premium'],
    },
    {
      id: 'ouro',
      name: 'Ouro',
      description: 'Para empresas e ligas reais',
      priceSociety: 1200,
      priceAreia: 900,
      features: ['Jogo 2x na semana', 'Churrasqueira VIP Garantida', '20% OFF no Salão de Festas', 'Organização de Torneio Interno'],
    }
  ],
  updatePlan: (id, data) => set((state) => ({
    plans: state.plans.map(p => p.id === id ? { ...p, ...data } : p)
  })),

  settings: {
    whatsapp: '11964149969',
    hours: 'Seg a Dom - 08h às 23h',
    address: 'R. Anadir C. de Ávila, 820',
  },
  updateSettings: (data) => set((state) => ({
    settings: { ...state.settings, ...data }
  })),
    }),
    {
      name: 'arena-c4-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
      partialize: (state) => ({ 
        settings: state.settings,
        plans: state.plans,
        menuItems: state.menuItems,
        facilities: state.facilities,
        slides: state.slides,
        photos: state.photos,
        albums: state.albums
      })
    }
  )
);
