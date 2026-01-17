
import React, { useState, useEffect } from 'react';
import { Ayah, Tafsir } from '../types';

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  ayah: Ayah | null;
  tafsirContent: Tafsir | null;
  isLoading: boolean;
  surahName: string;
  t: any;
}

const RTL_LANGS = ['ar', 'ur', 'he', 'fa'];

const TafsirModal: React.FC<TafsirModalProps> = ({ isOpen, onClose, ayah, tafsirContent, isLoading, surahName, t }) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    } else {
      // Delay unmounting for exit animation
      const timer = setTimeout(() => setShowModal(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) {
    return null;
  }
  
  const isRtl = (lang: string | undefined) => lang ? RTL_LANGS.includes(lang) : false;

  return (
    <div 
      className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'bg-opacity-70' : 'bg-opacity-0'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tafsir-title"
    >
      <div 
        className={`bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <header className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 id="tafsir-title" className="text-2xl font-bold text-amber-400">
            {t.tafsirTitle} {ayah?.numberInSurah} {t.surah === 'سورة' ? 'من' : 'from'} {t.surah} {surahName}
          </h2>
          <button 
            onClick={onClose}
            className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-colors"
            aria-label={t.close}
          >
            &times;
          </button>
        </header>
        
        <div className="p-8 border-b border-slate-700 flex-shrink-0">
          <p className="text-3xl md:text-4xl lg:text-5xl leading-loose md:leading-relaxed font-quran text-gray-200 text-right" dir="rtl">
            {ayah?.text}
          </p>
        </div>

        <div className="p-8 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
               <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            </div>
          ) : tafsirContent ? (
            <>
              {tafsirContent.arabic && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-amber-300 mb-4 text-right">{t.tafsirMoyassar}</h3>
                  <p className="text-xl lg:text-2xl leading-loose text-gray-300 text-right font-amiri whitespace-pre-wrap" dir="rtl">
                    {tafsirContent.arabic}
                  </p>
                </div>
              )}
              {tafsirContent.translation?.text && (
                <div>
                  <h3 
                    className={`text-xl font-bold text-amber-300 mb-4 ${isRtl(tafsirContent.translation.lang) ? 'text-right' : 'text-left'}`} 
                    dir={isRtl(tafsirContent.translation.lang) ? 'rtl' : 'ltr'}>
                    {tafsirContent.translation.name}
                  </h3>
                  <p 
                    className={`text-lg lg:text-xl leading-relaxed text-gray-300 whitespace-pre-wrap ${isRtl(tafsirContent.translation.lang) ? 'text-right' : 'text-left'}`} 
                    dir={isRtl(tafsirContent.translation.lang) ? 'rtl' : 'ltr'}>
                    {tafsirContent.translation.text}
                  </p>
                </div>
              )}
              {!tafsirContent.arabic && !tafsirContent.translation?.text && (
                 <p className="text-xl text-center text-red-400">
                    {t.tafsirErrorDetails}
                 </p>
              )}
            </>
          ) : (
            <p className="text-xl text-center text-red-400">
              {t.tafsirErrorDetails}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TafsirModal;
