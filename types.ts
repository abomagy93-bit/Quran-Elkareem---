export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
}

export interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  translationText?: string;
  audio: string;
  juz: number;
  page: number;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  ayahs: Ayah[];
}

export interface Reciter {
    identifier: string;
    name: string;
}

export interface Translation {
    identifier: string;
    language: string;
    translator: string;
}

export interface Tafsir {
  arabic: string | null;
  translation: {
    text: string | null;
    name: string | null;
    lang: string;
  } | null;
}

export interface Timings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

export interface PrayerTimesData {
    timings: Timings;
}

export interface Country {
  name: string;
  cities: string[];
}
