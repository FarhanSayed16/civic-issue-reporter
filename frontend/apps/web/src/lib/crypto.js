// AES-GCM crypto utilities aligned with backend/static script.js
import { getEncryptionKey, getAADString } from './key_manager';

let ENCRYPTION_KEY_B64 = getEncryptionKey(); // Use obfuscated key
let AAD_STRING = getAADString(); // Use obfuscated AAD
const CLIENT_KEY_FALLBACK = 'set-a-strong-shared-key-here';

export function setEncryptionConfig({ key_b64, aad } = {}) {
  if (key_b64) ENCRYPTION_KEY_B64 = key_b64;
  if (aad) AAD_STRING = aad;
}

export async function loadEncryptionConfig(apiBase) {
  try {
    const res = await fetch(`${apiBase}/encryption/config`);
    if (res.ok) {
      const cfg = await res.json();
      setEncryptionConfig(cfg);
    }
  } catch (_) {
    // ignore
  }
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function sha256Bytes(data) {
  const hash = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hash);
}

async function getCryptoKey() {
  const keyBytes = ENCRYPTION_KEY_B64
    ? base64ToBytes(ENCRYPTION_KEY_B64)
    : await sha256Bytes(new TextEncoder().encode(CLIENT_KEY_FALLBACK));
  if (keyBytes.length !== 32) throw new Error('Encryption key must be 32 bytes');
  return crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function encryptJson(jsonObj) {
  const key = await getCryptoKey();
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(jsonObj));
  const aad = new TextEncoder().encode(AAD_STRING);
  const ciphertextBuf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, additionalData: aad }, key, plaintext);
  const ciphertext = new Uint8Array(ciphertextBuf);
  return { nonce: bytesToBase64(nonce), ciphertext: bytesToBase64(ciphertext) };
}

export function packPasswordB64(nonceB64, ciphertextB64) {
  const nonce = base64ToBytes(nonceB64);
  const cipher = base64ToBytes(ciphertextB64);
  const packed = new Uint8Array(nonce.length + cipher.length);
  packed.set(nonce, 0);
  packed.set(cipher, nonce.length);
  return bytesToBase64(packed);
}


