import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  photoUrl?: string;
}

/**
 * Verifies the ID token the frontend gets from Google Identity Services
 * (@react-oauth/google's `credential`). Throws if the token is invalid,
 * expired, or wasn't issued for our GOOGLE_CLIENT_ID.
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleProfile> {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not configured on the server");
  }
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email || !payload.sub) {
    throw new Error("Invalid Google token payload");
  }
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    photoUrl: payload.picture,
  };
}
