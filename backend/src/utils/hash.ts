import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

// NOTE: passwordSalt/passwordHash columns are varchar(255) — never char(255).
// char() right-pads with spaces which silently corrupts hex comparisons.

export function hashPassword(plain: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, 64).toString("hex");
  return { hash, salt };
}

export function verifyPassword(
  plain: string,
  storedHash: string,
  storedSalt: string
): boolean {
  const attemptHash = scryptSync(plain, storedSalt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (attemptHash.length !== storedBuffer.length) return false;
  return timingSafeEqual(attemptHash, storedBuffer);
}
