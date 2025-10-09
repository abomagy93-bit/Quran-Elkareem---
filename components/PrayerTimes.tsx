import React, { useState, useEffect } from 'react';
import { PrayerTimesData } from '../types';
import { countries } from '../data/locations';

interface PrayerTimesProps {
    isOpen: boolean;
    onClose: () => void;
    data: PrayerTimesData | null;
    isLoading: boolean;
    error: string | null;
    currentLocation: { city: string, country: string };
    onLocationChange: (location: { city: string, country: string }) => void;
}

const PRAYER_NAMES: { [key: string]: string } = {
    Fajr: 'Fajr',
    Sunrise: 'Sunrise',
    Dhuhr: 'Dhuhr',
    Asr: 'Asr',
    Maghrib: 'Maghrib',
    Isha: 'Isha',
};

const PrayerTimes: React.FC<PrayerTimesProps> = ({ isOpen, onClose, data, isLoading, error, currentLocation, onLocationChange }) => {
    const [showModal, setShowModal] = useState(false);
    const [cities, setCities] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            setShowModal(true);
        } else {
            const timer = setTimeout(() => setShowModal(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    useEffect(() => {
        const countryData = countries.find(c => c.name === currentLocation.country);
        setCities(countryData?.cities || []);
    }, [currentLocation.country]);


    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCountryName = e.target.value;
        const countryData = countries.find(c => c.name === newCountryName);
        const newCity = countryData?.cities[0] || '';
        onLocationChange({ country: newCountryName, city: newCity });
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onLocationChange({ ...currentLocation, city: e.target.value });
    };

    const prayerTimesList = data?.timings ? Object.entries(data.timings).filter(([key]) => PRAYER_NAMES[key]) : [];
    const todayDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (!showModal) return null;

    return (
        <div
            className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'bg-opacity-70' : 'bg-opacity-0'}`}
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="prayer-times-title"
        >
            <div
                className={`bg-slate-800 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-out ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <header className="p-6 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
                    <h2 id="prayer-times-title" className="text-2xl font-bold text-amber-400">
                        Prayer Times
                    </h2>
                    <button
                        onClick={onClose}
                        className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-red-600 transition-colors"
                        aria-label="إغلاق"
                    >
                        &times;
                    </button>
                </header>

                <div className="p-8 overflow-y-auto flex-grow">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <select
                            value={currentLocation.country}
                            onChange={handleCountryChange}
                            disabled={isLoading}
                            className="flex-1 p-3 text-md bg-slate-700 border border-slate-600 rounded-md focus:ring-amber-500 focus:border-amber-500 text-white disabled:opacity-50"
                            aria-label="Select Country for prayer times"
                        >
                            {countries.map(country => (
                                <option key={country.name} value={country.name}>{country.name}</option>
                            ))}
                        </select>
                         <select
                            value={currentLocation.city}
                            onChange={handleCityChange}
                            disabled={isLoading || cities.length === 0}
                            className="flex-1 p-3 text-md bg-slate-700 border border-slate-600 rounded-md focus:ring-amber-500 focus:border-amber-500 text-white disabled:opacity-50"
                            aria-label="Select City for prayer times"
                        >
                            {cities.map(city => (
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>

                    {isLoading && !error && (
                        <div className="flex justify-center items-center h-40">
                             <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                             </svg>
                        </div>
                    )}
                    {error && <p className="text-center text-red-400">{error}</p>}

                    {data && !isLoading && !error && (
                        <>
                            <div className="text-center mb-6">
                                <p className="text-lg text-gray-300">{todayDate}</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
                                {prayerTimesList.map(([key, time]) => (
                                    <div key={key} className="bg-slate-900/70 p-4 rounded-lg">
                                        <p className="font-semibold text-amber-300">{PRAYER_NAMES[key]}</p>
                                        <p className="text-2xl font-bold text-white mt-1" dir="ltr">{time}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrayerTimes;