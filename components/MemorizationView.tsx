
import React from 'react';
import { Ayah } from '../types';
import { MEMORIZATION_COLORS, SELF_READING_COLORS } from '../constants';
import { useActionButtonState } from '../hooks/useActionButtonState';
import AyahCounter from './AyahCounter';

interface MemorizationViewProps {
  ayah: Ayah;
  count: number;
  onClose: () => void;
  onMemorizeClick: (ayah: Ayah) => void;
  isAudioPlaying: boolean;
  onActionButtonClick: () => void;
  onNext: () => void;
  isLastAyah: boolean;
  t: any;
}

const MemorizationView: React.FC<MemorizationViewProps> = ({ ayah, count, onClose, onMemorizeClick, isAudioPlaying, onActionButtonClick, onNext, isLastAyah, t }) => {
  const { actionButtonLabel, ariaLabel, actionButtonColor, isSelfReadingPhase } = useActionButtonState(count, t);

  let colorClass: string;
  if (count <= 7) {
    colorClass = MEMORIZATION_COLORS[count] || MEMORIZATION_COLORS[0];
  } else {
    const colorIndex = (count - 8) % SELF_READING_COLORS.length;
    colorClass = SELF_READING_COLORS[colorIndex];
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div 
        className={`relative w-full max-w-6xl h-[85vh] p-8 md:p-12 rounded-2xl shadow-2xl transition-colors duration-300 flex flex-col justify-between items-center ${colorClass} bg-slate-800 ${isAudioPlaying ? 'cursor-wait' : 'cursor-pointer'}`}
        onClick={() => onMemorizeClick(ayah)}
      >
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl font-bold hover:bg-red-600 transition-colors z-10 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t.close}
          disabled={isAudioPlaying}
        >
          &times;
        </button>

        <div className="absolute top-4 left-4 text-sm text-gray-300 font-semibold bg-white/10 px-4 py-2 rounded-full">
            <span>{t.juz} {ayah.juz}</span>
            <span className="mx-2">|</span>
            <span>{t.page} {ayah.page}</span>
        </div>

        <div className="flex-grow w-full flex flex-col items-center justify-center overflow-y-auto px-4">
            <p className="text-4xl md:text-5xl lg:text-7xl font-quran text-gray-100 text-center leading-[2.2] md:leading-[2.4] lg:leading-[2.5]" dir="rtl">
                {ayah.text} <span className="text-amber-400 px-3">({ayah.numberInSurah})</span>
            </p>
            {ayah.translationText && (
                <p className="text-xl md:text-2xl mt-8 text-gray-300 text-center max-w-4xl leading-relaxed" dir="ltr">
                    {ayah.translationText}
                </p>
            )}
        </div>

        <div className="w-full flex flex-col items-center gap-y-6 pt-6 border-t border-white/5">
            <div className="flex flex-col items-center space-y-2">
                <AyahCounter
                    count={count}
                    isAudioPlaying={isAudioPlaying}
                    isSelfReadingPhase={isSelfReadingPhase}
                    size="large"
                />
            </div>
            <div className="flex justify-center items-center gap-x-6">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onActionButtonClick();
                    }}
                    disabled={isAudioPlaying}
                    className={`px-8 py-3.5 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl active:scale-95 ${actionButtonColor}`}
                    aria-label={ariaLabel}
                >
                    {actionButtonLabel}
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onNext();
                    }}
                    disabled={isAudioPlaying || isLastAyah}
                    className="px-6 py-3.5 bg-slate-700 text-white font-bold rounded-xl shadow-lg hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                    aria-label={t.nextAyah}
                >
                    {t.nextAyah}
                </button>
            </div>
             {isSelfReadingPhase && (
                <p className="text-center text-sm text-gray-400 mt-2 max-w-lg">
                    {t.selfReadingNote}
                </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default MemorizationView;
