export type Role = "admin" | "protester";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string | null;
  organization?: string | null;
}

export interface Protest {
  id: string;
  title: string;
  cause: string;
  description: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  scheduledAt: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  bannerUrl?: string | null;
  organizerName?: string;
  organizerOrg?: string | null;
  joinedCount: number;
}
