ALTER TABLE "users" ADD COLUMN "demo_form_seeded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "is_demo" boolean DEFAULT false NOT NULL;
