ALTER TABLE "czn_saved_data" ADD COLUMN "description_text" text;--> statement-breakpoint
ALTER TABLE "czn_saved_data" ADD COLUMN "search_vector" text;--> statement-breakpoint
CREATE INDEX "czn_saved_data_bookmarkCount_idx" ON "czn_saved_data" USING btree ("bookmark_count");--> statement-breakpoint
CREATE INDEX "czn_saved_data_search_vector_idx" ON "czn_saved_data" USING gin (to_tsvector('english', COALESCE("title", '') || ' ' || COALESCE("description_text", '') || ' ' || COALESCE("combatant", '')));