import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Ayah, Reciter, Translation } from './types';
import { RECITERS, TRANSLATIONS, RADIO_STREAM_URL } from './constants';
import { useQuran } from './hooks/useQuran';
import { useAudioController } from './hooks/useAudioController';
import { useTafsirModal } from './hooks/useTafsirModal';
import { usePrayerTimes } from './hooks/usePrayerTimes';

import SurahSelector from './components/SurahSelector';
import ReciterSelector from './components/ReciterSelector';
import TranslationSelector from './components/TranslationSelector';
import AyahDisplay from './components/AyahDisplay';
import PlayerControls from './components/PlayerControls';
import TafsirModal from './components/TafsirModal';
import ErrorMessage from './components/ErrorMessage';
import PrayerTimes from './components/PrayerTimes';

export function App() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedReciter, setSelectedReciter] = useState<string>(RECITERS[0]?.identifier || '');
  const [selectedTranslation, setSelectedTranslation] = useState<string>(TRANSLATIONS[0]?.identifier || '');
  
  const { surahs, surahData, isLoading, error, loadSurahData } = useQuran();
  const { isAyahPlaying, playAyah, isRadioPlaying, toggleRadio } = useAudioController();
  const { isOpen: isTafsirOpen, tafsirAyah, tafsirContent, isTafsirLoading, showTafsir, closeTafsir } = useTafsirModal();
  const { location, setLocation, prayerTimes, isLoading: isPrayerTimesLoading, error: prayerTimesError } = usePrayerTimes();
  
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [memorizationState, setMemorizationState] = useState<Record<number, number>>({});
  const [isSelectorPanelOpen, setIsSelectorPanelOpen] = useState(true);
  const [isPrayerTimesOpen, setIsPrayerTimesOpen] = useState(false);

  const ayahRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (surahs.length > 0) {
      loadSurahData(selectedSurah, selectedReciter, selectedTranslation);
    }
  }, [selectedSurah, selectedReciter, selectedTranslation, surahs, loadSurahData]);

  useEffect(() => {
    if (selectedAyah) {
      ayahRefs.current[selectedAyah.number]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedAyah]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        settingsPanelRef.current && !settingsPanelRef.current.contains(event.target as Node) &&
        settingsButtonRef.current && !settingsButtonRef.current.contains(event.target as Node)
      ) {
        setIsSelectorPanelOpen(false);
      }
    };
    if (isSelectorPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSelectorPanelOpen]);
  
  const handleAyahMemorizationClick = useCallback((ayah: Ayah | null) => {
    if (!ayah || isAyahPlaying) return;
    const currentCount = memorizationState[ayah.number] || 0;
    const nextCount = currentCount + 1;
    setMemorizationState(prevState => ({ ...prevState, [ayah.number]: nextCount }));
    if (nextCount <= 7) {
      playAyah(ayah);
    }
  }, [isAyahPlaying, memorizationState, playAyah]);

  const handleActionButtonClick = useCallback(() => {
    if (!selectedAyah || isAyahPlaying) return;
    const currentCount = memorizationState[selectedAyah.number] || 0;
    if (currentCount >= 7) {
      playAyah(selectedAyah);
    } else {
      handleAyahMemorizationClick(selectedAyah);
    }
  }, [selectedAyah, isAyahPlaying, memorizationState, playAyah, handleAyahMemorizationClick]);

  const handleAyahNavigation = useCallback((direction: 'next' | 'prev') => {
    if (isAyahPlaying || !surahData || !selectedAyah) return;
    const currentIndex = surahData.ayahs.findIndex(a => a.number === selectedAyah.number);
    const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= 0 && nextIndex < surahData.ayahs.length) {
      setSelectedAyah(surahData.ayahs[nextIndex]);
    }
  }, [isAyahPlaying, surahData, selectedAyah]);
  
  const handleShowTafsir = (ayah: Ayah) => showTafsir(ayah, selectedTranslation);
  
  const handleAyahClick = (ayah: Ayah) => {
    if (selectedAyah?.number === ayah.number) {
        setSelectedAyah(null);
    } else {
        setSelectedAyah(ayah);
    }
  };

  const isFirstAyah = selectedAyah?.number === surahData?.ayahs[0]?.number;
  const isLastAyah = selectedAyah?.number === surahData?.ayahs[surahData.ayahs.length - 1]?.number;

  return (
    <div className="text-white min-h-screen">
      <div className="sticky top-0 z-30">
        <header className="bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-slate-700/50">
          <div className="container mx-auto flex justify-between items-center px-4 md:px-6 py-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-amber-400 leading-tight">قرآن الكريم</h1>
              <p className="text-base text-gray-200 mt-1 leading-tight">المعين لحفظ كلام رب العالمين</p>
              {surahData && <p className="text-sm text-gray-400 mt-2 truncate">{surahData.name}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button ref={settingsButtonRef} onClick={() => setIsSelectorPanelOpen(p => !p)} className="h-12 w-12 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors" aria-label="Toggle settings panel" title="الإعدادات">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-7 w-7 transition-transform duration-300 ${isSelectorPanelOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button onClick={() => setIsPrayerTimesOpen(true)} className="h-12 w-12 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors text-white" aria-label="أوقات الصلاة" title="أوقات الصلاة">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V9.586a1 1 0 01.293-.707l6-6a1 1 0 011.414 0l6 6a1 1 0 01.293.707V21M7 21v-4a1 1 0 011-1h8a1 1 0 011 1v4" />
                </svg>
              </button>
              <button onClick={() => toggleRadio(RADIO_STREAM_URL)} className={`h-12 w-12 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors ${isRadioPlaying ? 'text-amber-400' : 'text-white'}`} aria-label="Toggle Quran Radio" title="إذاعة القرآن الكريم من القاهرة">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-12.728-12.728a9 9 0 0112.728 0M12 18a6 6 0 100-12 6 6 0 000 12z" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button onClick={() => window.close()} className="h-12 w-12 flex items-center justify-center rounded-full hover:bg-slate-700 transition-colors" aria-label="إغلاق التطبيق" title="إغلاق">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        <div ref={settingsPanelRef} className={`absolute w-full z-20 transition-all duration-500 ease-in-out overflow-hidden ${isSelectorPanelOpen ? 'max-h-96' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 md:p-6 bg-slate-900/90 backdrop-blur-sm shadow-lg">
              <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <SurahSelector surahs={surahs} selectedSurah={selectedSurah} onChange={(e) => setSelectedSurah(Number(e.target.value))} disabled={isLoading} />
                  <ReciterSelector reciters={RECITERS} selectedReciter={selectedReciter} onChange={(e) => setSelectedReciter(e.target.value)} disabled={isLoading} />
                  <TranslationSelector translations={TRANSLATIONS} selectedTranslation={selectedTranslation} onChange={(e) => setSelectedTranslation(e.target.value)} disabled={isLoading}/>
                </div>
                <div className="text-center text-xs text-gray-400 mt-6">
                  <p>تم بواسطة كريم مجدي آل عشماوي</p>
                  <p>صدقة جارية لأمي رحمها الله.</p>
                </div>
              </div>
            </div>
        </div>
      </div>
      
      <main className="container mx-auto p-4 md:p-6">
        <ErrorMessage message={error} />
        <AyahDisplay
          surah={surahData}
          isLoading={isLoading}
          onAyahClick={handleAyahClick}
          memorizationState={memorizationState}
          selectedAyah={selectedAyah}
          ayahRefs={ayahRefs}
          onShowTafsir={handleShowTafsir}
        />
      </main>

      <PlayerControls
        ayah={selectedAyah}
        count={selectedAyah ? memorizationState[selectedAyah.number] || 0 : 0}
        isAudioPlaying={isAyahPlaying}
        onActionButtonClick={handleActionButtonClick}
        onNext={() => handleAyahNavigation('next')}
        onPrevious={() => handleAyahNavigation('prev')}
        isLastAyah={isLastAyah}
        isFirstAyah={isFirstAyah}
        isVisible={!!selectedAyah}
      />

      <TafsirModal
        isOpen={isTafsirOpen}
        onClose={closeTafsir}
        ayah={tafsirAyah}
        tafsirContent={tafsirContent}
        isLoading={isTafsirLoading}
        surahName={surahData?.name || ''}
      />
      
      <PrayerTimes
        isOpen={isPrayerTimesOpen}
        onClose={() => setIsPrayerTimesOpen(false)}
        data={prayerTimes}
        isLoading={isPrayerTimesLoading}
        error={prayerTimesError}
        currentLocation={location}
        onLocationChange={setLocation}
      />
    </div>
  );
}