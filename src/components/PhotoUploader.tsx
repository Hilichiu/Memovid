import React, { useRef, useState } from 'react';
import { Upload, X, Loader } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Photo } from '../types';
import { createOptimizedPhotos } from '../utils/imageOptimization';

interface PhotoUploaderProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ photos, onPhotosChange }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setIsProcessing(true);

    try {
      // Filter files to include images, videos, and HEIF files (by extension)
      const fileArray = Array.from(files).filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        // Check for HEIF files by extension (some systems don't set proper MIME types)
        const isHeif = /\.(heic|heif)$/i.test(file.name);

        return isImage || isVideo || isHeif;
      });

      if (fileArray.length === 0) {
        alert(t('selectImageVideoOnly'));
        setIsProcessing(false);
        return;
      }

      // Limit total photos to prevent memory issues - responsive based on device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0);
      const MAX_PHOTOS = isMobile ? 100 : 200; // 100 for mobile, 200 for desktop
      const remainingSlots = Math.max(0, MAX_PHOTOS - photos.length);
      const filesToProcess = fileArray.slice(0, remainingSlots);

      if (filesToProcess.length < fileArray.length) {
        alert(t('maxPhotosReached', {
          maxPhotos: MAX_PHOTOS.toString(),
          processed: filesToProcess.length.toString()
        }));
      }

      if (filesToProcess.length === 0) {
        alert(t('maxPhotosLimitReached', { maxPhotos: MAX_PHOTOS.toString() }));
        setIsProcessing(false);
        return;
      }

      // Create optimized photos with thumbnails
      const newOptimizedPhotos = await createOptimizedPhotos(filesToProcess);

      // Check if any HEIF files were detected (not supported)
      const heifFiles = newOptimizedPhotos.filter(photo =>
        photo.name.includes('(HEIF not supported)')
      );

      if (heifFiles.length > 0) {
        const heifNames = heifFiles.map(photo =>
          photo.name.replace(' (HEIF not supported)', '')
        ).join(', ');

        alert(`Info: ${heifFiles.length} HEIF file(s) detected: ${heifNames}. HEIF format is not supported by web browsers. Please convert these files to JPEG for best results.`);
      }

      // Convert to Photo interface
      const newPhotos: Photo[] = newOptimizedPhotos.map(optimized => ({
        id: optimized.id,
        file: optimized.file,
        url: optimized.url,
        thumbnailUrl: optimized.thumbnailUrl,
        name: optimized.name,
        width: optimized.width,
        height: optimized.height,
        type: optimized.type,
        duration: optimized.duration
      }));

      onPhotosChange([...photos, ...newPhotos]);
    } catch (error) {
      console.error('Error processing photos:', error);

      // Provide specific error message for HEIF conversion issues
      const errorMessage = error instanceof Error && error.message.includes('HEIF')
        ? 'Error converting HEIF/HEIC files. Please try converting them to JPEG first, or use a different image format.'
        : 'Error processing some photos. Please try again.';

      alert(errorMessage);
    } finally {
      setIsProcessing(false);
      // Reset the input value
      event.target.value = '';
    }
  };

  const removePhoto = (id: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    onPhotosChange(updatedPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,.heic,.heif"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={openFileDialog}
        disabled={isProcessing}
        className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-8 transition-colors duration-200 group"
      >
        <div className="text-center">
          {isProcessing ? (
            <Loader className="w-12 h-12 text-blue-500 mx-auto mb-3 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mx-auto mb-3 transition-colors duration-200" />
          )}
          <div className="text-lg font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
            {isProcessing ? 'Processing photos...' : t('selectPhotos')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {isProcessing ? 'Creating thumbnails for better performance' : t('selectPhotosDescription')}
          </div>
        </div>
      </button>

      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('selectedPhotos', { count: photos.length.toString() })}
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto overflow-x-hidden p-2">
            {photos.map((photo, index) => {
              const isHeifFile = photo.name.includes('(HEIF not supported)');
              return (
                <div key={photo.id} className="relative group">
                  <div className={`aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden ${isHeifFile ? 'border-2 border-yellow-400' : ''}`}>
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isHeifFile && (
                      <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded">
                        HEIF
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200 shadow-lg"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                    #{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;