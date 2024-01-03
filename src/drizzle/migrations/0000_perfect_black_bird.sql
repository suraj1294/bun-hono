CREATE TABLE IF NOT EXISTS "pg_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"password" varchar NOT NULL,
	"full_name" text NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pg_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "pg_users" ("email");