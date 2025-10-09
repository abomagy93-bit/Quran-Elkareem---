import { Reciter, Translation } from './types';

interface AppConfig {
  apiBaseUrl: string;
  reciters: Reciter[];
  translations: Translation[];
  tafsirEditions: {
    [key: string]: {
      identifier: string;
      name: string;
    };
  };
}

export const config: AppConfig = {
  apiBaseUrl: 'https://api.alquran.cloud/v1',
  reciters: [],
  translations: [],
  tafsirEditions: {
    'en': { identifier: 'en.maududi', name: 'Tafheem-ul-Quran - Abul Ala Maududi' },
    'id': { identifier: 'id.jalalayn', name: 'Tafsir Al-Jalalayn' },
    'ru': { identifier: 'ru.sadi', name: 'Tafsir al-Sa\'di' },
    'tr': { identifier: 'tr.diyanet', name: 'Diyanet Isleri' },
    'ur': { identifier: 'ur.maududi', name: 'Tafheem-ul-Quran - Syed Abu-al-A\'la Maududi' },
    'bn': { identifier: 'bn.hoque', name: 'Tafsir Zohurul Hoque' },
  },
};

interface ApiEdition {
    identifier: string;
    language: string;
    name: string;
    englishName: string;
    format: 'audio' | 'text';
    type: 'quran' | 'translation' | 'tafsir' | 'versebyverse';
}

interface AllEditionsResponse {
    data: ApiEdition[];
}

export const initializeAppConfig = async () => {
    const defaultReciters: Reciter[] = [
        { identifier: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
        { identifier: 'ar.minshawi', name: 'Mohamed Siddiq el-Minshawi' },
        { identifier: 'ar.hudhaify', name: 'Ali Al-Hudhaify' },
        { identifier: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
        { identifier: 'ar.mahermuaiqly', name: 'Maher Al Muaiqly' }
    ];

    const defaultTranslations: Translation[] = [
        { identifier: 'en.sahih', language: 'English', translator: 'Sahih International' },
        { identifier: 'es.cortes', language: 'Spanish', translator: 'Julio Cortes' },
        { identifier: 'fr.hamidullah', language: 'French', translator: 'Muhammad Hamidullah' },
        { identifier: 'de.aburida', language: 'German', translator: 'Abu Rida'},
        { identifier: 'ru.kuliev', language: 'Russian', translator: 'Elmir Kuliev' },
        { identifier: 'id.indonesian', language: 'Indonesian', translator: 'Bahasa Indonesia' },
        { identifier: 'tr.yazir', language: 'Turkish', translator: 'Elmalılı Hamdi Yazır' },
        { identifier: 'ur.jalandhry', language: 'Urdu', translator: 'Fateh Muhammad Jalandhry'},
        { identifier: 'bn.bengali', language: 'Bengali', translator: 'Zohurul Hoque' },
        { identifier: 'da.rasmussen', language: 'Danish', translator: 'Ellen Rasmussen' },
        { identifier: 'el.greek', language: 'Greek', translator: 'Greek' },
        { identifier: 'he.goldman', language: 'Hebrew', translator: 'Uri Rubin' },
        { identifier: 'syr.peshitta', language: 'Syriac', translator: 'Peshitta' },
    ];

    try {
        const response = await fetch(`${config.apiBaseUrl}/edition/format/audio`);
        if (!response.ok) throw new Error('Failed to fetch reciters');
        
        const recitersResponse: AllEditionsResponse = await response.json();
        const filteredReciters = recitersResponse.data
            .filter(e => e.type === 'versebyverse' && e.language === 'ar')
            .map(r => ({ identifier: r.identifier, name: r.englishName }));

        if (filteredReciters.length > 0) {
            config.reciters = filteredReciters;
        } else {
            config.reciters = defaultReciters;
        }
    } catch (error) {
        console.error("Could not fetch reciters, using defaults.", error);
        config.reciters = defaultReciters;
    }

    try {
        const response = await fetch(`${config.apiBaseUrl}/edition/type/translation`);
        if (!response.ok) throw new Error('Failed to fetch translations');
        
        const translationsResponse: AllEditionsResponse = await response.json();

        if (translationsResponse.data.length > 0) {
            config.translations = translationsResponse.data.map(t => ({
                identifier: t.identifier,
                language: t.name, // Use edition name for language display
                translator: t.englishName
            }));
        } else {
            config.translations = defaultTranslations;
        }
    } catch (error) {
        console.error("Could not fetch translations, using defaults.", error);
        config.translations = defaultTranslations;
    }
    
    // Ensure there's always at least one option selected by default in App.tsx
    if (config.reciters.length === 0) {
        config.reciters.push({ identifier: 'ar.alafasy', name: 'Mishary Rashid Alafasy' });
    }
    if (config.translations.length === 0) {
        config.translations.push({ identifier: 'en.sahih', language: 'English', translator: 'Sahih International' });
    }
};