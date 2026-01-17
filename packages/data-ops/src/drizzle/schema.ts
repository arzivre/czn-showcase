import { index, pgTable, primaryKey, text, timestamp, integer } from "drizzle-orm/pg-core";
import { auth_user } from "./auth-schema";
import { sql } from "drizzle-orm";

export const czn_saved_data = pgTable(
    "czn_saved_data",
    {
        id: text("id").primaryKey(), // Consider uuid() type
        userId: text("user_id")
            .notNull()
            .references(() => auth_user.id, { onDelete: "cascade" }),
        title: text('title').notNull(),
        descriptionHtml: text('description_html'),
        descriptionText: text('description_text'),
        combatant: text('combatant').notNull(),
        imgUrl: text('img_url').notNull(),
        bookmarkCount: integer("bookmark_count").default(0).notNull(),
        searchVector: text("search_vector"),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow()
            .$onUpdate(() => new Date())
            .notNull(),
    },
    (table) => [
        // Single column indexes
        index("czn_saved_data_userId_idx").on(table.userId),
        index("czn_saved_data_createdAt_idx").on(table.createdAt),
        index("czn_saved_data_updatedAt_idx").on(table.updatedAt),
        // Composite indexes for common query patterns
        index("czn_saved_data_bookmarkCount_idx").on(table.bookmarkCount),
        index("czn_saved_data_userId_createdAt_idx").on(table.userId, table.createdAt),
        index("czn_saved_data_userId_updatedAt_idx").on(table.userId, table.updatedAt),
        // GIN index for full-text search
        index("czn_saved_data_search_vector_idx").using(
            'gin',
            sql`to_tsvector('english', COALESCE(${table.title}, '') || ' ' || COALESCE(${table.descriptionText}, '') || ' ' || COALESCE(${table.combatant}, ''))`
        ),
    ],
);

export const czn_bookmarks = pgTable(
    "czn_bookmarks",
    {
        userId: text("user_id")
            .notNull()
            .references(() => auth_user.id, { onDelete: "cascade" }),
        savedDataId: text("saved_data_id")
            .notNull()
            .references(() => czn_saved_data.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => [
        primaryKey({ columns: [table.userId, table.savedDataId] }),
        index("czn_bookmarks_userId_idx").on(table.userId),
        index("czn_bookmarks_savedDataId_idx").on(table.savedDataId),
    ],
);