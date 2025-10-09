import { useState, useEffect, useCallback } from 'react';
import { PrayerTimesData } from '../types';
import { fetchPrayerTimes } from '../services/prayerTimesService';

const LOCATION_CACHE_KEY = 'prayerLocation';

export interface Location {
    city: string;
    country: string;
}

const getDefaultLocation = (): Location => {
    try {
        const cachedLocation = localStorage.getItem(LOCATION_CACHE_KEY);
        if (cachedLocation) {
            return JSON.parse(cachedLocation);
        }
    } catch (error) {
        console.warn('Could not read location from local storage', error);
    }
    // Default location as requested
    return { city: 'Madinah', country: 'Saudi Arabia' };
};

export const usePrayerTimes = () => {
    const [location, setLocationState] = useState<Location>(getDefaultLocation);
    const [prayerTimes, setPrayerTimes] = useState<PrayerTimesData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPrayerTimes = useCallback(async (loc: Location) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchPrayerTimes(loc.city, loc.country);
            setPrayerTimes(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(`تعذر تحميل أوقات الصلاة لـ ${loc.city}. ${message}`);
            setPrayerTimes(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const setLocation = useCallback((newLocation: Location) => {
        setLocationState(newLocation);
        try {
            localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(newLocation));
        } catch (error) {
            console.warn('Could not save location to local storage', error);
        }
    }, []);


    useEffect(() => {
        loadPrayerTimes(location);
    }, [location, loadPrayerTimes]);

    return {
        location,
        setLocation,
        prayerTimes,
        isLoading,
        error,
    };
};
