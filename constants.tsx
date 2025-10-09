import { Reciter, Translation } from './types';

export const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const MEMORIZATION_COLORS = [
  'bg-transparent hover:bg-slate-700/50', // 0: Not started
  // Listening Stage (Green) - 7 steps
  'bg-green-900/20', // 1
  'bg-green-900/30', // 2
  'bg-green-900/40', // 3
  'bg-green-900/50', // 4
  'bg-green-900/60', // 5
  'bg-green-900/70', // 6
  'bg-green-900/80', // 7
];

// Self-Reading Stage (Amber) - Cycling
export const SELF_READING_COLORS = [
  'bg-amber-900/20',
  'bg-amber-900/30',
  'bg-amber-900/40',
  'bg-amber-900/50',
  'bg-amber-900/60',
];

export const API_BASE_URL = 'https://api.alquran.cloud/v1';

export const RADIO_STREAM_URL = 'https://n0e.radiojar.com/8s5u5tpdtwzuv';

export const RECITERS: Reciter[] = [
    { identifier: 'ar.husary', name: 'محمود خليل الحصري' },
    { identifier: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
    { identifier: 'ar.hudhaify', name: 'علي بن عبد الرحمن الحذيفي' },
    { identifier: 'ar.alafasy', name: 'مشاري راشد العفاسي' },
    { identifier: 'ar.mahermuaiqly', name: 'ماهر المعيقلي' },
];

export const TRANSLATIONS: Translation[] = [
    { identifier: 'en.sahih', language: 'English', translator: 'Sahih International' },
    { identifier: 'es.cortes', language: 'Spanish', translator: 'Julio Cortes' },
    { identifier: 'fr.hamidullah', language: 'French', translator: 'Muhammad Hamidullah' },
    { identifier: 'de.aburida', language: 'German', translator: 'Abu Rida'},
    { identifier: 'ru.kuliev', language: 'Russian', translator: 'Elmir Kuliev' },
    { identifier: 'id.indonesian', language: 'Indonesian', translator: 'Bahasa Indonesia' },
    { identifier: 'it.piccardo', language: 'Italian', translator: 'Hamza Piccardo' },
    { identifier: 'tr.yazir', language: 'Turkish', translator: 'Elmalılı Hamdi Yazır' },
    { identifier: 'pt.elhayek', language: 'Portuguese', translator: 'Samir El-Hayek' },
    { identifier: 'nl.keyzer', language: 'Dutch', translator: 'Salomo Keyzer' },
    { identifier: 'sv.bernstrom', language: 'Swedish', translator: 'Knut Bernström' },
    { identifier: 'da.rasmussen', language: 'Danish', translator: 'Ellen Rasmussen' },
    { identifier: 'pl.bielawski', language: 'Polish', translator: 'Józefa Bielawskiego' },
    { identifier: 'el.greek', language: 'Greek', translator: 'Greek' },
    { identifier: 'he.goldman', language: 'Hebrew', translator: 'Uri Rubin' },
    { identifier: 'syr.peshitta', language: 'Syriac', translator: 'Peshitta' },
    { identifier: 'ro.grigore', language: 'Romanian', translator: 'George Grigore' },
    { identifier: 'sq.nahi', language: 'Albanian', translator: 'Hasan Efendi Nahi' },
    { identifier: 'bs.korkut', language: 'Bosnian', translator: 'Besim Korkut' },
    { identifier: 'zh.jian', language: 'Chinese', translator: 'Ma Jian' },
    { identifier: 'ja.japanese', language: 'Japanese', translator: 'Saheeh Japan' },
    { identifier: 'ko.korean', language: 'Korean', translator: 'Korean' },
    { identifier: 'fa.ayati', language: 'Persian', translator: 'AbdolMohammad Ayati' },
    { identifier: 'ur.jalandhry', language: 'Urdu', translator: 'Fateh Muhammad Jalandhry'},
    { identifier: 'bn.bengali', language: 'Bengali', translator: 'Zohurul Hoque' },
    { identifier: 'hi.farooq', language: 'Hindi', translator: 'Muhammad Farooq Khan' },
    { identifier: 'ml.abdulhameed', language: 'Malayalam', translator: 'Cheriyamundam Abdul Hameed' },
    { identifier: 'ta.tamil', language: 'Tamil', translator: 'Jan Turst Foundation' },
    { identifier: 'th.thai', language: 'Thai', translator: 'King Fahad Quran Complex' },
    { identifier: 'uz.sodik', language: 'Uzbek', translator: 'Muhammad Sodik' },
    { identifier: 'az.mammadaliyev', language: 'Azerbaijani', translator: 'Mammadaliyev & Bunyadov' },
    { identifier: 'so.abduh', language: 'Somali', translator: 'Mahmud Muhammad Abduh' },
];


export const TAFSIR_EDITIONS: { [key: string]: { identifier: string; name: string; } } = {
    'en': { identifier: 'en.maududi', name: 'Tafheem-ul-Quran - Abul Ala Maududi' },
    'id': { identifier: 'id.jalalayn', name: 'Tafsir Al-Jalalayn' },
    'ru': { identifier: 'ru.sadi', name: 'Tafsir al-Sa\'di' },
    'tr': { identifier: 'tr.diyanet', name: 'Diyanet Isleri' },
    'ur': { identifier: 'ur.maududi', name: 'Tafheem-ul-Quran - Syed Abu-al-A\'la Maududi' },
    'bn': { identifier: 'bn.hoque', name: 'Tafsir Zohurul Hoque' },
};