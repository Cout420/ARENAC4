import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { useStore } from '../store/useStore';
import { Edit2, ImagePlus, Check, X, Loader2 } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

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
  buttonPosition?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function EditableImage({ 
  src, 
  onSave, 
  className = '', 
  aspectRatio = 'aspect-[4/3]', 
  loading,
  buttonPosition = 'center'
}: EditableImageProps) {
  const isAdminMode = useStore(state => state.isAdminMode);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `images/${Date.now()}-${uniqueId}.${fileExt}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setIsLoaded(false); // Reset to trigger blur animation
      onSave(downloadURL);
    } catch (error: any) {
      console.error("Upload error", error);
      if (error.code === 'storage/retry-limit-exceeded') {
        alert("Erro do Firebase Storage: Limite de tentativas excedido.\n\nISSO GERALMENTE OCORRE PORQUE O STORAGE NÃO FOI ATIVADO NO CONSOLE.\n1. Acesse o Firebase Console.\n2. Vá em 'Storage' e clique em 'Get Started'.\n3. Configure as Regras (Rules) para permitir leitura/escrita.");
      } else if (error.code === 'storage/unauthorized') {
        alert("Erro de Permissão: Suas regras do Firebase Storage estão bloqueando o upload. Acesse o Console do Firebase > Storage > Rules e libere o acesso (ex: allow read, write: if true;).");
      } else {
        alert(`Erro ao fazer upload da imagem: ${error.message || 'Desconhecido'}`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = () => {
    fileInputRef.current?.click();
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
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      
      {/* Placeholder Background */}
      {(!isLoaded || isUploading) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 backdrop-blur-sm z-30">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-[#CCFF00] animate-spin mb-2" />
          ) : (
            <svg className="w-8 h-8 text-zinc-800 mb-2 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      )}
      
      <img 
        src={src} 
        alt="Gallery" 
        className={`relative z-10 group-hover:grayscale group-hover:opacity-50 ${imageClass}`} 
        loading={loading}
        onLoad={() => setIsLoaded(true)}
      />
      
      <div 
        className={`absolute z-[60] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex ${
          buttonPosition === 'center' ? 'inset-0 items-center justify-center' : 
          buttonPosition === 'top-left' ? 'top-24 left-8' :
          buttonPosition === 'top-right' ? 'top-24 right-8' :
          buttonPosition === 'bottom-left' ? 'bottom-8 left-8' :
          'bottom-8 right-8'
        }`}
      >
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleUpload(); }}
          disabled={isUploading}
          className="pointer-events-auto bg-[#CCFF00] text-black font-black uppercase text-sm px-4 py-2 flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {isUploading ? 'Enviando...' : 'Trocar Foto'}
        </button>
      </div>
    </div>
  );
}
