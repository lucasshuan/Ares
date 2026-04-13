CREATE TYPE "public"."game_status" AS ENUM('approved', 'pending');--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "status" "game_status" DEFAULT 'approved' NOT NULL;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "author_id" text;--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "games_author_id_idx" ON "games" USING btree ("author_id");
