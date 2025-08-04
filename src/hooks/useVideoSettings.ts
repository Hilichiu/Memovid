import { useState, useEffect } from 'react';
import { VideoSettings } from '../types';

const DEFAULT_SETTINGS: VideoSettings = {
    photoDuration: 2.5,
    fadeInOut: true,
    fadePosition: 'throughout',
    audioFadeInOut: true,
    applyPhotoDurationToVideos: false,
    keepOriginalVideoAudio: true
};

export const useVideoSettings = () => {
    const [settings, setSettings] = useState<VideoSettings>(() => {
        try {
            const saved = localStorage.getItem('videoSettings');
            if (saved) {
                const parsedSettings = JSON.parse(saved) as VideoSettings;
                // Ensure all required properties exist with defaults for any missing ones
                const loadedSettings = {
                    ...DEFAULT_SETTINGS,
                    ...parsedSettings
                };
                console.log('Video settings loaded from localStorage:', loadedSettings);
                return loadedSettings;
            }
        } catch (error) {
            console.warn('Failed to load video settings from localStorage:', error);
        }
        console.log('Using default video settings:', DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    });

    useEffect(() => {
        try {
            localStorage.setItem('videoSettings', JSON.stringify(settings));
            console.log('Video settings saved to localStorage:', settings);
        } catch (error) {
            console.warn('Failed to save video settings to localStorage:', error);
        }
    }, [settings]);

    const updateSettings = (key: keyof VideoSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const resetSettings = () => {
        setSettings(DEFAULT_SETTINGS);
    };

    return {
        settings,
        setSettings,
        updateSettings,
        resetSettings
    };
};
