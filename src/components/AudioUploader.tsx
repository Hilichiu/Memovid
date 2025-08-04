import React, { useRef } from 'react';
import { Music, X, Volume2, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { AudioFile, VideoSettings, Photo } from '../types';

interface AudioUploaderProps {
  audioFile: AudioFile | null;
  onAudioChange: (audio: AudioFile | null) => void;
  settings: VideoSettings;
  onSettingsChange: (settings: VideoSettings) => void;
  updateSettings?: (key: keyof VideoSettings, value: any) => void;
  photos: Photo[];
}

const AudioUploader: React.FC<AudioUploaderProps> = ({
  audioFile,
  onAudioChange,
  settings,
  onSettingsChange,
  updateSettings: externalUpdateSettings,
  photos
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Check if there are any videos in the photos array
  const hasVideos = photos.some(photo => photo.type === 'video');

  const updateSettings = (key: keyof VideoSettings, value: any) => {
    if (externalUpdateSettings) {
      // Use the hook's updateSettings function if provided
      externalUpdateSettings(key, value);
    } else {
      // Fallback to the original pattern for backwards compatibility
      onSettingsChange({
        ...settings,
        [key]: value
      });
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Accept both audio and video files (iOS may present video files in audio input)
    const isAudioFile = file.type.startsWith('audio/');
    const isVideoFile = file.type.startsWith('video/');
    const hasAudioExtension = /\.(mp3|wav|aac|ogg|m4a|flac)$/i.test(file.name);
    const hasVideoExtension = /\.(mp4|mov|avi|mkv|webm|3gp)$/i.test(file.name);

    if (!isAudioFile && !isVideoFile && !hasAudioExtension && !hasVideoExtension) {
      alert(t('pleaseSelectAudio'));
      return;
    }

    const url = URL.createObjectURL(file);

    try {
      let duration = 0;

      if (isVideoFile || hasVideoExtension) {
        // Handle video files (extract audio duration)
        const video = document.createElement('video');
        video.src = url;

        await new Promise<void>((resolve, reject) => {
          video.addEventListener('loadedmetadata', () => {
            duration = video.duration;
            resolve();
          });
          video.addEventListener('error', () => {
            reject(new Error('Could not load video file'));
          });
          // Fallback timeout
          setTimeout(() => reject(new Error('Timeout loading video')), 10000);
        });
      } else {
        // Handle audio files
        const audio = new Audio();
        audio.src = url;

        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('loadedmetadata', () => {
            duration = audio.duration;
            resolve();
          });
          audio.addEventListener('error', () => {
            reject(new Error('Could not load audio file'));
          });
          // Fallback timeout
          setTimeout(() => reject(new Error('Timeout loading audio')), 10000);
        });
      }

      const newAudio: AudioFile = {
        file,
        url,
        name: file.name,
        duration: duration || 30 // Fallback duration if unable to detect
      };
      onAudioChange(newAudio);

    } catch (error) {
      console.error('Error loading audio/video file:', error);
      // Still create the audio file with fallback duration
      const newAudio: AudioFile = {
        file,
        url,
        name: file.name,
        duration: 30 // Fallback duration
      };
      onAudioChange(newAudio);
    }

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
    <div className="space-y-4 w-full min-w-0">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,video/*,.mp3,.wav,.aac,.ogg,.m4a,.flac,.mp4,.mov,.avi,.mkv,.webm,.3gp"
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
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 w-full min-w-0">
          <div className="flex items-start gap-3 mb-3 w-full min-w-0">
            <Volume2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 w-0">
              <div
                className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate w-full"
                title={audioFile.name}
              >
                {audioFile.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {t('duration', { duration: formatDuration(audioFile.duration) })}
              </div>
            </div>
            <button
              onClick={removeAudio}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors duration-200 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <audio
            ref={audioRef}
            src={audioFile.url}
            controls
            className="w-full h-8 max-w-full"
            style={{ height: '32px', minWidth: 0 }}
          />

          <button
            onClick={openFileDialog}
            className="mt-3 w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 px-2 py-1 text-center"
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

          {/* Video Audio Management */}
          {hasVideos && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-3">
                <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('videoAudioSettings')}
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.keepOriginalVideoAudio}
                    onChange={(e) => updateSettings('keepOriginalVideoAudio', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t('keepOriginalVideoSound')}</span>
                </label>
                <div className="text-xs text-gray-500 dark:text-gray-400 ml-7">
                  {t('keepOriginalVideoSoundHelp')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AudioUploader;