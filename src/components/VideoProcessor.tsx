import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type { Photo, VideoSettings, CreateVideoParams } from '../types';

class VideoProcessor {
  async createVideo(params: CreateVideoParams): Promise<Blob> {
    const { photos, audio, settings, onProgress } = params;
    onProgress(0);

    const ffmpeg = new FFmpeg();

    // Progress listener: ratio 0 to 1 -> map to 20-80
    ffmpeg.on('progress', ({ progress }: { progress: number }) => {
      onProgress(Math.floor(20 + progress * 60));
    });

    // Load FFmpeg core
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.15/dist/umd';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    onProgress(10);

    // Write photos to virtual FS
    for (let i = 0; i < photos.length; i++) {
      const data = await fetchFile(photos[i].file);
      await ffmpeg.writeFile(`photo_${i}.jpg`, data);
    }
    onProgress(30);

    const totalDuration = photos.length * settings.photoDuration;

    // Process audio if provided
    if (audio) {
      const audioData = await fetchFile(audio.file);
      await ffmpeg.writeFile('input_audio.mp3', audioData);
      if (audio.duration < totalDuration) {
        const loopCount = Math.ceil(totalDuration / audio.duration) - 1;
        await ffmpeg.exec([
          '-stream_loop', loopCount.toString(),
          '-i', 'input_audio.mp3',
          '-t', totalDuration.toString(),
          '-c:a', 'aac',
          'audio.aac'
        ]);
      } else {
        await ffmpeg.exec([
          '-i', 'input_audio.mp3',
          '-t', totalDuration.toString(),
          '-c:a', 'aac',
          'audio.aac'
        ]);
      }
      onProgress(50);
    }

    // Create filter complex for video
    const filterComplex = this.buildFilter(photos, settings);
    onProgress(60);

    // Assemble FFmpeg arguments
    const args: string[] = [];
    for (let i = 0; i < photos.length; i++) {
      args.push('-loop', '1', '-t', settings.photoDuration.toString(), '-i', `photo_${i}.jpg`);
    }
    if (audio) {
      args.push('-i', 'audio.aac');
    }
    args.push('-filter_complex', filterComplex, '-map', '[outv]');
    if (audio) {
      args.push('-map', `${photos.length}:a`, '-c:a', 'aac');
    } else {
      args.push('-an');
    }
    args.push(
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      'output.mp4'
    );
    onProgress(70);

    // Run encoding
    await ffmpeg.exec(args);
    onProgress(90);

    // Read output file and return blob
    const output = await ffmpeg.readFile('output.mp4');
    onProgress(100);
    return new Blob([output], { type: 'video/mp4' });
  }

  private buildFilter(photos: Photo[], settings: VideoSettings): string {
    const { photoDuration, fadeInOut, fadePosition } = settings;
    const fadeDuration = 0.5;
    let filter = '';

    // Scale and prepare each photo stream
    photos.forEach((_, i) => {
      filter += `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:-1:-1:black,setpts=PTS-STARTPTS,fps=30[v${i}];`;
    });

    if (!fadeInOut) {
      filter += photos.map((_, i) => `[v${i}]`).join('') + `concat=n=${photos.length}:v=1:a=0[outv]`;
      return filter;
    }

    if (fadePosition === 'beginning-end' && photos.length > 1) {
      filter += `[v0]fade=t=in:st=0:d=${fadeDuration}[v0f];`;
      for (let i = 1; i < photos.length - 1; i++) {
        filter += `[v${i}]setpts=PTS-STARTPTS[v${i}f];`;
      }
      const last = photos.length - 1;
      filter += `[v${last}]fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}[v${last}f];`;
      filter += photos.map((_, i) => `[v${i}f]`).join('') + `concat=n=${photos.length}:v=1:a=0[outv]`;
      return filter;
    }

    // Fade throughout
    filter += `[v0]fade=t=in:st=0:d=${fadeDuration}[v0f];`;
    for (let i = 1; i < photos.length; i++) {
      if (i === 1) {
        filter += `[v0f]fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}[v0ff];`;
      }
      filter += `[v${i}]fade=t=in:st=0:d=${fadeDuration}`;
      if (i < photos.length - 1) {
        filter += `,fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}`;
      }
      filter += `[v${i}f];`;
    }
    const streams = photos.map((_, i) => (i === 0 && photos.length > 1 ? '[v0ff]' : `[v${i}f]`)).join('');
    filter += streams + `concat=n=${photos.length}:v=1:a=0[outv]`;
    return filter;
  }
}

export default VideoProcessor;