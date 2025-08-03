import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { Photo, AudioFile, VideoSettings, CreateVideoParams } from '../types';

class VideoProcessor {
  private ffmpeg: FFmpeg;
  private loaded: boolean = false;

  constructor() {
    this.ffmpeg = new FFmpeg();
  }

  private async loadFFmpeg(onProgress: (progress: number) => void) {
    if (this.loaded) return;

    onProgress(5);

    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    this.ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    this.ffmpeg.on('progress', ({ progress }) => {
      const normalizedProgress = Math.max(20, Math.min(80, 20 + (progress * 60)));
      onProgress(normalizedProgress);
    });

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.loaded = true;
    onProgress(15);
  }

  private async processAudio(audio: AudioFile, targetDuration: number): Promise<Uint8Array> {
    const audioData = await fetchFile(audio.file);
    await this.ffmpeg.writeFile('input_audio.mp3', audioData);

    if (audio.duration < targetDuration) {
      // Loop audio if it's shorter than video
      const loopCount = Math.ceil(targetDuration / audio.duration);
      await this.ffmpeg.exec([
        '-stream_loop', (loopCount - 1).toString(),
        '-i', 'input_audio.mp3',
        '-t', targetDuration.toString(),
        '-acodec', 'aac',
        'processed_audio.aac'
      ]);
    } else {
      // Trim audio if it's longer than video
      await this.ffmpeg.exec([
        '-i', 'input_audio.mp3',
        '-t', targetDuration.toString(),
        '-acodec', 'aac',
        'processed_audio.aac'
      ]);
    }

    return await this.ffmpeg.readFile('processed_audio.aac') as Uint8Array;
  }

  private async createFilterComplex(photos: Photo[], settings: VideoSettings): Promise<string> {
    const { photoDuration, fadeInOut, fadePosition } = settings;
    
    if (!fadeInOut) {
      // Simple concatenation without fades
      let filter = '';
      for (let i = 0; i < photos.length; i++) {
        filter += `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:black,setpts=PTS-STARTPTS,fps=30[v${i}];`;
      }
      
      filter += photos.map((_, i) => `[v${i}]`).join('') + `concat=n=${photos.length}:v=1:a=0[outv]`;
      return filter;
    }

    // Complex filter with fades
    let filter = '';
    const fadeDuration = 0.5; // 0.5 second fade

    // Scale and prepare each input
    for (let i = 0; i < photos.length; i++) {
      filter += `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:black,setpts=PTS-STARTPTS,fps=30[v${i}];`;
    }

    if (fadePosition === 'beginning-end' && photos.length > 1) {
      // Only fade at beginning and end
      filter += `[v0]fade=t=in:st=0:d=${fadeDuration}[v0f];`;
      
      for (let i = 1; i < photos.length - 1; i++) {
        filter += `[v${i}]setpts=PTS-STARTPTS[v${i}f];`;
      }
      
      const lastIndex = photos.length - 1;
      filter += `[v${lastIndex}]fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}[v${lastIndex}f];`;
      
      filter += photos.map((_, i) => `[v${i}f]`).join('') + `concat=n=${photos.length}:v=1:a=0[outv]`;
    } else {
      // Fade between each photo
      filter += `[v0]fade=t=in:st=0:d=${fadeDuration}[v0f];`;
      
      for (let i = 1; i < photos.length; i++) {
        const prevFadeOut = i === 1 ? `[v0f]fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}[v0ff];` : '';
        if (prevFadeOut) filter += prevFadeOut;
        
        filter += `[v${i}]fade=t=in:st=0:d=${fadeDuration}`;
        if (i < photos.length - 1) {
          filter += `,fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}`;
        }
        filter += `[v${i}f];`;
      }
      
      filter += photos.map((_, i) => i === 0 && photos.length > 1 ? '[v0ff]' : `[v${i}f]`).join('') + `concat=n=${photos.length}:v=1:a=0[outv]`;
    }

    return filter;
  }

  async createVideo(params: CreateVideoParams): Promise<Blob> {
    const { photos, audio, settings, onProgress } = params;
    
    await this.loadFFmpeg(onProgress);
    
    onProgress(20);

    // Write photo files
    for (let i = 0; i < photos.length; i++) {
      const photoData = await fetchFile(photos[i].file);
      await this.ffmpeg.writeFile(`photo_${i}.jpg`, photoData);
    }

    onProgress(30);

    const totalDuration = photos.length * settings.photoDuration;
    let processedAudio: Uint8Array | null = null;

    if (audio) {
      processedAudio = await this.processAudio(audio, totalDuration);
      onProgress(50);
    }

    // Create filter complex
    const filterComplex = await this.createFilterComplex(photos, settings);

    onProgress(60);

    // Build FFmpeg command
    const inputArgs: string[] = [];
    const filterArgs: string[] = [];

    // Add photo inputs
    for (let i = 0; i < photos.length; i++) {
      inputArgs.push('-loop', '1', '-t', settings.photoDuration.toString(), '-i', `photo_${i}.jpg`);
    }

    // Add filter complex
    filterArgs.push('-filter_complex', filterComplex, '-map', '[outv]');

    // Add audio if present
    if (processedAudio) {
      filterArgs.push('-i', 'processed_audio.aac', '-map', '1:a', '-c:a', 'aac');
    } else {
      filterArgs.push('-an'); // No audio
    }

    // Output settings
    const outputArgs = [
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      'output.mp4'
    ];

    onProgress(70);

    // Execute FFmpeg command
    await this.ffmpeg.exec([
      ...inputArgs,
      ...filterArgs,
      ...outputArgs
    ]);

    onProgress(90);

    // Read the output file
    const data = await this.ffmpeg.readFile('output.mp4') as Uint8Array;
    
    onProgress(100);
    
    return new Blob([data], { type: 'video/mp4' });
  }
}

export default VideoProcessor;