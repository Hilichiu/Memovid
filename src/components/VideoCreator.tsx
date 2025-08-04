import React, { useState, useRef, useEffect } from 'react';
import { Music, Image, Download, Play, Settings, X } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import AudioUploader from './AudioUploader';
import PhotoReorder from './PhotoReorder';
import VideoControls from './VideoControls';
import VideoProcessor from './VideoProcessor';
import { useTranslation } from '../hooks/useTranslation';
import { Photo, AudioFile, VideoSettings } from '../types';
import { debugVideoCreation } from '../utils/videoDebug';
import { cleanupPhotoUrls } from '../utils/imageOptimization';

// Generate filename based on current date and time
const generateVideoFilename = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  return `memovid-${year}-${month}-${day}-${hours}${minutes}${seconds}.mp4`;
};

const VideoCreator: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [settings, setSettings] = useState<VideoSettings>({
    photoDuration: 3,
    fadeInOut: true,
    fadePosition: 'throughout',
    audioFadeInOut: true,
    applyPhotoDurationToVideos: false,
    keepOriginalVideoAudio: true
  });

  const videoProcessorRef = useRef<VideoProcessor | null>(null);

  // Reset download state when photos, audio, or settings change after a video has been generated
  useEffect(() => {
    if (downloadUrl) {
      setDownloadUrl(null);
      setProgress(0); // Reset progress when resetting download state
    }
  }, [photos, audioFile, settings]); // eslint-disable-line react-hooks/exhaustive-deps

  // Enhanced download function with iOS Photos app guidance
  const handleDownload = async () => {
    if (!downloadUrl) return;

    if (isIOS) {
      // Show instructions modal for iOS users
      setShowIOSInstructions(true);
      return;
    }

    // Traditional download for non-iOS
    const filename = generateVideoFilename();
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Function to proceed with iOS download after showing instructions
  const proceedWithIOSDownload = async () => {
    if (!downloadUrl) return;

    try {
      // Strategy 1: Try using Web Share API first (most reliable for iOS)
      if (navigator.share && 'canShare' in navigator) {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const filename = generateVideoFilename();
        const file = new File([blob], filename, { type: 'video/mp4' });

        // Check if sharing files is supported
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Video',
            text: 'Video created with Memovid'
          });
          setShowIOSInstructions(false);
          return;
        }
      }

      // Strategy 2: Create a direct download link that iOS can handle
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const tempUrl = URL.createObjectURL(blob);

      // Create a temporary link element with download attribute
      const filename = generateVideoFilename();
      const link = document.createElement('a');
      link.href = tempUrl;
      link.download = filename;
      link.style.display = 'none';

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the temporary URL
      setTimeout(() => URL.revokeObjectURL(tempUrl), 1000);

    } catch (error) {
      console.log('iOS download strategies failed, trying fallback:', error);
      // Fallback: Open in new window (original approach)
      window.open(downloadUrl, '_blank');
    }

    setShowIOSInstructions(false);
  };

  // Better iOS detection using the same strategy as PhotoReorder
  useEffect(() => {
    const checkIOS = () => {
      const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
        ('ontouchstart' in window && navigator.maxTouchPoints > 0);
      setIsIOS(isIOSDevice);
    };
    checkIOS();
  }, []);

  // Cleanup photo URLs when component unmounts or photos change
  useEffect(() => {
    return () => {
      // Cleanup all photo URLs on unmount
      if (photos.length > 0) {
        cleanupPhotoUrls(photos);
      }
    };
  }, [photos]);

  const handleCreateVideo = async () => {
    if (photos.length === 0) {
      alert(t('pleaseSelectPhotos'));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setDownloadUrl(null);

    try {
      if (!videoProcessorRef.current) {
        videoProcessorRef.current = new VideoProcessor();
      }

      console.log('Starting video creation with:', {
        photoCount: photos.length,
        hasAudio: !!audioFile,
        settings
      });

      const videoBlob = await videoProcessorRef.current.createVideo({
        photos,
        audio: audioFile,
        settings,
        onProgress: setProgress
      });

      console.log('Video blob created:', {
        size: videoBlob.size,
        type: videoBlob.type
      });

      // Debug the blob
      debugVideoCreation.logBlobInfo(videoBlob, 'Generated video blob');

      if (videoBlob.size === 0) {
        throw new Error('Generated video is empty (0 bytes)');
      }

      const url = URL.createObjectURL(videoBlob);
      setDownloadUrl(url);

      console.log('Download URL created:', url);
    } catch (error) {
      console.error('Error creating video:', error);
      alert(t('errorCreatingVideo') + '\n\nDetails: ' + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate total duration considering both photos and videos
  const totalDuration = photos.reduce((total, media) => {
    if (media.type === 'video' && media.duration && !settings.applyPhotoDurationToVideos) {
      // Use full video duration when not applying photo duration
      return total + media.duration;
    } else if (media.type === 'video' && media.duration && settings.applyPhotoDurationToVideos) {
      // When applying photo duration to videos, use the minimum of video duration and photo duration
      // This ensures short videos don't get counted as longer than they actually are
      return total + Math.min(media.duration, settings.photoDuration);
    } else {
      // For photos, always use photo duration
      return total + settings.photoDuration;
    }
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Photo Upload */}
        <div className="space-y-6">
          {/* Photo Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Image className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('photos')}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('photosDescription')}</p>
            </div>
            <div className="p-6">
              <PhotoUploader photos={photos} onPhotosChange={setPhotos} />
            </div>
          </div>
        </div>

        {/* Audio Upload */}
        <div className="space-y-6">
          {/* Audio Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Music className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('backgroundMusic')}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('backgroundMusicDescription')}</p>
            </div>
            <div className="p-6">
              <AudioUploader
                audioFile={audioFile}
                onAudioChange={setAudioFile}
                settings={settings}
                onSettingsChange={setSettings}
                photos={photos}
              />
            </div>
          </div>
        </div>

        {/* Video Settings */}
        <div className="space-y-6">
          {/* Video Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">{t('settings')}</h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('settingsDescription')}</p>
            </div>
            <div className="p-6">
              <VideoControls
                settings={settings}
                onSettingsChange={setSettings}
                totalDuration={totalDuration}
                photos={photos}
              />
            </div>
          </div>
        </div>

        {/* Photo Order full width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Photo Reordering */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{t('photoOrder')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('photoOrderDescription')}
                {photos.length > 0 && ` ${t('totalVideoLength', { duration: Math.round(totalDuration).toString() })}`}
              </p>
            </div>
            <div className="p-6">
              <PhotoReorder photos={photos} onReorder={setPhotos} />
            </div>
          </div>
        </div>

        {/* Create Video full width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Create Video Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">{t('createYourVideo')}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('createVideoDescription')}</p>
            </div>
            <div className="p-6">
              {!isProcessing && !downloadUrl && (
                <div className="space-y-3">
                  <button
                    onClick={handleCreateVideo}
                    disabled={photos.length === 0}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-colors duration-200 text-lg"
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Play className="w-6 h-6" />
                      {t('createVideo', {
                        count: photos.length.toString(),
                        plural: photos.length !== 1 ? 's' : ''
                      })}
                    </div>
                  </button>
                </div>
              )}

              {isProcessing && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {t('creatingVideo')}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {t('creatingVideoDescription')}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {t('complete', { progress: progress.toString() })}
                  </div>
                </div>
              )}

              {downloadUrl && (
                <div className="text-center space-y-4">
                  <div className="text-lg font-semibold text-green-700 mb-4">
                    {t('videoReady')}
                  </div>

                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg"
                  >
                    <Download className="w-6 h-6" />
                    {isIOS ? t('downloadVideoIOS') : t('downloadVideo')}
                  </button>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {isIOS ? t('downloadDescriptionIOS') : t('downloadDescription')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('saveToPhotos')}
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
              <p className="font-medium">
                {t('iosInstructions1')}
              </p>

              <ol className="list-decimal list-inside space-y-2">
                <li>{t('iosInstructions2')}</li>
                <li>{t('iosInstructions3')}</li>
                <li>{t('iosInstructions4')}</li>
              </ol>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={proceedWithIOSDownload}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {t('openVideo')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCreator;