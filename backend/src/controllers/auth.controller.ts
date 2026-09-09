import { Request, Response } from "express";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { admins, protesters } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { uploadBufferToCloudinary } from "../middleware/upload.js";
import { verifyGoogleIdToken } from "../utils/google.js";

const protesterSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  address: z.string().min(5),
  city: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
});

const adminSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  organization: z.string().min(2).optional(),
});

// In production the frontend and backend usually live on different domains
// (e.g. Vercel + Render), so the refresh cookie needs `sameSite: "none"` to
// be sent cross-site — which in turn requires `secure: true` (HTTPS only).
// Locally both run on localhost, so "lax" + non-secure keeps dev simple.
const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// ---------- PROTESTER ----------
export async function registerProtester(req: Request, res: Response) {
  const parsed = protesterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
  }
  const { name, email, password, address, city, phone } = parsed.data;

  const existing = await db.query.protesters.findFirst({ where: eq(protesters.email, email) });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  let photoUrl: string | undefined;
  if (req.file) {
    photoUrl = await uploadBufferToCloudinary(req.file.buffer, "bookmyprotest/protesters");
  }

  const { hash, salt } = hashPassword(password);
  const [created] = await db
    .insert(protesters)
    .values({ name, email, address, city, phone, photoUrl, passwordHash: hash, passwordSalt: salt })
    .returning({ id: protesters.id, name: protesters.name, email: protesters.email, photoUrl: protesters.photoUrl });

  const payload = { id: created.id, role: "protester" as const, email: created.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, cookieOpts);

  res.status(201).json({ success: true, data: { user: created, accessToken } });
}

export async function loginProtester(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await db.query.protesters.findFirst({ where: eq(protesters.email, email) });
  if (!user || !user.passwordHash || !user.passwordSalt || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return res.status(401).json({ success: false, message: "Invalid credentials — this account may use Google sign-in" });
  }
  const payload = { id: user.id, role: "protester" as const, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, cookieOpts);
  res.json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl }, accessToken },
  });
}

// Google Identity Services sends us a signed ID token from the frontend;
// we verify it server-side and never trust a client-supplied email/name.
const googleTokenSchema = z.object({ idToken: z.string().min(10) });

export async function googleAuthProtester(req: Request, res: Response) {
  const parsed = googleTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Missing Google idToken" });
  }

  let profile;
  try {
    profile = await verifyGoogleIdToken(parsed.data.idToken);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }

  let user = await db.query.protesters.findFirst({ where: eq(protesters.googleId, profile.googleId) });

  if (!user) {
    // Same email might already exist from a manual signup — link the accounts
    // instead of creating a duplicate row (email has a unique index).
    const existingByEmail = await db.query.protesters.findFirst({ where: eq(protesters.email, profile.email) });
    if (existingByEmail) {
      [user] = await db
        .update(protesters)
        .set({ googleId: profile.googleId, photoUrl: existingByEmail.photoUrl || profile.photoUrl })
        .where(eq(protesters.id, existingByEmail.id))
        .returning();
    } else {
      [user] = await db
        .insert(protesters)
        .values({ name: profile.name, email: profile.email, googleId: profile.googleId, photoUrl: profile.photoUrl })
        .returning();
    }
  }

  const payload = { id: user.id, role: "protester" as const, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, cookieOpts);
  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, photoUrl: user.photoUrl },
      accessToken,
      // Lets the frontend nudge the user to fill in address/city once, since
      // Google sign-ups skip the manual registration form entirely.
      profileIncomplete: !user.address,
    },
  });
}

// ---------- ADMIN ----------
export async function registerAdmin(req: Request, res: Response) {
  const parsed = adminSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
  }
  const { name, email, password, organization } = parsed.data;

  const existing = await db.query.admins.findFirst({ where: eq(admins.email, email) });
  if (existing) {
    return res.status(409).json({ success: false, message: "Email already registered" });
  }

  const { hash, salt } = hashPassword(password);
  const [created] = await db
    .insert(admins)
    .values({ name, email, organization, passwordHash: hash, passwordSalt: salt })
    .returning({ id: admins.id, name: admins.name, email: admins.email, organization: admins.organization });

  const payload = { id: created.id, role: "admin" as const, email: created.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, cookieOpts);

  res.status(201).json({ success: true, data: { user: created, accessToken } });
}

export async function loginAdmin(req: Request, res: Response) {
  const { email, password } = req.body as { email: string; password: string };
  const user = await db.query.admins.findFirst({ where: eq(admins.email, email) });
  if (!user || !user.passwordHash || !user.passwordSalt || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return res.status(401).json({ success: false, message: "Invalid credentials — this account may use Google sign-in" });
  }
  const payload = { id: user.id, role: "admin" as const, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, cookieOpts);
  res.json({
    success: true,
    data: { user: { id: user.id, name: user.name, email: user.email, organization: user.organization }, accessToken },
  });
}

export async function googleAuthAdmin(req: Request, res: Response) {
  const parsed = googleTokenSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Missing Google idToken" });
  }

  let profile;
  try {
    profile = await verifyGoogleIdToken(parsed.data.idToken);
  } catch {
    return res.status(401).json({ success: false, message: "Invalid Google token" });
  }

  let user = await db.query.admins.findFirst({ where: eq(admins.googleId, profile.googleId) });

  if (!user) {
    const existingByEmail = await db.query.admins.findFirst({ where: eq(admins.email, profile.email) });
    if (existingByEmail) {
      [user] = await db
        .update(admins)
        .set({ googleId: profile.googleId, photoUrl: existingByEmail.photoUrl || profile.photoUrl })
        .where(eq(admins.id, existingByEmail.id))
        .returning();
    } else {
      [user] = await db
        .insert(admins)
        .values({ name: profile.name, email: profile.email, googleId: profile.googleId, photoUrl: profile.photoUrl })
        .returning();
    }
  }

  const payload = { id: user.id, role: "admin" as const, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  res.cookie("refreshToken", refreshToken, cookieOpts);
  res.json({
    success: true,
    data: {
      user: { id: user.id, name: user.name, email: user.email, organization: user.organization },
      accessToken,
    },
  });
}

// ---------- SHARED ----------
export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ success: false, message: "No refresh token" });
  try {
    const payload = verifyRefreshToken(token);
    const accessToken = signAccessToken({ id: payload.id, role: payload.role, email: payload.email });
    res.json({ success: true, data: { accessToken } });
  } catch {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie("refreshToken", cookieOpts);
  res.json({ success: true, message: "Logged out" });
}
