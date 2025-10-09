import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Ayah } from './types';
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

const HeaderButton = React.forwardRef<HTMLButtonElement, {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  label: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}>(({ onClick, label, title, children, className = '' }, ref) => (
  <div className="flex flex-col items-center justify-center w-14 text-center">
    <button ref={ref} onClick={onClick} title={title} aria-label={title} className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${className}`}>
      {children}
    </button>
    <span className="text-xs text-gray-400 mt-1">{label}</span>
  </div>
));
HeaderButton.displayName = 'HeaderButton';


export function App() {
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedReciter, setSelectedReciter] = useState<string>(RECITERS[0]?.identifier || '');
  const [selectedTranslation, setSelectedTranslation] = useState<string>(TRANSLATIONS[0]?.identifier || '');
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [memorizationState, setMemorizationState] = useState<Record<number, number>>({});
  
  const handlePlaybackEnd = useCallback(() => {
    // Player no longer automatically hides after the 7th listen.
    // It stays open to allow for "Re-listen" and "Read" controls.
  }, []);

  const { surahs, surahData, isLoading, error, loadSurahData } = useQuran();
  const { isAyahPlaying, playAyah, isRadioPlaying, toggleRadio } = useAudioController(handlePlaybackEnd);
  const { isOpen: isTafsirOpen, tafsirAyah, tafsirContent, isTafsirLoading, showTafsir, closeTafsir } = useTafsirModal();
  const { location, setLocation, prayerTimes, isLoading: isPrayerTimesLoading, error: prayerTimesError } = usePrayerTimes();
  
  const [isSelectorPanelOpen, setIsSelectorPanelOpen] = useState(true);
  const [isPrayerTimesOpen, setIsPrayerTimesOpen] = useState(false);

  const [scrollToAyah, setScrollToAyah] = useState<{ surah: number; ayah: number } | null>(null);

  const ayahRefs = useRef<Record<number, HTMLLIElement | null>>({});
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  
  // This effect will create space for the player controls at the bottom of the page
  // so it doesn't overlap the footer.
  useEffect(() => {
    const playerHeight = '96px'; // Approximate height of the player controls
    if (selectedAyah) {
      document.body.style.paddingBottom = playerHeight;
    } else {
      document.body.style.paddingBottom = '0px';
    }
    // Cleanup on component unmount
    return () => {
      document.body.style.paddingBottom = '0px';
    };
  }, [selectedAyah]);

  useEffect(() => {
    if (surahs.length > 0) {
      if (scrollToAyah && selectedSurah === scrollToAyah.surah) {
        // Surah is already loaded or is loading, wait for it
      } else {
        loadSurahData(selectedSurah, selectedReciter, selectedTranslation);
      }
    }
  }, [selectedSurah, selectedReciter, selectedTranslation, surahs, loadSurahData]);

  useEffect(() => {
    if (surahData && scrollToAyah && surahData.number === scrollToAyah.surah) {
      const targetAyah = surahData.ayahs.find(a => a.numberInSurah === scrollToAyah.ayah);
      if (targetAyah) {
        setSelectedAyah(targetAyah);
      }
      setScrollToAyah(null); // Reset after scrolling
    }
  }, [surahData, scrollToAyah]);


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
  
  const handleSelfReadClick = useCallback(() => {
    if (!selectedAyah) return;
    setMemorizationState(prevState => ({
      ...prevState,
      [selectedAyah.number]: (prevState[selectedAyah.number] || 0) + 1,
    }));
  }, [selectedAyah]);

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

  const handleClosePlayer = useCallback(() => {
    setSelectedAyah(null);
  }, []);

  const isFirstAyah = selectedAyah?.number === surahData?.ayahs[0]?.number;
  const isLastAyahInQuran = selectedAyah?.number === surahData?.ayahs[surahData.ayahs.length - 1]?.number && selectedSurah === 114;
  
  const isLastSurah = selectedSurah === 114;
  const nextSurahInfo = !isLastSurah ? surahs.find(s => s.number === selectedSurah + 1) : null;
  const nextSurahName = nextSurahInfo ? nextSurahInfo.name : null;

  const handleGoToNextSurah = useCallback(() => {
      if (!isLastSurah) {
          const nextSurahNumber = selectedSurah + 1;
          setSelectedSurah(nextSurahNumber);
          setSelectedAyah(null); // Reset selected ayah
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  }, [isLastSurah, selectedSurah]);

  const surahInfoString = useMemo(() => {
    if (!surahData || !surahData.ayahs || surahData.ayahs.length === 0) {
      return surahData ? surahData.name : null;
    }

    const firstAyah = surahData.ayahs[0];
    const lastAyah = surahData.ayahs[surahData.ayahs.length - 1];

    const startJuz = firstAyah.juz;
    const endJuz = lastAyah.juz;
    const juzString = startJuz === endJuz ? `الجزء ${startJuz}` : `الجزء ${startJuz} - ${endJuz}`;

    const startPage = firstAyah.page;
    const endPage = lastAyah.page;
    const pageString = startPage === endPage ? `صفحة ${startPage}` : `صفحة ${startPage} - ${endPage}`;
    
    return `${surahData.name} | ${juzString} | ${pageString}`;
  }, [surahData]);

  return (
    <div className="text-white min-h-screen flex flex-col">
      <div className="sticky top-0 z-30">
        <header className="bg-slate-800/80 backdrop-blur-sm shadow-lg border-b border-slate-700/50">
          <div className="container mx-auto flex justify-between items-center px-2 sm:px-4 md:px-6 py-2">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-amber-400 leading-tight">قرآن الكريم</h1>
              <p className="text-base text-gray-200 mt-1 leading-tight">المعين لحفظ كلام رب العالمين</p>
              {surahInfoString && <p className="text-xs text-gray-400 mt-1 truncate">{surahInfoString}</p>}
            </div>
            <div className="flex items-center gap-0">
               <HeaderButton
                  onClick={() => setIsSelectorPanelOpen(p => !p)}
                  label="الإعدادات"
                  title="الإعدادات"
                  className="hover:bg-slate-700"
                  ref={settingsButtonRef}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform duration-300 ${isSelectorPanelOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
               </HeaderButton>
               <HeaderButton
                  onClick={() => setIsPrayerTimesOpen(true)}
                  label="المواقيت"
                  title="أوقات الصلاة"
                  className="hover:bg-slate-700 text-white"
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V9.586a1 1 0 01.293-.707l6-6a1 1 0 011.414 0l6 6a1 1 0 01.293.707V21M7 21v-4a1 1 0 011-1h8a1 1 0 011 1v4" />
                  </svg>
               </HeaderButton>
               <HeaderButton
                 onClick={() => toggleRadio(RADIO_STREAM_URL)}
                 label="الإذاعة"
                 title="إذاعة القرآن الكريم"
                 className={`hover:bg-slate-700 ${isRadioPlaying ? 'text-amber-400' : 'text-white'}`}
               >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m-12.728-12.728a9 9 0 0112.728 0M12 18a6 6 0 100-12 6 6 0 000 12z" />
                     <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
               </HeaderButton>
            </div>
          </div>
        </header>
        
        <div ref={settingsPanelRef} className={`absolute w-full z-20 transition-all duration-500 ease-in-out overflow-hidden ${isSelectorPanelOpen ? 'max-h-[30rem]' : 'max-h-0 opacity-0'}`}>
            <div className="p-4 md:p-6 bg-slate-900/90 backdrop-blur-sm shadow-lg">
              <div className="container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SurahSelector surahs={surahs} selectedSurah={selectedSurah} onChange={(e) => setSelectedSurah(Number(e.target.value))} disabled={isLoading} />
                  <ReciterSelector reciters={RECITERS} selectedReciter={selectedReciter} onChange={(e) => setSelectedReciter(e.target.value)} disabled={isLoading} />
                  <TranslationSelector translations={TRANSLATIONS} selectedTranslation={selectedTranslation} onChange={(e) => setSelectedTranslation(e.target.value)} disabled={isLoading}/>
                </div>
              </div>

              <div 
                onClick={() => setIsSelectorPanelOpen(false)}
                className="mt-4 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:text-amber-400 transition-colors"
                role="button"
                aria-label="إغلاق لوحة الإعدادات"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-xs font-semibold">اضغط للإغلاق</span>
              </div>
               <div className="mt-6 text-center text-sm">
                  <p className="font-semibold text-lg" style={{ color: '#FFD700' }}>
                      تم بواسطة كريم مجدي آل عشماوي
                  </p>
                  <p className="font-semibold text-lg" style={{ color: '#FFD700' }}>
                      صدقة جارية لأمي رحمها الله.
                  </p>
              </div>
            </div>
        </div>
      </div>
      
      <main className="container mx-auto p-4 md:p-6 flex-grow">
        <ErrorMessage message={error} />
        <AyahDisplay
          surah={surahData}
          isLoading={isLoading}
          onAyahClick={handleAyahClick}
          memorizationState={memorizationState}
          selectedAyah={selectedAyah}
          ayahRefs={ayahRefs}
          onShowTafsir={handleShowTafsir}
          onGoToNextSurah={handleGoToNextSurah}
          nextSurahName={nextSurahName}
          isLastSurah={isLastSurah}
        />
      </main>

      <footer className="bg-slate-900/90 border-t border-slate-700/50 py-4 px-6 text-center text-sm">
        <div className="container mx-auto">
          <p className="font-semibold text-lg" style={{ color: '#FFD700' }}>
            تم بواسطة كريم مجدي آل عشماوي
          </p>
          <p className="font-semibold text-lg" style={{ color: '#FFD700' }}>
            صدقة جارية لأمي رحمها الله.
          </p>
        </div>
      </footer>

      <PlayerControls
        ayah={selectedAyah}
        count={selectedAyah ? memorizationState[selectedAyah.number] || 0 : 0}
        isAudioPlaying={isAyahPlaying}
        onActionButtonClick={handleActionButtonClick}
        onSelfReadClick={handleSelfReadClick}
        onNext={() => handleAyahNavigation('next')}
        onPrevious={() => handleAyahNavigation('prev')}
        isLastAyah={isLastAyahInQuran}
        isFirstAyah={isFirstAyah}
        isVisible={!!selectedAyah}
        onClose={handleClosePlayer}
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