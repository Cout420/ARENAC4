import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Edit2, ImagePlus, Check, X } from 'lucide-react';

interface EditableTextProps {
  value: string;
  onSave: (value: string) => void;
  className?: string;
  multiline?: boolean;
}

export function EditableText({ value, onSave, className = '', multiline = false }: EditableTextProps) {
  const isAdminMode = useStore(state => state.isAdminMode);
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  if (!isAdminMode) {
    return <span className={className}>{value}</span>;
  }

  if (isEditing) {
    return (
      <div className="relative inline-block w-full z-50">
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className={`w-full bg-[#111] border border-[#CCFF00] text-white p-2 rounded focus:outline-none ${className}`}
            rows={4}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className={`w-full bg-[#111] border border-[#CCFF00] text-white p-2 rounded focus:outline-none ${className}`}
          />
        )}
        <div className="absolute -bottom-10 right-0 flex gap-2">
          <button onClick={handleSave} className="bg-[#CCFF00] text-black p-1 rounded hover:bg-white"><Check size={16} /></button>
          <button onClick={handleCancel} className="bg-red-500 text-white p-1 rounded hover:bg-red-600"><X size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group inline-block cursor-pointer w-full" onClick={() => setIsEditing(true)}>
      <div className={`transition-colors group-hover:bg-[#CCFF00]/10 ring-1 ring-transparent group-hover:ring-[#CCFF00]/50 rounded p-1 ${className}`}>
        {value}
      </div>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-[#CCFF00] text-black w-6 h-6 rounded flex items-center justify-center transition-opacity shadow-lg">
        <Edit2 size={12} />
      </div>
    </div>
  );
}

interface EditableImageProps {
  src: string;
  onSave: (url: string) => void;
  className?: string;
  aspectRatio?: string;
  loading?: 'lazy' | 'eager';
}

export function EditableImage({ src, onSave, className = '', aspectRatio = 'aspect-[4/3]', loading }: EditableImageProps) {
  const isAdminMode = useStore(state => state.isAdminMode);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simulated file upload
  const handleUpload = () => {
    // In a real app this would open a file picker and upload to storage.
    // For now we simulate changing the image url via prompt.
    const url = window.prompt('URL da nova imagem (simulação de upload):', src);
    if (url && url !== src) {
      setIsLoaded(false);
      onSave(url);
    }
  };

  const imageClass = `transition-all duration-500 ${!isLoaded ? 'blur-sm scale-105' : 'blur-0 scale-100'} ${className}`;

  if (!isAdminMode) {
    return (
      <div className={`relative w-full h-full bg-zinc-900 overflow-hidden`}>
        {/* Placeholder Background */}
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 animate-pulse z-0">
            <svg className="w-8 h-8 text-zinc-800 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <img 
          src={src} 
          alt="Gallery" 
          className={`relative z-10 ${imageClass}`} 
          loading={loading}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    );
  }

  return (
    <div className={`relative group w-full h-full cursor-pointer overflow-hidden bg-zinc-900`}>
      {/* Placeholder Background */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 animate-pulse z-0">
          <svg className="w-8 h-8 text-zinc-800 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      <img 
        src={src} 
        alt="Gallery" 
        className={`relative z-10 group-hover:grayscale group-hover:opacity-50 ${imageClass}`} 
        loading={loading}
        onLoad={() => setIsLoaded(true)}
      />
      
      <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpload(); }}
          className="pointer-events-auto bg-[#CCFF00] text-black font-black uppercase text-sm px-4 py-2 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl"
        >
          <ImagePlus size={16} />
          Trocar Foto
        </button>
      </div>
    </div>
  );
}
