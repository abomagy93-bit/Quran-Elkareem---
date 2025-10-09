import React from 'react';
import { Translation } from '../types';

interface TranslationSelectorProps {
  translations: Translation[];
  selectedTranslation: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled: boolean;
}

const TranslationSelector: React.FC<TranslationSelectorProps> = ({ translations, selectedTranslation, onChange, disabled }) => {
  return (
    <select
      value={selectedTranslation}
      onChange={onChange}
      disabled={disabled}
      className="block w-full max-w-xs mx-auto p-3 text-lg border-2 border-amber-500 rounded-lg shadow-sm focus:ring-amber-500 focus:border-amber-500 bg-slate-800 text-white disabled:opacity-50"
      aria-label="Select Translation"
    >
      {translations.map((translation) => (
        <option key={translation.identifier} value={translation.identifier}>
          {translation.language} ({translation.translator})
        </option>
      ))}
    </select>
  );
};

export default React.memo(TranslationSelector);
