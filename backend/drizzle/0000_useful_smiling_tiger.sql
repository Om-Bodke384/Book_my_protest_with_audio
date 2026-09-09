DO $$ BEGIN
 CREATE TYPE "public"."protest_status" AS ENUM('upcoming', 'ongoing', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"organization" varchar(160),
	"password_hash" varchar(255),
	"password_salt" varchar(255),
	"google_id" varchar(255),
	"photo_url" text,
	"is_verified" varchar(5) DEFAULT 'false',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "participations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"protest_id" uuid NOT NULL,
	"protester_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "protesters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"city" varchar(100),
	"photo_url" text,
	"password_hash" varchar(255),
	"password_salt" varchar(255),
	"google_id" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "protests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"admin_id" uuid NOT NULL,
	"title" varchar(180) NOT NULL,
	"cause" varchar(120) NOT NULL,
	"description" text NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"scheduled_at" timestamp NOT NULL,
	"status" "protest_status" DEFAULT 'upcoming' NOT NULL,
	"banner_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participations" ADD CONSTRAINT "participations_protest_id_protests_id_fk" FOREIGN KEY ("protest_id") REFERENCES "public"."protests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "participations" ADD CONSTRAINT "participations_protester_id_protesters_id_fk" FOREIGN KEY ("protester_id") REFERENCES "public"."protesters"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "protests" ADD CONSTRAINT "protests_admin_id_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admins"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admins_email_idx" ON "admins" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "admins_google_id_idx" ON "admins" USING btree ("google_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "participation_unique_idx" ON "participations" USING btree ("protest_id","protester_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "protesters_email_idx" ON "protesters" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "protesters_google_id_idx" ON "protesters" USING btree ("google_id");