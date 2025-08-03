import React, { useState, useRef, useEffect } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [livePhotos, setLivePhotos] = useState<Photo[]>(photos);
  const [originalPhotos, setOriginalPhotos] = useState<Photo[]>(photos);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const dragCounter = useRef(0);
  const touchMoveThreshold = 5; // Reduced threshold for better responsiveness
  const containerRef = useRef<HTMLDivElement>(null);

  // Update live photos when props change
  useEffect(() => {
    if (!isDragging) {
      setLivePhotos(photos);
      setOriginalPhotos(photos);
    }
  }, [photos, isDragging]);

  useEffect(() => {
    // Detect if we're on a mobile device
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
  }, []);

  // Add global touch event listeners for better iOS handling
  useEffect(() => {
    if (!isMobile || !isDragging) return;

    const handleGlobalTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleGlobalTouchEnd = () => {
      // Fallback cleanup if touch events get lost
      setDraggedIndex(null);
      setDragOverIndex(null);
      setTouchStartPos(null);
      setIsDragging(false);
    };

    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    document.addEventListener('touchend', handleGlobalTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
    };
  }, [isMobile, isDragging]);

  // Helper function to perform live reordering
  const performLiveReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    const newPhotos = [...livePhotos];
    const draggedPhoto = newPhotos[fromIndex];

    // Remove from original position
    newPhotos.splice(fromIndex, 1);
    // Insert at new position
    newPhotos.splice(toIndex, 0, draggedPhoto);

    setLivePhotos(newPhotos);
    setDraggedIndex(toIndex); // Update dragged index to new position
  };

  // Desktop drag handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (isMobile) return;
    setDraggedIndex(index);
    setIsDragging(true);
    setOriginalPhotos([...photos]); // Store original order for potential cancellation
    const img = (e.currentTarget.querySelector('img') as HTMLImageElement);
    if (img) {
      e.dataTransfer.setDragImage(img, img.width / 2, img.height / 2);
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    if (isMobile) return;
    e.preventDefault();
    dragCounter.current++;

    // Perform live reordering when dragging over a new item
    if (draggedIndex !== null && draggedIndex !== index) {
      performLiveReorder(draggedIndex, index);
    }
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isMobile) return;
    e.preventDefault();
    dragCounter.current = 0;

    // Commit the live reordering to the parent component
    onReorder(livePhotos);

    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    if (isMobile) return;

    // If drag ended without a drop, revert to original order
    if (isDragging) {
      setLivePhotos([...originalPhotos]);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
    dragCounter.current = 0;
  };

  // Mobile touch handlers - Simplified approach for iOS
  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (!isMobile) return;

    setDebugInfo(`Touch start: ${index}`);
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedIndex(index);
    setIsDragging(false);
    setOriginalPhotos([...photos]);

    // Prevent iOS context menu and default behaviors
    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile || !touchStartPos || draggedIndex === null) return;

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - touchStartPos.y);

    setDebugInfo(`Touch move: delta(${deltaX},${deltaY}) dragging:${isDragging}`);

    // Start dragging if moved beyond threshold
    if (!isDragging && (deltaX > touchMoveThreshold || deltaY > touchMoveThreshold)) {
      setDebugInfo(`Starting drag: delta(${deltaX},${deltaY})`);
      setIsDragging(true);
    }

    if (isDragging) {
      // Simple approach: find the closest photo element to touch point
      let closestIndex = -1;
      let closestDistance = Infinity;

      livePhotos.forEach((_, index) => {
        const element = document.querySelector(`[data-photo-index="${index}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(touch.clientX - centerX, 2) + Math.pow(touch.clientY - centerY, 2)
          );

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });

      // Perform live reordering if over a different photo
      if (closestIndex !== -1 && closestIndex !== draggedIndex && closestIndex !== dragOverIndex) {
        setDebugInfo(`Reordering: ${draggedIndex} → ${closestIndex}`);
        performLiveReorder(draggedIndex, closestIndex);
        setDragOverIndex(closestIndex);
      }
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isMobile) return;

    setDebugInfo(`Touch end: dragging=${isDragging}`);

    if (isDragging) {
      // Commit the live reordering to the parent component
      setDebugInfo('Committing reorder');
      onReorder(livePhotos);
    }

    // Reset states
    setDraggedIndex(null);
    setDragOverIndex(null);
    setTouchStartPos(null);
    setIsDragging(false);

    e.preventDefault();
    e.stopPropagation();
  }; if (photos.length === 0) {
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
        {isMobile ? t('touchToReorder') : t('dragToReorder')}
      </div>

      <div
        ref={containerRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        style={{
          // iOS specific touch handling
          WebkitUserSelect: 'none',
          userSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: isMobile ? 'pan-y' : 'auto', // Allow vertical scrolling but prevent horizontal
        }}
      >
        {/* Debug overlay for iOS */}
        {isMobile && debugInfo && (
          <div className="fixed top-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
            Debug: {debugInfo}
            <br />Mobile: {isMobile ? 'Yes' : 'No'}
            <br />Dragging: {isDragging ? 'Yes' : 'No'}
            <br />Dragged: {draggedIndex}
          </div>
        )}

        {livePhotos.map((photo, index) => (
          <div
            key={photo.id}
            data-photo-index={index}
            draggable={!isMobile}
            onDragStart={!isMobile ? (e) => handleDragStart(e, index) : undefined}
            onDragOver={!isMobile ? handleDragOver : undefined}
            onDragEnter={!isMobile ? (e) => handleDragEnter(e, index) : undefined}
            onDragLeave={!isMobile ? handleDragLeave : undefined}
            onDrop={!isMobile ? handleDrop : undefined}
            onDragEnd={!isMobile ? handleDragEnd : undefined}
            onTouchStart={isMobile ? (e) => handleTouchStart(e, index) : undefined}
            onTouchMove={isMobile ? handleTouchMove : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            className={`
              relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg group
              transition-all duration-300 ease-in-out transform
              ${isMobile ? 'touch-manipulation select-none' : 'cursor-move'}
              ${draggedIndex === index ? 'opacity-70 scale-105 z-20 shadow-2xl rotate-2' : 'opacity-100 scale-100'}
              ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-102' : 'hover:border-gray-300 dark:hover:border-gray-600'}
              ${isDragging && draggedIndex !== index ? 'transition-transform duration-300' : ''}
            `}
            style={{
              transform: isDragging && draggedIndex === index ? 'rotate(5deg)' : undefined,
              // iOS specific touch handling
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              touchAction: isMobile ? 'manipulation' : 'auto',
            }}
          >
            {/* Drag Handle */}
            <div className={`
              absolute top-2 left-2 z-10 p-1 bg-black bg-opacity-50 rounded text-white transition-opacity duration-200
              ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
            `}>
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
                className={`
                  w-full h-full object-cover rounded-lg
                  ${isMobile ? 'pointer-events-none' : ''}
                `}
                style={{
                  // Prevent iOS context menu
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
                onContextMenu={(e) => isMobile && e.preventDefault()}
                draggable={false}
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