/**
 * Client-Side Resilient Camera Acquisition Utility
 * Supports tiered fallback constraints and detailed diagnostic error formatting.
 */

export interface CameraErrorInfo {
  type: 'in_use' | 'permission_denied' | 'not_found' | 'insecure' | 'unknown';
  title: string;
  hint: string;
}

export async function getBestCameraStream(): Promise<MediaStream> {
  if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    const err = new Error('InsecureContextError: Camera API requires HTTPS or localhost.');
    err.name = 'InsecureContextError';
    throw err;
  }

  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const err = new Error('NotSupportedError: Your browser does not support the camera API.');
    err.name = 'NotSupportedError';
    throw err;
  }

  // Tier 1: High quality user-facing with ideal aspect resolution
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false
    });
  } catch (err1: any) {
    console.warn('[Camera Acquisition Tier 1 Failed]', err1?.name, err1?.message);
    if (
      err1?.name === 'NotAllowedError' || 
      err1?.name === 'PermissionDeniedError' || 
      err1?.name === 'NotReadableError' ||
      err1?.name === 'TrackStartError'
    ) {
      throw err1; // Do not try different constraints if permission is denied or device is locked by another app
    }
  }

  // Tier 2: User-facing simple constraint
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' },
      audio: false
    });
  } catch (err2: any) {
    console.warn('[Camera Acquisition Tier 2 Failed]', err2?.name, err2?.message);
    if (
      err2?.name === 'NotAllowedError' || 
      err2?.name === 'PermissionDeniedError' || 
      err2?.name === 'NotReadableError' ||
      err2?.name === 'TrackStartError'
    ) {
      throw err2;
    }
  }

  // Tier 3: Universal fallback (Any video source - Works with USB cameras, virtual webcams, Windows laptops)
  return await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  });
}

export function getCameraErrorMessage(err: any): CameraErrorInfo {
  const name = err?.name || '';
  const msg = (err?.message || '').toLowerCase();

  // 1. Device in use by another app or tab (Common on Windows)
  if (
    name === 'NotReadableError' || 
    name === 'TrackStartError' || 
    msg.includes('in use') || 
    msg.includes('could not start') ||
    msg.includes('busy') ||
    msg.includes('hardware')
  ) {
    return {
      type: 'in_use',
      title: 'Camera is currently locked by another application',
      hint: 'Your webcam is being used by another app (e.g. Zoom, Teams, Discord, Windows Camera app, or another open browser tab). Please close other camera apps/tabs and click "Retry Camera".'
    };
  }

  // 2. Permission Denied / Blocked
  if (
    name === 'NotAllowedError' || 
    name === 'PermissionDeniedError' || 
    name === 'SecurityError' ||
    msg.includes('permission') ||
    msg.includes('denied')
  ) {
    return {
      type: 'permission_denied',
      title: 'Camera permission was not granted by browser or OS',
      hint: '1. In Chrome/Edge: Click the lock or camera icon in the address bar and select "Allow".\n2. In Windows Settings: Go to Settings > Privacy & Security > Camera and ensure "Let desktop apps access your camera" is turned ON.'
    };
  }

  // 3. No Camera Hardware Found
  if (
    name === 'NotFoundError' || 
    name === 'DevicesNotFoundError' || 
    msg.includes('not found') ||
    msg.includes('device')
  ) {
    return {
      type: 'not_found',
      title: 'No webcam device detected',
      hint: 'Please connect a USB webcam or ensure your built-in laptop camera is enabled.'
    };
  }

  // 4. Insecure Context
  if (name === 'InsecureContextError' || msg.includes('https') || msg.includes('secure')) {
    return {
      type: 'insecure',
      title: 'HTTPS Connection Required',
      hint: 'Modern web browsers require a secure HTTPS connection or localhost to access camera devices.'
    };
  }

  // 5. General Fallback
  return {
    type: 'unknown',
    title: 'Unable to start camera feed',
    hint: err?.message || 'Please check that your webcam is plugged in, not used by another application, and permitted in browser settings.'
  };
}

export function stopCameraStream(stream: MediaStream | null): void {
  if (!stream) return;
  try {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  } catch (e) {
    console.warn('[Camera cleanup error]', e);
  }
}
