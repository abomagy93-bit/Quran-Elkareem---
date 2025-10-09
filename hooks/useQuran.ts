import { useState, useCallback, useEffect } from 'react';
import { SurahInfo, SurahData } from '../types';
import { fetchAllSurahs, fetchSurah } from '../services/quranService';

export const useQuran = () => {
    const [surahs, setSurahs] = useState<SurahInfo[]>([]);
    const [surahData, setSurahData] = useState<SurahData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const allSurahs = await fetchAllSurahs();
                setSurahs(allSurahs);
            } catch (err) {
                setError('فشلت قائمة السور في التحميل. يرجى التحقق من اتصالك بالإنترنت.');
                console.error(err);
            }
        };
        loadInitialData();
    }, []);

    const loadSurahData = useCallback(async (surahNum: number, reciterId: string, translationId: string) => {
        if (!reciterId || !translationId) return;
        try {
            setIsLoading(true);
            setError(null);
            setSurahData(null);
            const data = await fetchSurah(surahNum, reciterId, translationId);
            setSurahData(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(`فشل تحميل السورة. ${message}`);
            console.error("Failed to load surah data", err);
            setSurahData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { surahs, surahData, isLoading, error, loadSurahData };
};
