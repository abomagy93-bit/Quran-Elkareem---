
import { useState, useCallback } from 'react';
import { Ayah, Tafsir } from '../types';
import { fetchTafsir } from '../services/quranService';

export const useTafsirModal = (t: any) => {
    const [tafsirAyah, setTafsirAyah] = useState<Ayah | null>(null);
    const [tafsirContent, setTafsirContent] = useState<Tafsir | null>(null);
    const [isTafsirLoading, setIsTafsirLoading] = useState(false);
    
    const isOpen = !!tafsirAyah;

    const showTafsir = useCallback(async (ayah: Ayah, translationId: string) => {
        setTafsirAyah(ayah);
        setIsTafsirLoading(true);
        setTafsirContent(null);

        try {
            const data = await fetchTafsir(ayah.number, translationId);
            setTafsirContent(data);
        } catch (error) {
            console.error("Failed to fetch Tafsir:", error);
            setTafsirContent({
                arabic: t?.tafsirErrorDetails || "عذراً، لم نتمكن من تحميل التفسير. يرجى المحاولة مرة أخرى.",
                translation: {
                    text: t?.tafsirErrorDetails || "Sorry, could not load the Tafsir. Please try again.",
                    name: "Error",
                    lang: 'en'
                }
            });
        } finally {
            setIsTafsirLoading(false);
        }
    }, [t]);

    const closeTafsir = useCallback(() => {
        setTafsirAyah(null);
    }, []);

    return {
        isOpen,
        tafsirAyah,
        tafsirContent,
        isTafsirLoading,
        showTafsir,
        closeTafsir,
    };
};
