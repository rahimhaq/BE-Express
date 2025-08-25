// src/utils/jwt.ts
import { sign, verify, type Secret, type SignOptions, type JwtPayload } from "jsonwebtoken";

// pastikan .env punya JWT_SECRET
const JWT_SECRET: Secret = (process.env.JWT_SECRET || "dev_secret_change_me") as Secret;

/**
 * Buat JWT.
 * - Gunakan expiresIn numerik (detik) agar aman ke tipe v9.
 * - Kamu bisa override lewat opts (mis. { expiresIn: 300 } = 5 menit).
 */
export function signJwt(payload: object, opts: SignOptions = {}): string {
  const options: SignOptions = {
    expiresIn: 60 * 60, // 1 jam (dalam detik) → numerik biar tidak bentrok tipe
    ...opts,
  };
  return sign(payload, JWT_SECRET, options);
}

/**
 * Verifikasi JWT dan kembalikan payload bertipe JwtPayload (bisa kamu cast ke tipe kamu).
 */
export function verifyJwt<T extends JwtPayload = JwtPayload>(token: string): T {
  return verify(token, JWT_SECRET) as T;
}
