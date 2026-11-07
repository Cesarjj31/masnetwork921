CREATE TABLE "app_config" (
	"id" text PRIMARY KEY,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"id" text PRIMARY KEY,
	"count" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY,
	"expires_at" timestamp NOT NULL
);
