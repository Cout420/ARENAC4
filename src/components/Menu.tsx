import React, { useState } from 'react';
import { QrCode, CupSoda, Utensils, Flame, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { EditableText } from './Editable';

const ICONS: Record<string, React.ReactNode> = {
  'bebidas': <CupSoda size={18} />,
  'porcoes': <Utensils size={18} />,
  'espetinhos': <Flame size={18} />,
};

export function Menu() {
  const [activeTab, setActiveTab] = useState('bebidas');
  const { menuCategories, menuItems, updateMenuItem, isAdminMode, removeMenuItem, addMenuItem } = useStore();

  const handleAddNew = () => {
    addMenuItem({
      id: Date.now(),
      category: activeTab,
      name: 'Novo Item',
      description: 'Descrição do item',
      price: 0
    });
  };

  return (
    <section id="menu" className="py-24 px-4 bg-[#0a0a0a] border-t border-white/5 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-[#FFD700] mb-6">
            <QrCode size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Escaneie o QR Code na mesa e faça seu pedido!</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#CCFF00]">
            Nosso Menu
          </h2>
          <p className="text-zinc-400 font-medium max-w-2xl mx-auto">
            A melhor resenha pede as melhores porções e bebida gelada. Confira as opções do nosso bar!
          </p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {menuCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === category.id 
                  ? 'bg-[#FFD700] text-black' 
                  : 'bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-800'
              }`}
            >
              {ICONS[category.id] || <Utensils size={18} />}
              {category.name}
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {menuItems.filter(item => item.category === activeTab).map(item => (
            <div key={item.id} className={`relative group border-l-2 ${item.isSoldOut ? 'border-red-500 opacity-50' : 'border-[#FFD700]'} pl-4 py-2 hover:bg-white/5 transition-colors`}>
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1 pr-4">
                  <h3 className="text-sm font-bold uppercase text-white tracking-widest">
                    <EditableText value={item.name} onSave={v => updateMenuItem(item.id, { name: v })} />
                  </h3>
                  <div className="text-[10px] text-zinc-500 uppercase mt-1">
                    <EditableText value={item.description} onSave={v => updateMenuItem(item.id, { description: v })} />
                  </div>
                </div>
                <span className="text-sm font-mono text-[#CCFF00] bg-[#0A0A0A] pl-2 whitespace-nowrap">
                  R$ {isAdminMode ? (
                    <EditableText value={item.price.toString()} onSave={v => updateMenuItem(item.id, { price: parseFloat(v) || 0 })} />
                  ) : (
                    item.price.toFixed(2).replace('.', ',')
                  )}
                </span>
              </div>
              
              {isAdminMode && (
                <div className="absolute right-0 top-full mt-2 hidden group-hover:flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 z-10">
                  <button 
                    onClick={() => updateMenuItem(item.id, { isSoldOut: !item.isSoldOut })}
                    className={`text-xs px-2 py-1 ${item.isSoldOut ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white'}`}
                  >
                    Esgotado
                  </button>
                  <button onClick={() => removeMenuItem(item.id)} className="p-1 bg-zinc-800 text-zinc-400 hover:bg-red-500 hover:text-white">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {isAdminMode && (
            <button onClick={handleAddNew} className="flex items-center justify-center gap-2 border border-dashed border-zinc-700 text-zinc-500 hover:text-[#FFD700] hover:border-[#FFD700] py-4 transition-colors">
              <Plus size={16} /> Adicionar Item
            </button>
          )}
        </div>

      </div>
    </section>
  );
}
