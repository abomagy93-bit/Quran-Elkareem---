import React from 'react';
import { SurahData, Ayah } from '../types';
import { MEMORIZATION_COLORS } from '../constants';

interface AyahDisplayProps {
  surah: SurahData | null;
  isLoading: boolean;
  onAyahClick: (ayah: Ayah) => void;
  memorizationState: Record<number, number>;
  selectedAyah: Ayah | null;
  ayahRefs: React.MutableRefObject<Record<number, HTMLLIElement | null>>;
  onShowTafsir: (ayah: Ayah) => void;
}

const AyahSkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-slate-800/80 rounded-lg h-32 w-full">
                <div className="p-6">
                    <div className="h-6 bg-slate-700/80 rounded w-11/12 mb-4"></div>
                    <div className="h-6 bg-slate-700/80 rounded w-10/12"></div>
                </div>
            </div>
        ))}
    </div>
);


const AyahDisplay: React.FC<AyahDisplayProps> = ({ surah, isLoading, onAyahClick, memorizationState, selectedAyah, ayahRefs, onShowTafsir }) => {
  if (isLoading) {
    return <div className="text-center px-4 pb-24"><AyahSkeletonLoader/></div>;
  }
  
  if (!surah) {
    return <div className="text-center p-10 text-xl text-white">اختر سورة للبدء</div>;
  }

  let lastJuz = 0;
  let lastPage = 0;

  return (
    <div className="text-center px-4 pb-24"> {/* Added padding-bottom for player */}
      <h2 className="text-3xl font-bold mb-2 text-amber-400 animate-fadeInUp opacity-0" style={{animationDelay: '100ms'}}>
        {surah.name} ({surah.englishName})
      </h2>
      <p className="mb-6 text-lg text-gray-400 animate-fadeInUp opacity-0" style={{animationDelay: '200ms'}}>{surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
      
      <ul className="space-y-4">
        {surah.ayahs.map((ayah, index) => {
          const isSelected = selectedAyah?.number === ayah.number;
          const count = memorizationState[ayah.number] || 0;
          
          let colorClass = '';
          if (isSelected) {
            colorClass = 'bg-slate-700/50 scale-105 ring-2 ring-amber-400';
          } else {
            const displayCount = Math.min(count, 7);
            colorClass = MEMORIZATION_COLORS[displayCount] || MEMORIZATION_COLORS[0];
          }
          
          const juzChanged = ayah.juz !== lastJuz;
          const pageChanged = ayah.page !== lastPage;

          lastJuz = ayah.juz;
          lastPage = ayah.page;

          const animationDelay = Math.min(index * 20, 600); // Faster stagger, max 0.6s delay

          return (
            <React.Fragment key={ayah.number}>
              {juzChanged && (
                <div className="text-center my-6 pt-4 animate-fadeInUp opacity-0" style={{animationDelay: `${animationDelay}ms`}}>
                   <h3 className="inline-block px-4 py-2 text-2xl font-bold text-amber-400 bg-slate-700/70 rounded-lg shadow">
                        الجزء {ayah.juz}
                   </h3>
                </div>
              )}
               {pageChanged && (
                <div className="text-center my-4 text-gray-400 font-semibold flex items-center justify-center animate-fadeInUp opacity-0" style={{animationDelay: `${animationDelay}ms`}}>
                    <hr className="w-1/4 border-gray-600"/>
                    <span className="mx-4">الصفحة {ayah.page}</span>
                    <hr className="w-1/4 border-gray-600"/>
                </div>
              )}
              <li
                ref={(el) => (ayahRefs.current[ayah.number] = el)}
                onClick={() => onAyahClick(ayah)}
                className={`p-6 rounded-lg shadow-md transition-all duration-300 cursor-pointer relative animate-fadeInUp opacity-0 ${colorClass}`}
                style={{animationDelay: `${animationDelay}ms`}}
                aria-selected={isSelected}
              >
                {count > 0 && (
                  <span className={`absolute top-2 right-2 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center transition-colors ${count > 7 ? 'bg-amber-600' : 'bg-teal-600'}`}>
                    {count}
                  </span>
                )}
                
                <p className={`text-right text-3xl leading-loose font-quran ${isSelected ? 'text-white' : 'text-gray-200'}`} dir="rtl">
                  {ayah.text} <span className="text-amber-400">({ayah.numberInSurah})</span>
                </p>

                {ayah.translationText && (
                    <p className={`text-left text-lg mt-4 text-gray-400`} dir="ltr">
                        {ayah.translationText}
                    </p>
                )}

                <div className="mt-6 pt-4 border-t border-slate-700 flex justify-start">
                  <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        onShowTafsir(ayah);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-amber-300 bg-slate-700/60 rounded-full hover:bg-slate-700 transition-all duration-200 active:scale-95"
                    aria-label={`تفسير الآية ${ayah.numberInSurah}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span>التفسير</span>
                  </button>
                </div>
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </div>
  );
};

export default React.memo(AyahDisplay);