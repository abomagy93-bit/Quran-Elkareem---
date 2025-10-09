import { useState, useRef, useCallback, useEffect } from 'react';
import { Ayah } from '../types';

export const useAudioController = () => {
    const [isAyahPlaying, setIsAyahPlaying] = useState(false);
    const [isRadioPlaying, setIsRadioPlaying] = useState(false);
    
    const ayahAudioRef = useRef<HTMLAudioElement>(new Audio());
    const radioAudioRef = useRef<HTMLAudioElement>(new Audio());

    useEffect(() => {
        const ayahAudio = ayahAudioRef.current;
        const onAyahEnded = () => setIsAyahPlaying(false);
        const onAyahPlay = () => setIsAyahPlaying(true);

        ayahAudio.addEventListener('ended', onAyahEnded);
        ayahAudio.addEventListener('pause', onAyahEnded);
        ayahAudio.addEventListener('play', onAyahPlay);
        
        const radioAudio = radioAudioRef.current;
        const onRadioEnded = () => setIsRadioPlaying(false);
        const onRadioPlay = () => setIsRadioPlaying(true);

        radioAudio.addEventListener('ended', onRadioEnded);
        radioAudio.addEventListener('pause', onRadioEnded);
        radioAudio.addEventListener('play', onRadioPlay);

        return () => {
            ayahAudio.removeEventListener('ended', onAyahEnded);
            ayahAudio.removeEventListener('pause', onAyahEnded);
            ayahAudio.removeEventListener('play', onAyahPlay);
            radioAudio.removeEventListener('ended', onRadioEnded);
            radioAudio.removeEventListener('pause', onRadioEnded);
            radioAudio.removeEventListener('play', onRadioPlay);
        };
    }, []);
    
    const playAyah = useCallback((ayah: Ayah) => {
        if (ayah.audio) {
            radioAudioRef.current.pause();

            const audioSrc = ayah.audio.replace('http:', 'https:');
            if (ayahAudioRef.current.src !== audioSrc) {
                ayahAudioRef.current.src = audioSrc;
            }
            ayahAudioRef.current.currentTime = 0;
            const playPromise = ayahAudioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Ignore AbortError which occurs when playback is interrupted by another play request.
                    if (error.name !== 'AbortError') {
                        console.error("Ayah playback failed", error);
                    }
                });
            }
        }
    }, []);

    const toggleRadio = useCallback((streamUrl: string) => {
        const radioAudio = radioAudioRef.current;
        if (isRadioPlaying) {
            radioAudio.pause();
        } else {
            ayahAudioRef.current.pause();
            
            if (radioAudio.src !== streamUrl) {
                radioAudio.src = streamUrl;
            }
            const playPromise = radioAudio.play();
             if (playPromise !== undefined) {
                playPromise.catch(error => {
                    // Ignore AbortError which occurs when playback is interrupted by another play request.
                    if (error.name !== 'AbortError') {
                        console.error("Radio playback failed", error);
                        setIsRadioPlaying(false); // Ensure state is correct on other errors
                    }
                });
            }
        }
    }, [isRadioPlaying]);

    return {
        isAyahPlaying,
        playAyah,
        isRadioPlaying,
        toggleRadio,
    };
};
