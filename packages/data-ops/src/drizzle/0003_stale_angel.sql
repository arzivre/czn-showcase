ALTER TABLE "czn_saved_data" RENAME COLUMN "imgUrl" TO "img_url";--> statement-breakpoint
DROP INDEX "czn_bookmarks_unique_user_saved";--> statement-breakpoint
ALTER TABLE "czn_saved_data" ADD COLUMN "bookmark_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE INDEX "czn_saved_data_updatedAt_idx" ON "czn_saved_data" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "czn_saved_data_userId_createdAt_idx" ON "czn_saved_data" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "czn_saved_data_userId_updatedAt_idx" ON "czn_saved_data" USING btree ("user_id","updated_at");