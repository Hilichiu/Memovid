import { useState, useEffect } from 'react';
import { AudioFile } from '../types';

interface AudioFileMetadata {
    name: string;
    duration: number;
    size: number;
    type: string;
    lastModified: number;
}

export const useAudioFile = () => {
    const [audioFile, setAudioFile] = useState<AudioFile | null>(null);

    // Load audio metadata from localStorage on mount
    useEffect(() => {
        try {
            const savedMetadata = localStorage.getItem('audioFileMetadata');
            if (savedMetadata) {
                // We have metadata but no actual file - clear the metadata since files can't persist
                localStorage.removeItem('audioFileMetadata');
            }
        } catch (error) {
            console.warn('Failed to check audio file metadata from localStorage:', error);
        }
    }, []);

    // Save audio file metadata when it changes
    useEffect(() => {
        try {
            if (audioFile) {
                const metadata: AudioFileMetadata = {
                    name: audioFile.name,
                    duration: audioFile.duration,
                    size: audioFile.file.size,
                    type: audioFile.file.type,
                    lastModified: audioFile.file.lastModified
                };
                localStorage.setItem('audioFileMetadata', JSON.stringify(metadata));
            } else {
                localStorage.removeItem('audioFileMetadata');
            }
        } catch (error) {
            console.warn('Failed to save audio file metadata to localStorage:', error);
        }
    }, [audioFile]);

    const clearAudioFile = () => {
        setAudioFile(null);
    };

    return {
        audioFile,
        setAudioFile,
        clearAudioFile
    };
};
