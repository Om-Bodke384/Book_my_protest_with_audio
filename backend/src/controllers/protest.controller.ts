import { Request, Response } from "express";
import { z } from "zod";
import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { protests, participations, admins } from "../db/schema.js";
import { uploadBufferToCloudinary } from "../middleware/upload.js";

const protestSchema = z.object({
  title: z.string().min(4).max(180),
  cause: z.string().min(2).max(120),
  description: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  scheduledAt: z.coerce.date(),
});

// Admin creates a protest event pinned to a map location.
export async function createProtest(req: Request, res: Response) {
  const parsed = protestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
  }
  const data = parsed.data;

  let bannerUrl: string | undefined;
  if (req.file) {
    bannerUrl = await uploadBufferToCloudinary(req.file.buffer, "bookmyprotest/protests");
  }

  const [created] = await db
    .insert(protests)
    .values({ ...data, adminId: req.user!.id, bannerUrl })
    .returning();

  res.status(201).json({ success: true, data: created });
}

// Public: every protest pin, for the home-page map. Includes live join counts.
export async function listProtests(req: Request, res: Response) {
  const { city, status } = req.query as { city?: string; status?: string };

  const rows = await db
    .select({
      id: protests.id,
      title: protests.title,
      cause: protests.cause,
      description: protests.description,
      address: protests.address,
      city: protests.city,
      latitude: protests.latitude,
      longitude: protests.longitude,
      scheduledAt: protests.scheduledAt,
      status: protests.status,
      bannerUrl: protests.bannerUrl,
      organizerName: admins.name,
      organizerOrg: admins.organization,
      joinedCount: sql<number>`count(${participations.id})::int`,
    })
    .from(protests)
    .leftJoin(admins, eq(protests.adminId, admins.id))
    .leftJoin(participations, eq(participations.protestId, protests.id))
    .where(
      and(
        city ? eq(protests.city, city) : sql`true`,
        status ? eq(protests.status, status as any) : sql`true`
      )
    )
    .groupBy(protests.id, admins.name, admins.organization)
    .orderBy(protests.scheduledAt);

  res.json({ success: true, data: rows });
}

export async function getProtest(req: Request, res: Response) {
  const { id } = req.params;
  const protest = await db.query.protests.findFirst({
    where: eq(protests.id, id),
    with: { admin: { columns: { id: true, name: true, organization: true, email: true } } },
  });
  if (!protest) return res.status(404).json({ success: false, message: "Protest not found" });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(participations)
    .where(eq(participations.protestId, id));

  res.json({ success: true, data: { ...protest, joinedCount: count } });
}

// Admin: protests they personally organize (their dashboard).
export async function myProtests(req: Request, res: Response) {
  const rows = await db.query.protests.findMany({
    where: eq(protests.adminId, req.user!.id),
    orderBy: (p, { desc }) => desc(p.scheduledAt),
  });
  res.json({ success: true, data: rows });
}

export async function updateProtestStatus(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body as { status: string };
  const protest = await db.query.protests.findFirst({ where: eq(protests.id, id) });
  if (!protest) return res.status(404).json({ success: false, message: "Protest not found" });
  if (protest.adminId !== req.user!.id) {
    return res.status(403).json({ success: false, message: "Not your protest" });
  }
  const [updated] = await db
    .update(protests)
    .set({ status: status as any })
    .where(eq(protests.id, id))
    .returning();
  res.json({ success: true, data: updated });
}

// Protester connects with the admin/event by joining — this is what shows
// them as attending on the map popup and lets the admin see who's coming.
export async function joinProtest(req: Request, res: Response) {
  const { id } = req.params;
  const protest = await db.query.protests.findFirst({ where: eq(protests.id, id) });
  if (!protest) return res.status(404).json({ success: false, message: "Protest not found" });

  try {
    await db.insert(participations).values({ protestId: id, protesterId: req.user!.id });
  } catch {
    return res.status(409).json({ success: false, message: "Already joined" });
  }
  res.status(201).json({ success: true, message: "Joined protest" });
}

export async function leaveProtest(req: Request, res: Response) {
  const { id } = req.params;
  await db
    .delete(participations)
    .where(and(eq(participations.protestId, id), eq(participations.protesterId, req.user!.id)));
  res.json({ success: true, message: "Left protest" });
}
