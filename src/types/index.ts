export interface Photo {
  id: string;
  file: File;
  url: string;
  thumbnailUrl?: string;
  name: string;
  width?: number;
  height?: number;
  type: 'image' | 'video';
  duration?: number; // For videos, duration in seconds
}

export interface AudioFile {
  file: File;
  url: string;
  name: string;
  duration: number;
}

export interface VideoSettings {
  photoDuration: number;
  fadeInOut: boolean;
  fadePosition: 'throughout' | 'beginning-end';
  audioFadeInOut: boolean;
  applyPhotoDurationToVideos: boolean;
  keepOriginalVideoAudio: boolean;
}

export interface CreateVideoParams {
  photos: Photo[];
  audio: AudioFile | null;
  settings: VideoSettings;
  onProgress: (progress: number) => void;
}

export type Language = 'en' | 'zh-TW';
export type Theme = 'light' | 'dark';