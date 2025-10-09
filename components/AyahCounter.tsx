import React from 'react';

interface AyahCounterProps {
    count: number;
    isAudioPlaying: boolean;
    isSelfReadingPhase: boolean;
    size?: 'small' | 'large';
}

const AyahCounter: React.FC<AyahCounterProps> = ({ count, isAudioPlaying, isSelfReadingPhase, size = 'small' }) => {
    if (count <= 0) {
        return null;
    }

    const sizeClasses = size === 'small' ? {
        wrapper: 'h-12 w-12 flex-shrink-0',
        text: 'text-xl',
        spinner: 'h-6 w-6',
    } : {
        wrapper: 'h-14 w-14',
        text: 'text-2xl',
        spinner: 'h-8 w-8',
    };

    return (
        <div className={`relative ${sizeClasses.wrapper}`}>
            <div className={`text-white ${sizeClasses.text} font-bold rounded-full h-full w-full flex items-center justify-center transition-colors shadow-lg ${isSelfReadingPhase ? 'bg-amber-600' : 'bg-teal-600'}`}>
                <span key={count} className="animate-pop">
                    {count}
                </span>
            </div>
            {isAudioPlaying && (
                 <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-full">
                     <svg className={`animate-spin ${sizeClasses.spinner} text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                 </div>
            )}
        </div>
    );
};

export default AyahCounter;