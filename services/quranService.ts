import { SurahInfo, SurahData, Ayah, Tafsir } from '../types';
import { API_BASE_URL, TAFSIR_EDITIONS } from '../constants';

const SURAH_LIST_CACHE_KEY = 'allSurahs';

// Internal types for API response parsing
interface ApiAyah {
    number: number;
    numberInSurah: number;
    text: string;
    audio: string;
    juz: number;
    page: number;
}
interface ApiSurahData {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  ayahs: ApiAyah[];
  edition: {
    identifier: string;
    [key: string]: any;
  };
}

interface AllSurahsResponse {
    data: SurahInfo[];
}

interface SurahDetailMultipleEditionsResponse {
    data: ApiSurahData[];
}

export const fetchAllSurahs = async (): Promise<SurahInfo[]> => {
    try {
        const cachedSurahs = sessionStorage.getItem(SURAH_LIST_CACHE_KEY);
        if (cachedSurahs) {
            return JSON.parse(cachedSurahs);
        }
    } catch (error) {
        console.warn("Could not read surah list from session storage", error);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/surah`);
        if (!response.ok) {
            throw new Error('Failed to fetch surahs');
        }
        const data: AllSurahsResponse = await response.json();
        
        try {
            sessionStorage.setItem(SURAH_LIST_CACHE_KEY, JSON.stringify(data.data));
        } catch (error) {
            console.warn("Could not save surah list to session storage", error);
        }

        return data.data;
    } catch (error) {
        console.error("Error fetching all surahs:", error);
        throw error;
    }
};

export const fetchSurah = async (surahNumber: number, reciterId: string, translationId: string): Promise<SurahData> => {
    try {
        const editions = `${reciterId},${translationId}`;
        const response = await fetch(`${API_BASE_URL}/surah/${surahNumber}/editions/${editions}`);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText} (${response.status})`);
        }
        const data: SurahDetailMultipleEditionsResponse = await response.json();
        
        const reciterData = data.data.find(d => d.edition.identifier === reciterId);
        const translationData = data.data.find(d => d.edition.identifier === translationId);

        if (!reciterData) {
            throw new Error(`بيانات القارئ (${reciterId}) غير متوفرة لهذه السورة.`);
        }
        if (!translationData) {
             console.warn(`Translation data not found for edition: ${translationId}`);
        }
        
        const mergedAyahs: Ayah[] = reciterData.ayahs.map((ayah, index) => ({
            ...ayah,
            translationText: translationData?.ayahs[index]?.text || 'Translation not available.',
        }));

        return {
            number: reciterData.number,
            name: reciterData.name,
            englishName: reciterData.englishName,
            revelationType: reciterData.revelationType,
            ayahs: mergedAyahs,
        };

    } catch (error) {
        console.error(`Error fetching surah ${surahNumber}:`, error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unknown error occurred while fetching surah data.');
    }
};

const fetchEditionText = async (ayahNumber: number, edition: string): Promise<string | null> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ayah/${ayahNumber}/${edition}`);
        if (!response.ok) {
            console.warn(`API request for edition ${edition} failed with status ${response.status}`);
            return null;
        }
        const responseData = await response.json();
        const text = responseData?.data?.text;
        if (typeof text === 'string' && text.trim() !== '') {
            return text;
        }
        console.warn(`Text not found or is empty for edition ${edition}.`);
        return null;
    } catch (error) {
        console.error(`Error fetching tafsir for ayah ${ayahNumber}, edition ${edition}:`, error);
        return null;
    }
};


export const fetchTafsir = async (ayahNumber: number, translationId: string): Promise<Tafsir> => {
    const arabicEdition = 'ar.muyassar';
    const langCode = translationId.split('.')[0];
    
    const translationTafsirInfo = TAFSIR_EDITIONS[langCode];

    const [arabicTafsir, translatedTafsirText] = await Promise.all([
        fetchEditionText(ayahNumber, arabicEdition),
        translationTafsirInfo ? fetchEditionText(ayahNumber, translationTafsirInfo.identifier) : Promise.resolve(null)
    ]);
    
    if (!arabicTafsir && !translatedTafsirText) {
        throw new Error('Failed to fetch any tafsir data.');
    }

    return {
        arabic: arabicTafsir,
        translation: translationTafsirInfo ? {
            text: translatedTafsirText,
            name: translationTafsirInfo.name,
            lang: langCode,
        } : null
    };
};
