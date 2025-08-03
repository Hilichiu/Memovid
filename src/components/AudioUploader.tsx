import React, { useRef } from 'react';
import { Upload, Music, X, Volume2, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { AudioFile, VideoSettings } from '../types';

interface AudioUploaderProps {
  audioFile: AudioFile | null;
  onAudioChange: (audio: AudioFile | null) => void;
  settings: VideoSettings;
  onSettingsChange: (settings: VideoSettings) => void;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
  audioFile,
  onAudioChange,
  settings,
  onSettingsChange
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const updateSettings = (key: keyof VideoSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      alert(t('pleaseSelectAudio'));
      return;
    }

    const url = URL.createObjectURL(file);

    // Get audio duration
    const audio = new Audio();
    audio.src = url;

    audio.addEventListener('loadedmetadata', () => {
      const newAudio: AudioFile = {
        file,
        url,
        name: file.name,
        duration: audio.duration
      };
      onAudioChange(newAudio);
    });

    // Reset the input value to ensure the same file can be selected again
    event.target.value = '';
  };

  const removeAudio = () => {
    if (audioFile) {
      URL.revokeObjectURL(audioFile.url);
    }
    onAudioChange(null);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {!audioFile ? (
        <button
          onClick={openFileDialog}
          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg p-6 transition-colors duration-200 group"
        >
          <div className="text-center">
            <Music className="w-10 h-10 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mx-auto mb-3 transition-colors duration-200" />
            <div className="text-base font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
              {t('uploadMusic')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t('uploadMusicOptional')}
            </div>
          </div>
        </button>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <Volume2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {audioFile.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('duration', { duration: formatDuration(audioFile.duration) })}
              </div>
            </div>
            <button
              onClick={removeAudio}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <audio
            ref={audioRef}
            src={audioFile.url}
            controls
            className="w-full h-8"
            style={{ height: '32px' }}
          />

          <button
            onClick={openFileDialog}
            className="mt-3 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
          >
            {t('chooseDifferentFile')}
          </button>

          {/* Audio Fade Effects */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('audioFadeEffects')}
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.audioFadeInOut}
                  onChange={(e) => updateSettings('audioFadeInOut', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t('enableAudioFadeEffects')}</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioUploader;