// Debug utility for video creation issues
export const debugVideoCreation = {
    logBlobInfo: (blob: Blob, label: string = 'Blob') => {
        console.log(`${label} info:`, {
            size: blob.size,
            type: blob.type,
            lastModified: blob instanceof File ? (blob as File).lastModified : 'N/A'
        });
    },

    testBlobDownload: (blob: Blob, filename: string = 'test-video.mp4') => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    createTestVideo: async (): Promise<Blob> => {
        // Create a minimal test MP4 blob to verify download functionality
        const mp4Header = new Uint8Array([
            0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp box
            0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00, // isom
            0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
            0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31
        ]);

        return new Blob([mp4Header], { type: 'video/mp4' });
    }
};
