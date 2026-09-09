import jwt from "jsonwebtoken";

export type Role = "admin" | "protester";

export interface TokenPayload {
  id: string;
  role: Role;
  email: string;
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET!, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "15m",
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}
