/**
 * Format duration in MM:SS format
 * @param totalSeconds - Duration in seconds
 * @returns Formatted time string (e.g., "02:32", "01:03", "00:45")
 */
export const formatDuration = (totalSeconds: number): string => {
    const roundedSeconds = Math.round(totalSeconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const seconds = roundedSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
