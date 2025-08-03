import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import coreJsUrl from '@ffmpeg/core?url';
import coreWasmUrl from '@ffmpeg/core/wasm?url';

export class SimpleVideoTest {
    static async createSimpleVideo(): Promise<Blob> {
        const ffmpeg = new FFmpeg();

        // Add logging
        ffmpeg.on('log', ({ message }) => {
            console.log('FFmpeg log:', message);
        });

        try {
            // Load FFmpeg
            console.log('Loading FFmpeg for simple test...');
            await ffmpeg.load({
                coreURL: coreJsUrl,
                wasmURL: coreWasmUrl,
            });
            console.log('FFmpeg loaded for simple test');

            // Create a simple test image (red square)
            const canvas = document.createElement('canvas');
            canvas.width = 640;
            canvas.height = 480;
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, 640, 480);

            // Convert canvas to blob
            const imageBlob = await new Promise<Blob>((resolve) => {
                canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.9);
            });

            // Write to FFmpeg filesystem
            const imageData = await fetchFile(imageBlob);
            await ffmpeg.writeFile('test.jpg', imageData);

            // Simple command to create 3-second video
            await ffmpeg.exec([
                '-loop', '1',
                '-i', 'test.jpg',
                '-t', '3',
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-pix_fmt', 'yuv420p',
                '-r', '1', // Very low frame rate for testing
                'output.mp4'
            ]);

            // Read output
            const output = await ffmpeg.readFile('output.mp4');
            console.log('Simple test output size:', output.length);

            return new Blob([output], { type: 'video/mp4' });

        } finally {
            ffmpeg.terminate();
        }
    }
}
