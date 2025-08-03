import React, { useState, useRef } from 'react';
import { Music, Image, Download, Play, Settings } from 'lucide-react';
import PhotoUploader from './PhotoUploader';
import AudioUploader from './AudioUploader';
import PhotoReorder from './PhotoReorder';
import VideoControls from './VideoControls';
import VideoProcessor from './VideoProcessor';
import { useTranslation } from '../hooks/useTranslation';
import { Photo, AudioFile, VideoSettings } from '../types';
import { debugVideoCreation } from '../utils/videoDebug';
import { SimpleVideoTest } from '../utils/simpleVideoTest';

const VideoCreator: React.FC = () => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<VideoSettings>({
    photoDuration: 3,
    fadeInOut: true,
    fadePosition: 'throughout',
    audioFadeInOut: true
  });

  const videoProcessorRef = useRef<VideoProcessor | null>(null);

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

  const totalDuration = photos.length * settings.photoDuration;

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
                {photos.length > 0 && ` ${t('totalVideoLength', { duration: totalDuration.toString() })}`}
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

                  {/* Debug test buttons - remove in production */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={async () => {
                        const testBlob = await debugVideoCreation.createTestVideo();
                        debugVideoCreation.logBlobInfo(testBlob, 'Test blob');
                        debugVideoCreation.testBlobDownload(testBlob, 'test-download.mp4');
                      }}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      Test Download
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          console.log('Testing simple video creation...');
                          const simpleVideo = await SimpleVideoTest.createSimpleVideo();
                          debugVideoCreation.logBlobInfo(simpleVideo, 'Simple video');
                          debugVideoCreation.testBlobDownload(simpleVideo, 'simple-test.mp4');
                        } catch (error) {
                          console.error('Simple video test failed:', error);
                          alert('Simple video test failed: ' + (error as Error).message);
                        }
                      }}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg text-sm"
                    >
                      FFmpeg Test
                    </button>
                  </div>
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

                  <a
                    href={downloadUrl}
                    download="my-video.mp4"
                    className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors duration-200 text-lg"
                  >
                    <Download className="w-6 h-6" />
                    {t('downloadVideo')}
                  </a>

                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {t('downloadDescription')}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCreator;