import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mask Phone Number for PII Privacy
 * Example: 9876543210 -> 987****210
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return 'N/A';
  const clean = phone.trim();
  if (clean.length < 10) return clean;
  return `${clean.slice(0, 3)}****${clean.slice(-3)}`;
}

/**
 * Canonical 10-digit phone normalization for Indian mobile numbers
 * Example: +919876543210 -> 9876543210, 09876543210 -> 9876543210
 */
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Generate unique server-generated participant ID in format TKFK26-XXXXXX
 * Uses cryptographically secure random number generation.
 * Example: TKFK26-004821 or TKFK26-784920
 */
export function generateParticipantId(): string {
  const randomNumeric = crypto.randomInt(100000, 1000000).toString();
  return `TKFK26-${randomNumeric}`;
}

/**
 * Generate random unique certificate verification code (decoupled from participant ID)
 */
export function generateCertificateCode(_participantId?: string): string {
  const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `TKFK26-CERT-${randomHex}`;
}

/**
 * Generate genuine SHA-256 cryptographic verification hash for certificates
 */
export function generateVerificationHash(participantId: string, name: string): string {
  const payload = `${participantId}:${name}:TKFK2026_CERT_VERIFICATION`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex').toUpperCase();
  return `SHA256-${hash.slice(0, 24)}`;
}

/**
 * Format timestamp to human readable date string
 */
export function formatDate(isoString?: string): string {
  if (!isoString) return 'N/A';
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Server Webhook Cryptographic HMAC-SHA256 Signature Verification
 * Uses native crypto module with timing-safe string comparison.
 * Strictly rejects arbitrary strings, secret string matching, or length-only checks.
 */
export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret || !payload) return false;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    const sigBuffer = Buffer.from(signature.trim());
    const expectedBuffer = Buffer.from(expectedSignature.trim());

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

/**
 * Safe clipboard copy helper with try/catch and fallback prompt handling
 */
export async function copyToClipboard(text: string): Promise<{ success: boolean; message: string }> {
  if (!text) return { success: false, message: 'Nothing to copy' };
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return { success: true, message: 'Copied to clipboard!' };
    } else if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        return { success: true, message: 'Copied to clipboard!' };
      }
      return { success: false, message: 'Unable to copy automatically. Please copy manually.' };
    }
    return { success: false, message: 'Clipboard unavailable in current environment.' };
  } catch (err) {
    return { success: false, message: 'Clipboard access denied or unsupported. Please copy manually.' };
  }
}
