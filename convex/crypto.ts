/**
 * PBKDF2-SHA256 password hashing via Web Crypto API.
 * Works in Convex V8 isolate (queries / mutations) and in Node.js actions.
 *
 * Hash format: "pbkdf2:sha256:<iterations>:<saltHex>:<hashHex>"
 */

const ITER = 100_000;
const KEY_BITS = 256;

function hexEncode(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexDecode(hex: string): Uint8Array<ArrayBuffer> {
  const pairs = hex.match(/.{2}/g) ?? [];
  return new Uint8Array(pairs.map((h) => parseInt(h, 16))) as unknown as Uint8Array<ArrayBuffer>;
}

export async function hashPbkdf2(secret: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, hash: "SHA-256", iterations: ITER },
    key,
    KEY_BITS,
  );
  return `pbkdf2:sha256:${ITER}:${hexEncode(salt)}:${hexEncode(new Uint8Array(bits))}`;
}

export async function verifyPbkdf2(
  secret: string,
  hash: string,
): Promise<boolean> {
  const parts = hash.split(":");
  if (parts.length !== 5 || parts[0] !== "pbkdf2") return false;
  const [, , itersStr, saltHex, expectedHex] = parts;
  const iterations = parseInt(itersStr, 10);
  if (!iterations) return false;

  const enc = new TextEncoder();
  const salt = hexDecode(saltHex);
  const expected = hexDecode(expectedHex);

  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, hash: "SHA-256", iterations },
    key,
    expected.length * 8,
  );
  const actual = new Uint8Array(bits);

  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}
