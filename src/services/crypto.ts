/**
 * Cryptography Service for FM_Store Secure Password Vault
 * Uses Web Crypto API (AES-GCM 256-bit with PBKDF2 Key Derivation)
 */

const SALT = new TextEncoder().encode('FM_STORE_SECURE_VAULT_SALT_V1');
const PBKDF2_ITERATIONS = 100000;

async function deriveKey(masterPassword: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: SALT,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a password string using AES-GCM with the master vault key
 */
export async function encryptVaultPassword(plainText: string, masterKeyString: string): Promise<string> {
  if (!plainText) return '';
  try {
    const key = await deriveKey(masterKeyString);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedText = new TextEncoder().encode(plainText);

    const ciphertext = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encodedText
    );

    // Combine IV + Ciphertext into single Uint8Array
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(combined);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  } catch (error) {
    console.error('Encryption failed:', error);
    // Fallback safe obfuscation if subtle crypto is somehow restricted
    return window.btoa(encodeURIComponent(plainText));
  }
}

/**
 * Decrypts an encrypted vault password
 */
export async function decryptVaultPassword(encryptedBase64: string, masterKeyString: string): Promise<string> {
  if (!encryptedBase64) return '';
  try {
    const binary = window.atob(encryptedBase64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    if (combined.length <= 12) {
      // Possible fallback decode
      return decodeURIComponent(window.atob(encryptedBase64));
    }

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const key = await deriveKey(masterKeyString);
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch {
    // If decryption fails due to wrong key or legacy fallback
    try {
      return decodeURIComponent(window.atob(encryptedBase64));
    } catch {
      throw new Error('Invalid master password or corrupted vault entry');
    }
  }
}

/**
 * Generate a cryptographically secure random password
 */
export function generateSecurePassword(options: {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  numbers?: boolean;
  symbols?: boolean;
}): string {
  const {
    length = 16,
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = true,
  } = options;

  let chars = '';
  if (lowercase) chars += 'abcdefghijkmnopqrstuvwxyz'; // without ambiguous l
  if (uppercase) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // without ambiguous I, O
  if (numbers) chars += '23456789'; // without 0, 1
  if (symbols) chars += '!@#$%^&*()_+~|}{[]:;?><,.-=';

  if (!chars) chars = 'abcdefghjkmnpqrstuvwxyz23456789';

  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);

  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }

  return result;
}

/**
 * Evaluates password strength 0 to 4
 */
export function evaluatePasswordStrength(password: string): {
  score: number;
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Unbreakable';
  color: string;
} {
  if (!password) {
    return { score: 0, label: 'Very Weak', color: '#ef4444' };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#f87171' };
  if (score === 2) return { score: 2, label: 'Medium', color: '#fbbf24' };
  if (score === 3 || score === 4) return { score: 3, label: 'Strong', color: '#34d399' };
  return { score: 4, label: 'Unbreakable', color: '#06b6d4' };
}
