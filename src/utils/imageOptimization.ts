/**
 * Image optimization utilities for better performance with large photo sets
 */

export interface OptimizedPhoto {
    id: string;
    file: File;
    url: string;
    thumbnailUrl: string;
    name: string;
    width?: number;
    height?: number;
}

/**
 * Creates a thumbnail version of an image file
 */
export function createThumbnail(file: File, maxSize: number = 200): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate thumbnail dimensions
            let { width, height } = img;
            const scale = Math.min(maxSize / width, maxSize / height);

            width *= scale;
            height *= scale;

            // Set canvas size
            canvas.width = width;
            canvas.height = height;

            // Draw and compress
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob with compression
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const thumbnailUrl = URL.createObjectURL(blob);
                            resolve(thumbnailUrl);
                        } else {
                            reject(new Error('Failed to create thumbnail'));
                        }
                    },
                    'image/jpeg',
                    0.7 // 70% quality for good balance
                );
            } else {
                reject(new Error('Canvas context not available'));
            }

            // Clean up
            URL.revokeObjectURL(img.src);
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Creates optimized photo objects with thumbnails
 */
export async function createOptimizedPhotos(files: File[]): Promise<OptimizedPhoto[]> {
    const promises = files.map(async (file) => {
        if (!file.type.startsWith('image/')) {
            throw new Error(`Invalid file type: ${file.type}`);
        }

        const id = Math.random().toString(36).substr(2, 9);
        const url = URL.createObjectURL(file);

        try {
            const thumbnailUrl = await createThumbnail(file, 200);

            return {
                id,
                file,
                url,
                thumbnailUrl,
                name: file.name
            };
        } catch (error) {
            // If thumbnail creation fails, use original as fallback
            console.warn('Thumbnail creation failed for', file.name, error);
            return {
                id,
                file,
                url,
                thumbnailUrl: url,
                name: file.name
            };
        }
    });

    return Promise.all(promises);
}

/**
 * Cleanup URLs to prevent memory leaks - supports both Photo and OptimizedPhoto types
 */
export function cleanupPhotoUrls(photos: (OptimizedPhoto | { url: string; thumbnailUrl?: string })[]): void {
    photos.forEach(photo => {
        if (photo.thumbnailUrl && photo.url !== photo.thumbnailUrl) {
            URL.revokeObjectURL(photo.thumbnailUrl);
        }
        URL.revokeObjectURL(photo.url);
    });
}

/**
 * Lazy loading intersection observer
 */
export function createImageLazyLoader(callback: (entries: IntersectionObserverEntry[]) => void): IntersectionObserver {
    return new IntersectionObserver(
        callback,
        {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        }
    );
}
