import React from 'react';

interface PlaybackRateSelectorProps {
  playbackRates: number[];
  selectedRate: number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
}

const PlaybackRateSelector: React.FC<PlaybackRateSelectorProps> = ({ playbackRates, selectedRate, onChange, disabled }) => {
  return (
    <select
      value={selectedRate}
      onChange={onChange}
      disabled={disabled}
      className="block w-full max-w-xs mx-auto p-3 text-lg border-2 border-teal-700 dark:border-teal-500 rounded-lg shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white dark:bg-slate-800 dark:text-white disabled:opacity-50 transition-colors"
      aria-label="Select Playback Rate"
    >
      {playbackRates.map((rate) => (
        <option key={rate} value={rate}>
          {rate}x
        </option>
      ))}
    </select>
  );
};

export default PlaybackRateSelector;
