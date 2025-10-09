import React from 'react';
import { Ayah } from '../types';
import AyahCounter from './AyahCounter';

interface PlayerControlsProps {
  ayah: Ayah | null;
  count: number;
  isAudioPlaying: boolean;
  onActionButtonClick: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isLastAyah: boolean;
  isFirstAyah: boolean;
  isVisible: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  ayah,
  count,
  isAudioPlaying,
  onActionButtonClick,
  onNext,
  onPrevious,
  isLastAyah,
  isFirstAyah,
  isVisible,
}) => {
  const { actionButtonLabel, ariaLabel, actionButtonColor, isSelfReadingPhase } = React.useMemo(() => {
    const isSelfReadingPhase = count >= 7;

    let actionButtonLabel = 'ابدأ';
    let ariaLabel = 'ابدأ الحفظ';
    let actionButtonColor = 'bg-teal-600 hover:bg-teal-700';

    if (isSelfReadingPhase) {
      actionButtonLabel = 'إعادة الاستماع';
      ariaLabel = 'إعادة الاستماع للآية';
      actionButtonColor = 'bg-sky-600 hover:bg-sky-700';
    } else if (count > 0) {
      actionButtonLabel = 'مرة كمان';
      ariaLabel = 'الاستماع مرة أخرى';
    }

    return { actionButtonLabel, ariaLabel, actionButtonColor, isSelfReadingPhase };
  }, [count]);


  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm border-t border-slate-700 z-20 shadow-lg transition-transform duration-500 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="container mx-auto flex items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {ayah && <AyahCounter
            count={count}
            isAudioPlaying={isAudioPlaying}
            isSelfReadingPhase={isSelfReadingPhase}
            size="small"
          />}
          <p className="text-gray-300 text-lg truncate hidden sm:block" dir="rtl">
            {ayah?.text}
          </p>
        </div>

        <div className="flex justify-center items-center gap-x-3 md:gap-x-4">
          <button
            onClick={onPrevious}
            disabled={isAudioPlaying || isFirstAyah}
            className="p-3 bg-gray-600 text-white font-semibold rounded-full shadow-md hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            aria-label="الانتقال للآية السابقة"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={onActionButtonClick}
            disabled={isAudioPlaying}
            className={`px-6 py-3 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-md active:scale-95 ${actionButtonColor}`}
            aria-label={ariaLabel}
          >
            {actionButtonLabel}
          </button>
          <button
            onClick={onNext}
            disabled={isAudioPlaying || isLastAyah}
            className="p-3 bg-gray-600 text-white font-semibold rounded-full shadow-md hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            aria-label="الانتقال للآية التالية"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlayerControls);
