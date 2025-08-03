import React from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { VideoSettings } from '../types';

interface VideoControlsProps {
  settings: VideoSettings;
  onSettingsChange: (settings: VideoSettings) => void;
  totalDuration: number;
}

const VideoControls: React.FC<VideoControlsProps> = ({ 
  settings, 
  onSettingsChange, 
  totalDuration 
}) => {
  const { t } = useTranslation();

  const updateSettings = (key: keyof VideoSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Photo Duration */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('photoDuration')}
          </label>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="10"
            step="0.5"
            value={settings.photoDuration}
            onChange={(e) => updateSettings('photoDuration', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1s</span>
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {t('perPhoto', { duration: settings.photoDuration.toString() })}
            </span>
            <span>10s</span>
          </div>
        </div>
        {totalDuration > 0 && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm text-blue-700 dark:text-blue-300">
            {t('totalVideoLength', { duration: formatDuration(totalDuration) })}
          </div>
        )}
      </div>

      {/* Fade Effects */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('fadeEffects')}
          </label>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.fadeInOut}
              onChange={(e) => updateSettings('fadeInOut', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('enableFadeEffects')}</span>
          </label>

          {settings.fadeInOut && (
            <div className="ml-7 space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fadePosition"
                  value="throughout"
                  checked={settings.fadePosition === 'throughout'}
                  onChange={(e) => updateSettings('fadePosition', e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('betweenEachPhoto')}</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="fadePosition"
                  value="beginning-end"
                  checked={settings.fadePosition === 'beginning-end'}
                  onChange={(e) => updateSettings('fadePosition', e.target.value)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('onlyAtBeginningEnd')}</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoControls;