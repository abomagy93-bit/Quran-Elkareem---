import React from 'react';
import { SurahInfo } from '../types';

interface SurahSelectorProps {
  surahs: SurahInfo[];
  selectedSurah: number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
}

const SurahSelector: React.FC<SurahSelectorProps> = ({ surahs, selectedSurah, onChange, disabled }) => {
  return (
    <select
      value={selectedSurah}
      onChange={onChange}
      disabled={disabled}
      className="block w-full max-w-xs mx-auto p-3 text-lg border-2 border-amber-500 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 bg-slate-800 text-white disabled:opacity-50"
    >
      {surahs.map((surah) => (
        <option key={surah.number} value={surah.number}>
          {surah.number}. {surah.name} ({surah.englishName})
        </option>
      ))}
    </select>
  );
};

export default React.memo(SurahSelector);
