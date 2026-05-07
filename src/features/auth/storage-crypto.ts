import type { AuthSession } from './auth-context'

const IV_BYTES = 12
const SALT_BYTES = 16
const KEY_LENGTH = 256
const PBKDF2_ITERATIONS = 120000

function utf8ToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value)
}

function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes)
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i] ?? 0)
  }
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

function getSecretMaterial(): string {
  const envSecret = import.meta.env.VITE_AUTH_STORAGE_SECRET
  if (typeof envSecret === 'string' && envSecret.trim().length > 0) {
    return envSecret.trim()
  }

  // Fallback intentionally ties ciphertext to this app origin.
  return `${window.location.origin}::ada-is-akademi-auth-storage`
}

async function deriveKey(salt: Uint8Array): Promise<CryptoKey> {
  const secret = utf8ToBytes(getSecretMaterial())
  const material = await crypto.subtle.importKey(
    'raw',
    toArrayBuffer(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
    },
    material,
    { name: 'AES-GCM', length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function encryptAuthSession(session: AuthSession): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES))
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES))
  const key = await deriveKey(salt)
  const payload = utf8ToBytes(JSON.stringify(session))

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(payload),
  )
  const encrypted = new Uint8Array(encryptedBuffer)

  return [toBase64(salt), toBase64(iv), toBase64(encrypted)].join('.')
}

export async function decryptAuthSession(ciphertext: string): Promise<AuthSession | null> {
  try {
    const [saltB64, ivB64, payloadB64] = ciphertext.split('.')
    if (!saltB64 || !ivB64 || !payloadB64) return null

    const salt = fromBase64(saltB64)
    const iv = fromBase64(ivB64)
    const payload = fromBase64(payloadB64)
    const key = await deriveKey(salt)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: toArrayBuffer(iv) },
      key,
      toArrayBuffer(payload),
    )

    return JSON.parse(bytesToUtf8(new Uint8Array(decrypted))) as AuthSession
  } catch {
    return null
  }
}
