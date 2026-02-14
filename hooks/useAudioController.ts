
import { useState, useRef, useCallback, useEffect } from 'react';
import { Ayah } from '../types';

export const useAudioController = (onPlaybackEnd?: () => void) => {
    const [isAyahPlaying, setIsAyahPlaying] = useState(false);
    const [isRadioPlaying, setIsRadioPlaying] = useState(false);
    
    // Audio objects are kept in refs to persist across renders and prevent garbage collection issues
    const ayahAudioRef = useRef<HTMLAudioElement>(new Audio());
    const radioAudioRef = useRef<HTMLAudioElement>(new Audio());
    
    // Internal state to track if the radio SHOULD be playing, aiding recovery after network drops
    const shouldRadioBePlaying = useRef(false);

    // Helper to attempt radio playback with basic error catching
    const startRadio = useCallback(() => {
        const radio = radioAudioRef.current;
        if (radio.src && shouldRadioBePlaying.current) {
            radio.play().catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Radio playback recovery failed:", error);
                }
            });
        }
    }, []);

    // Effect for Ayah Audio Lifecycle
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

    // Effect for Radio Audio Lifecycle & Media Session
    useEffect(() => {
        const radioAudio = radioAudioRef.current;
        const ayahAudio = ayahAudioRef.current;
        
        const onRadioPaused = () => {
            // Only update state to false if we explicitly stopped it
            if (!shouldRadioBePlaying.current) {
                setIsRadioPlaying(false);
            }
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
        };

        const onRadioPlay = () => {
            setIsRadioPlaying(true);
            shouldRadioBePlaying.current = true;
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        };

        // Recovery triggers: When the stream stalls, waits for data, or errors out
        const recoverRadio = () => {
            if (shouldRadioBePlaying.current) {
                console.log("Radio stream interrupted. Attempting to resume...");
                startRadio();
            }
        };

        radioAudio.addEventListener('pause', onRadioPaused);
        radioAudio.addEventListener('play', onRadioPlay);
        radioAudio.addEventListener('stalled', recoverRadio);
        radioAudio.addEventListener('waiting', recoverRadio);
        radioAudio.addEventListener('error', recoverRadio);

        // Media Session setup for background persistence and lock-screen controls
        if ('mediaSession' in navigator) {
            navigator.mediaSession.setActionHandler('play', () => {
                if (shouldRadioBePlaying.current) {
                    ayahAudio.pause();
                    startRadio();
                }
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                radioAudio.pause();
                shouldRadioBePlaying.current = false;
                setIsRadioPlaying(false);
            });
            navigator.mediaSession.setActionHandler('stop', () => {
                radioAudio.pause();
                radioAudio.src = ""; // Clear source to stop buffering
                shouldRadioBePlaying.current = false;
                setIsRadioPlaying(false);
            });
        }

        return () => {
            radioAudio.removeEventListener('pause', onRadioPaused);
            radioAudio.removeEventListener('play', onRadioPlay);
            radioAudio.removeEventListener('stalled', recoverRadio);
            radioAudio.removeEventListener('waiting', recoverRadio);
            radioAudio.removeEventListener('error', recoverRadio);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('stop', null);
            }
        };
    }, [startRadio]);
    
    const playAyah = useCallback((ayah: Ayah) => {
        if (ayah.audio) {
            // Pause radio temporarily when an Ayah is played
            radioAudioRef.current.pause();

            const audioSrc = ayah.audio.replace('http:', 'https:');
            if (ayahAudioRef.current.src !== audioSrc) {
                ayahAudioRef.current.src = audioSrc;
            }
            ayahAudioRef.current.currentTime = 0;
            const playPromise = ayahAudioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
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
            shouldRadioBePlaying.current = false;
            radioAudio.pause();
            setIsRadioPlaying(false);
        } else {
            // Stop ayah if playing
            ayahAudioRef.current.pause();
            
            if (radioAudio.src !== streamUrl) {
                radioAudio.src = streamUrl;
                radioAudio.load(); // Force load to fresh buffer
            }

            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: 'إذاعة القرآن الكريم',
                    artist: 'المعين لحفظ القرآن الكريم',
                    album: 'بث مباشر',
                    artwork: [
                      { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml' }
                    ]
                });
            }
            
            shouldRadioBePlaying.current = true;
            startRadio();
        }
    }, [isRadioPlaying, startRadio]);

    return {
        isAyahPlaying,
        playAyah,
        isRadioPlaying,
        toggleRadio,
    };
};
