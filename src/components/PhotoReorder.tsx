import React, { useState, useRef } from 'react';
import { GripVertical, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { Photo } from '../types';

interface PhotoReorderProps {
  photos: Photo[];
  onReorder: (photos: Photo[]) => void;
}

const PhotoReorder: React.FC<PhotoReorderProps> = ({ photos, onReorder }) => {
  const { t } = useTranslation();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragCounter = useRef(0);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // show the actual photo under the cursor while dragging
    const img = (e.currentTarget.querySelector('img') as HTMLImageElement);
    if (img) {
      e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    dragCounter.current = 0;

    if (draggedIndex === null) return;

    const newPhotos = [...photos];
    const draggedPhoto = newPhotos[draggedIndex];

    // Remove the dragged item
    newPhotos.splice(draggedIndex, 1);

    // Insert at new position
    newPhotos.splice(dropIndex, 0, draggedPhoto);

    onReorder(newPhotos);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  if (photos.length === 0) {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noPhotosSelected')}</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">{t('addPhotosToStart')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {t('dragToReorder')}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 cursor-move group
              ${draggedIndex === index ? 'opacity-50 transform scale-95' : ''}
              ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'hover:border-gray-300 dark:hover:border-gray-600'}
            `}
          >
            {/* Drag Handle */}
            <div className="absolute top-2 left-2 z-10 p-1 bg-black bg-opacity-50 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <GripVertical className="w-3 h-3" />
            </div>

            {/* Photo Number */}
            <div className="absolute top-2 right-2 z-10 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              #{index + 1}
            </div>

            {/* Photo */}
            <div className="aspect-square w-full">
              <img
                src={photo.url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* File Size */}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
              {(photo.file.size / (1024 * 1024)).toFixed(1)} {t('mb')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoReorder;