// NOTE: Ensure @ffmpeg/core is installed (`npm install @ffmpeg/core`) before using asset imports
import { FFmpeg } from '@ffmpeg/ffmpeg';
// Import FFmpeg core assets via package exports and Vite URL loader
import coreJsUrl from '@ffmpeg/core?url';
import coreWasmUrl from '@ffmpeg/core/wasm?url';
import type { Photo, VideoSettings, CreateVideoParams } from '../types';

class VideoProcessor {
  async createVideo(params: CreateVideoParams): Promise<Blob> {
    const { photos, audio, settings, onProgress } = params;
    onProgress(0);

    const ffmpeg = new FFmpeg();

    // Add logging for debugging
    ffmpeg.on('log', ({ message }) => {
      console.log('FFmpeg log:', message);
    });

    // Progress listener: ratio 0 to 1 -> map to 20-80
    ffmpeg.on('progress', ({ progress }: { progress: number }) => {
      onProgress(Math.floor(20 + progress * 60));
    });

    try {
      // Load FFmpeg core from local module assets with fallback options
      console.log('Loading FFmpeg with core URLs:', { coreJsUrl, coreWasmUrl });

      await ffmpeg.load({
        coreURL: coreJsUrl,
        wasmURL: coreWasmUrl,
        // Add workerURL if needed for better compatibility
      });

      console.log('FFmpeg loaded successfully');
      onProgress(10);

      // Write photos to virtual FS
      for (let i = 0; i < photos.length; i++) {
        console.log(`Processing photo ${i}: ${photos[i].name}, file size: ${photos[i].file.size} bytes`);

        // Use the file directly instead of fetchFile for better reliability
        const fileData = new Uint8Array(await photos[i].file.arrayBuffer());
        console.log(`Converted photo ${i} to array buffer: ${fileData.length} bytes`);

        await ffmpeg.writeFile(`photo_${i}.jpg`, fileData);
        console.log(`Written photo_${i}.jpg, size: ${fileData.length} bytes`);
      }
      onProgress(30);

      const totalDuration = photos.length * settings.photoDuration;
      console.log(`Total video duration: ${totalDuration} seconds`);

      // Process audio if provided
      if (audio) {
        console.log(`Processing audio: ${audio.name}, file size: ${audio.file.size} bytes`);

        // Use arrayBuffer instead of fetchFile
        const audioData = new Uint8Array(await audio.file.arrayBuffer());
        console.log(`Converted audio to array buffer: ${audioData.length} bytes`);

        await ffmpeg.writeFile('input_audio.mp3', audioData);
        console.log(`Written audio file, size: ${audioData.length} bytes`);

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
      }      // Create filter complex for video
      const filterComplex = this.buildFilter(photos, settings);
      console.log('Filter complex:', filterComplex);
      onProgress(60);

      // Assemble FFmpeg arguments with simpler approach
      const args: string[] = [];

      // Add input files
      for (let i = 0; i < photos.length; i++) {
        args.push('-loop', '1', '-t', settings.photoDuration.toString(), '-i', `photo_${i}.jpg`);
      }

      if (audio) {
        args.push('-i', 'audio.aac');
      }

      // Add filter complex
      args.push('-filter_complex', filterComplex);

      // Map video output
      args.push('-map', '[outv]');

      // Map audio if available
      if (audio) {
        args.push('-map', `${photos.length}:a`);
        args.push('-c:a', 'aac');
        args.push('-b:a', '128k'); // Add audio bitrate
      } else {
        args.push('-an');
      }

      // Video encoding options - simplified for better compatibility
      args.push(
        '-c:v', 'libx264',
        '-preset', 'ultrafast', // Use ultrafast for better compatibility
        '-crf', '28', // Higher CRF for smaller files and faster encoding
        '-pix_fmt', 'yuv420p',
        '-r', '30', // Explicit frame rate
        '-movflags', '+faststart',
        '-shortest', // Stop at shortest input
        'output.mp4'
      ); console.log('FFmpeg command:', args.join(' '));
      onProgress(70);

      // Run encoding
      await ffmpeg.exec(args);
      onProgress(90);

      // Check if output file exists and has content
      const files = await ffmpeg.listDir('/');
      console.log('Files in FFmpeg filesystem:', files);

      const outputFile = files.find(f => f.name === 'output.mp4');
      if (!outputFile) {
        throw new Error('Failed to generate video: output.mp4 file was not created');
      }

      // Read output file and return blob
      const output = await ffmpeg.readFile('output.mp4');

      console.log('FFmpeg output type:', typeof output);
      console.log('FFmpeg output constructor:', output.constructor.name);
      console.log('FFmpeg output length:', (output as Uint8Array).length);

      // Ensure output is a Uint8Array and has content
      if (!output) {
        throw new Error('Failed to generate video: No output from FFmpeg');
      }

      // FFmpeg readFile returns Uint8Array, but let's ensure it's the right type
      const uint8Array = output as Uint8Array;

      if (uint8Array.length === 0) {
        throw new Error('Failed to generate video: Output file is empty (0 bytes)');
      } console.log(`Generated video size: ${uint8Array.length} bytes`);

      // Verify it looks like an MP4 file (should start with specific bytes)
      const mp4Header = uint8Array.slice(0, 8);
      console.log('MP4 header bytes:', Array.from(mp4Header).map(b => b.toString(16).padStart(2, '0')).join(' '));

      onProgress(100);

      // Create blob with proper video MIME type
      const blob = new Blob([uint8Array], { type: 'video/mp4' });
      console.log('Created blob size:', blob.size);

      return blob;

    } catch (error) {
      console.error('Error in video processing:', error);
      throw error;
    } finally {
      // Clean up FFmpeg instance
      try {
        ffmpeg.terminate();
      } catch (e) {
        console.warn('Error terminating FFmpeg:', e);
      }
    }
  }

  private buildFilter(photos: Photo[], settings: VideoSettings): string {
    const { photoDuration, fadeInOut, fadePosition } = settings;
    const fadeDuration = 0.5;
    let filter = '';

    // Validate inputs
    if (photos.length === 0) {
      throw new Error('No photos provided for video generation');
    }

    // Scale and prepare each photo stream
    photos.forEach((_, i) => {
      filter += `[${i}:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,setpts=PTS-STARTPTS,fps=30,setsar=1[v${i}];`;
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

    // Single photo case
    if (photos.length === 1) {
      filter += `[v0]fade=t=in:st=0:d=${fadeDuration},fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}[outv]`;
      return filter;
    }

    // Fade throughout (multiple photos)
    filter += `[v0]fade=t=in:st=0:d=${fadeDuration},fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}[v0f];`;
    for (let i = 1; i < photos.length - 1; i++) {
      filter += `[v${i}]fade=t=in:st=0:d=${fadeDuration},fade=t=out:st=${photoDuration - fadeDuration}:d=${fadeDuration}[v${i}f];`;
    }
    const last = photos.length - 1;
    filter += `[v${last}]fade=t=in:st=0:d=${fadeDuration}[v${last}f];`;

    const streams = photos.map((_, i) => `[v${i}f]`).join('');
    filter += streams + `concat=n=${photos.length}:v=1:a=0[outv]`;
    return filter;
  }
}

export default VideoProcessor;