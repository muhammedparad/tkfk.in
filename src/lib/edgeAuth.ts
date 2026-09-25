export interface AdminSessionPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
  nonce: string;
}

function getAdminSessionSecret(): string {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('[CRITICAL SECURITY ERROR] ADMIN_SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is required!');
    }
    return 'dev_fallback_admin_hmac_secret_9981';
  }
  return secret;
}

function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function computeHmacSignatureEdge(payloadBase64: string): Promise<string> {
  const secret = getAdminSessionSecret();
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(payloadBase64);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function verifyAdminSessionTokenEdge(token: string | null | undefined): Promise<AdminSessionPayload | null> {
  if (!token || !token.includes('.')) return null;

  const [payloadBase64, signature] = token.split('.');
  if (!payloadBase64 || !signature) return null;

  try {
    const expectedSignature = await computeHmacSignatureEdge(payloadBase64);

    if (!timingSafeEqualStr(signature, expectedSignature)) {
      return null;
    }

    const payload: AdminSessionPayload = JSON.parse(fromBase64Url(payloadBase64));
    if (!payload.userId || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
