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
    type: 'image' | 'video';
    duration?: number;
}

/**
 * Checks if a file is a HEIF/HEIC image
 */
function isHeifFile(file: File): boolean {
    const heifMimeTypes = ['image/heic', 'image/heif'];
    const heifExtensions = ['.heic', '.heif'];

    // Check MIME type
    if (heifMimeTypes.includes(file.type.toLowerCase())) {
        return true;
    }

    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    return heifExtensions.some(ext => fileName.endsWith(ext));
}

/**
 * Creates a placeholder image for failed HEIF conversions
 */
function createHeifPlaceholderImage(fileName: string): Blob {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas size
    canvas.width = 400;
    canvas.height = 400;

    if (ctx) {
        // Draw a gray background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw border
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

        // Draw text
        ctx.fillStyle = '#6b7280';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('HEIF Format', canvas.width / 2, 150);
        ctx.fillText('Not Supported', canvas.width / 2, 180);

        ctx.font = '12px Arial';
        ctx.fillText('Please convert to JPEG', canvas.width / 2, 220);
        ctx.fillText('and re-upload', canvas.width / 2, 240);

        // Draw file name (truncated if too long)
        const displayName = fileName.length > 30 ? fileName.substring(0, 27) + '...' : fileName;
        ctx.font = '10px Arial';
        ctx.fillText(displayName, canvas.width / 2, 280);
    }

    // Convert to blob synchronously 
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
}

/**
 * Creates a thumbnail version of an image file
 */
export function createThumbnail(file: File, maxSize: number = 400): Promise<string> {
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
                    0.8 // 80% quality for better visual quality
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
 * Creates a thumbnail from a video file at a specific time
 */
export function createVideoThumbnail(file: File, maxSize: number = 400, seekTime: number = 1): Promise<{ thumbnailUrl: string, duration: number }> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        video.onloadeddata = () => {
            // Set seek time, but not beyond video duration
            const seekTo = Math.min(seekTime, video.duration / 2);
            video.currentTime = seekTo;
        };

        video.onseeked = () => {
            try {
                // Calculate thumbnail dimensions
                let { videoWidth: width, videoHeight: height } = video;
                const scale = Math.min(maxSize / width, maxSize / height);

                width *= scale;
                height *= scale;

                // Set canvas size
                canvas.width = width;
                canvas.height = height;

                // Draw video frame to canvas
                if (ctx) {
                    ctx.drawImage(video, 0, 0, width, height);

                    // Convert to blob with compression
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const thumbnailUrl = URL.createObjectURL(blob);
                                resolve({ thumbnailUrl, duration: video.duration });
                            } else {
                                reject(new Error('Failed to create video thumbnail'));
                            }
                        },
                        'image/jpeg',
                        0.8
                    );
                } else {
                    reject(new Error('Canvas context not available'));
                }

                // Clean up
                URL.revokeObjectURL(video.src);
            } catch (error) {
                reject(error);
            }
        };

        video.onerror = () => reject(new Error('Failed to load video for thumbnail'));
        video.src = URL.createObjectURL(file);
        video.load();
    });
}

/**
 * Creates optimized photo/video objects with thumbnails for video processing
 */
export async function createOptimizedPhotos(files: File[]): Promise<OptimizedPhoto[]> {
    const promises = files.map(async (file) => {
        const id = Math.random().toString(36).substr(2, 9);

        // Check for HEIF files and immediately create placeholder (no conversion attempt)
        if (isHeifFile(file)) {
            console.log(`HEIF file detected: ${file.name} - Creating placeholder (no conversion attempted)`);

            const placeholderBlob = createHeifPlaceholderImage(file.name);
            const placeholderUrl = URL.createObjectURL(placeholderBlob);

            return {
                id,
                file: new File([placeholderBlob], file.name.replace(/\.(heic|heif)$/i, '_heif_not_supported.jpg'), {
                    type: 'image/jpeg',
                    lastModified: file.lastModified
                }),
                url: placeholderUrl,
                thumbnailUrl: placeholderUrl,
                name: file.name + ' (HEIF not supported)',
                type: 'image' as const
            };
        }

        // Process regular image/video files
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            throw new Error(`Invalid file type: ${file.type}`);
        }

        const url = URL.createObjectURL(file);

        try {
            if (isImage) {
                const thumbnailUrl = await createThumbnail(file, 400);
                return {
                    id,
                    file: file,
                    url,
                    thumbnailUrl,
                    name: file.name,
                    type: 'image' as const
                };
            } else {
                // Video file
                const { thumbnailUrl, duration } = await createVideoThumbnail(file, 400);
                return {
                    id,
                    file: file,
                    url,
                    thumbnailUrl,
                    name: file.name,
                    type: 'video' as const,
                    duration
                };
            }
        } catch (error) {
            // If thumbnail creation fails, use original as fallback
            console.warn('Thumbnail creation failed for', file.name, error);
            return {
                id,
                file: file,
                url,
                thumbnailUrl: url,
                name: file.name,
                type: isImage ? 'image' as const : 'video' as const,
                duration: isVideo ? undefined : undefined
            };
        }
    });

    return Promise.all(promises);
}

/**
 * Creates optimized images for video processing - reduces file sizes before FFmpeg
 */
export async function createVideoOptimizedImage(file: File, maxSize: number = 1920): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate dimensions for video processing
            let { width, height } = img;

            // Only resize if image is larger than maxSize
            if (width > maxSize || height > maxSize) {
                const scale = Math.min(maxSize / width, maxSize / height);
                width *= scale;
                height *= scale;
            }

            // Set canvas size
            canvas.width = width;
            canvas.height = height;

            // Draw and compress for video processing
            if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);

                // Convert to blob with optimization for video
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to optimize image for video'));
                        }
                    },
                    'image/jpeg',
                    0.85 // 85% quality for video processing balance
                );
            } else {
                reject(new Error('Canvas context not available'));
            }

            // Clean up
            URL.revokeObjectURL(img.src);
        };

        img.onerror = () => reject(new Error('Failed to load image for optimization'));
        img.src = URL.createObjectURL(file);
    });
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
