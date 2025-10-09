import { PrayerTimesData } from '../types';

interface ApiResponse {
    code: number;
    status: string;
    data: PrayerTimesData;
}

export const fetchPrayerTimes = async (city: string, country: string): Promise<PrayerTimesData | null> => {
    if (!city || !country) return null;

    try {
        // Using method 4: Umm Al-Qura University, Makkah.
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=4`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.data || 'Failed to fetch prayer times from API');
        }
        const data: ApiResponse = await response.json();
        if (data.code === 200) {
            return data.data;
        } else {
            throw new Error(data.status);
        }
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error('An unknown error occurred while fetching prayer times.');
    }
};
