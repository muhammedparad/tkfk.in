/**
 * Client-Side Real-Time Face & Multi-Person Detection Utility
 * Uses Native Browser Shape Detection API with universal Canvas cluster fallback.
 */

let offscreenCanvas: HTMLCanvasElement | null = null;
let nativeDetector: any = null;

export interface DetectionResult {
  count: number;
  method: 'native' | 'cluster' | 'none';
  hasMultiplePersons: boolean;
}

export async function detectPersonsInVideo(video: HTMLVideoElement | null): Promise<DetectionResult> {
  if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
    return { count: 0, method: 'none', hasMultiplePersons: false };
  }

  // 1. Native Hardware-Accelerated FaceDetector API (Chromium / Edge / Modern Browsers)
  if (typeof window !== 'undefined' && 'FaceDetector' in window) {
    try {
      if (!nativeDetector) {
        nativeDetector = new (window as any).FaceDetector({ maxDetectedFaces: 5, fastMode: true });
      }
      const faces = await nativeDetector.detect(video);
      if (Array.isArray(faces)) {
        const count = faces.length;
        return {
          count,
          method: 'native',
          hasMultiplePersons: count >= 2
        };
      }
    } catch (nativeErr) {
      // Fallback to cluster analyzer
    }
  }

  // 2. High-Performance Canvas Centroid & Color Cluster Fallback (Universal for Safari, Firefox, iOS)
  try {
    if (!offscreenCanvas) {
      offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = 160;
      offscreenCanvas.height = 120;
    }

    const ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return { count: 1, method: 'none', hasMultiplePersons: false };
    }

    ctx.drawImage(video, 0, 0, 160, 120);
    const imgData = ctx.getImageData(0, 0, 160, 120);
    const data = imgData.data;

    // Grid partitioning to detect distinct head/face centroids
    const gridCols = 8;
    const gridRows = 6;
    const cellW = 160 / gridCols;
    const cellH = 120 / gridRows;
    const skinDensities = new Array(gridCols * gridRows).fill(0);

    for (let y = 0; y < 120; y += 2) {
      for (let x = 0; x < 160; x += 2) {
        const idx = (y * 160 + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // YCbCr skin chrominance test
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        if (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) {
          const col = Math.min(gridCols - 1, Math.floor(x / cellW));
          const row = Math.min(gridRows - 1, Math.floor(y / cellH));
          skinDensities[row * gridCols + col]++;
        }
      }
    }

    // Identify distinct peaks separated horizontally by at least 2 cells
    const activeColumns: number[] = [];
    for (let c = 0; c < gridCols; c++) {
      let colTotal = 0;
      for (let r = 0; r < gridRows; r++) {
        colTotal += skinDensities[r * gridCols + c];
      }
      if (colTotal > 60) {
        activeColumns.push(c);
      }
    }

    // Count separated horizontal clusters (gap >= 2 columns = 2 distinct persons)
    let distinctClusters = 0;
    if (activeColumns.length > 0) {
      distinctClusters = 1;
      for (let i = 1; i < activeColumns.length; i++) {
        if (activeColumns[i] - activeColumns[i - 1] >= 2) {
          distinctClusters++;
        }
      }
    }

    return {
      count: distinctClusters,
      method: 'cluster',
      hasMultiplePersons: distinctClusters >= 2
    };

  } catch {
    return { count: 1, method: 'none', hasMultiplePersons: false };
  }
}
