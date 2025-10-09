import React from 'react';
import { Reciter } from '../types';

interface ReciterSelectorProps {
  reciters: Reciter[];
  selectedReciter: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
}

const ReciterSelector: React.FC<ReciterSelectorProps> = ({ reciters, selectedReciter, onChange, disabled }) => {
  return (
    <select
      value={selectedReciter}
      onChange={onChange}
      disabled={disabled}
      className="block w-full max-w-xs mx-auto p-3 text-lg border-2 border-amber-500 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 bg-slate-800 text-white disabled:opacity-50"
      aria-label="Select Reciter"
    >
      {reciters.map((reciter) => (
        <option key={reciter.identifier} value={reciter.identifier}>
          {reciter.name}
        </option>
      ))}
    </select>
  );
};

export default React.memo(ReciterSelector);
