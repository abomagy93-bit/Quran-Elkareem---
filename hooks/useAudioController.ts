import { useState, useRef, useCallback, useEffect } from 'react';
import { Ayah } from '../types';

export const useAudioController = (onPlaybackEnd?: () => void) => {
    const [isAyahPlaying, setIsAyahPlaying] = useState(false);
    const [isRadioPlaying, setIsRadioPlaying] = useState(false);
    
    const ayahAudioRef = useRef<HTMLAudioElement>(new Audio());
    const radioAudioRef = useRef<HTMLAudioElement>(new Audio());

    // Effect for Ayah Audio
    useEffect(() => {
        const ayahAudio = ayahAudioRef.current;
        
        const onAyahEnded = () => {
            setIsAyahPlaying(false);
            onPlaybackEnd?.();
        };
        const onAyahPaused = () => setIsAyahPlaying(false);
        const onAyahPlay = () => setIsAyahPlaying(true);

        ayahAudio.addEventListener('ended', onAyahEnded);
        ayahAudio.addEventListener('pause', onAyahPaused);
        ayahAudio.addEventListener('play', onAyahPlay);

        return () => {
            ayahAudio.removeEventListener('ended', onAyahEnded);
            ayahAudio.removeEventListener('pause', onAyahPaused);
            ayahAudio.removeEventListener('play', onAyahPlay);
        };
    }, [onPlaybackEnd]);

    // Effect for Radio Audio & Media Session
    useEffect(() => {
        const radioAudio = radioAudioRef.current;
        const ayahAudio = ayahAudioRef.current;
        
        const onRadioPaused = () => {
            setIsRadioPlaying(false);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
        };
        const onRadioPlay = () => {
            setIsRadioPlaying(true);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        };

        radioAudio.addEventListener('pause', onRadioPaused);
        radioAudio.addEventListener('play', onRadioPlay);

        // Media Session Action Handlers for background control
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                if (radioAudio.paused) {
                    ayahAudio.pause();
                    radioAudio.play().catch(e => console.error("Media session play failed", e));
                }
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                if (!radioAudio.paused) {
                    radioAudio.pause();
                }
            });
        }

        return () => {
            radioAudio.removeEventListener('pause', onRadioPaused);
            radioAudio.removeEventListener('play', onRadioPlay);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
            }
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

            // Set media session metadata for lock screen info
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'إذاعة القرآن الكريم',
                    artist: 'المعين لحفظ القرآن الكريم',
                    album: 'بث مباشر',
                    artwork: [
                      { src: '/vite.svg', sizes: 'any', type: 'image/svg+xml' }
                    ]
                });
            }
            
            const playPromise = radioAudio.play();
             if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'AbortError') {
                        console.error("Radio playback failed", error);
                        setIsRadioPlaying(false);
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