import { getDb } from "@/database/setup";
import { neon } from "@neondatabase/serverless";
import { and, asc, count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { czn_bookmarks, czn_saved_data } from "../drizzle/schema";

const connectionString = `postgres://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}`;

// When adding a bookmark
async function addBookmark(userId: string, savedDataId: string) {
    const sql = neon(connectionString);

    await sql.transaction([
        // Insert bookmark
        sql`
            INSERT INTO czn_bookmarks (user_id, saved_data_id)
            VALUES (${userId}, ${savedDataId})
        `,

        // Increment count
        sql`
            UPDATE czn_saved_data
            SET bookmark_count = bookmark_count + 1
            WHERE id = ${savedDataId}
        `
    ]);
}

// When removing a bookmark
async function removeBookmark(userId: string, savedDataId: string) {
    const sql = neon(connectionString);

    await sql.transaction([
        // Delete bookmark
        sql`
            DELETE FROM czn_bookmarks
            WHERE user_id = ${userId}
            AND saved_data_id = ${savedDataId}
        `,

        // Decrement count
        sql`
            UPDATE czn_saved_data
            SET bookmark_count = bookmark_count - 1
            WHERE id = ${savedDataId}
        `
    ]);
}

export const getUserBookmarks = async (userId: string) => {
    const db = getDb()
    const bookmarks = await db.query.czn_bookmarks.findMany({
        where: eq(czn_bookmarks.userId, userId),
        orderBy: (bookmarks, { desc }) => [desc(bookmarks.createdAt)],
        // Join the actual data so you can display the cards
        with: {
            savedData: true,
        },
    });

    return bookmarks;
};

export const getIsBookmarked = async (userId: string, savedDataId: string) => {
    const db = getDb()
    const bookmark = await db.query.czn_bookmarks.findFirst({
        where: and(
            eq(czn_bookmarks.userId, userId),
            eq(czn_bookmarks.savedDataId, savedDataId)
        ),
    });

    return !!bookmark; // Returns true if exists, false otherwise
};

export const toggleBookmark = async (userId: string, savedDataId: string) => {
    // Check if it exists first
    const db = getDb()
    const existing = await db.query.czn_bookmarks.findFirst({
        where: and(
            eq(czn_bookmarks.userId, userId),
            eq(czn_bookmarks.savedDataId, savedDataId)
        ),
    });
    console.log(existing)

    if (existing) {
        await removeBookmark(userId, savedDataId);
        return { action: "removed" };
    } else {
        await addBookmark(userId, savedDataId);
        return { action: "added" };
    }
};

export async function getUserBookmarkedData(params: {
    userId: string;
    page: number;
    limit: number;
    searchQuery?: string;
    sortBy?: "created_at" | "updated_at" | "bookmark_count" | "bookmarked_at" | "relevance"; // ✅ Added relevance
    sortOrder?: "asc" | "desc";
}) {
    const db = getDb();
    const {
        userId,
        page,
        limit,
        searchQuery,
        sortBy = "bookmarked_at",
        sortOrder = "desc"
    } = params;
    const offset = (page - 1) * limit;

    let query = db
        .select({
            ...getTableColumns(czn_saved_data),
            bookmarkedAt: czn_bookmarks.createdAt,
            // Add relevance rank when searching
            ...(searchQuery ? {
                rank: sql<number>`ts_rank(
                    to_tsvector('english', 
                        COALESCE(${czn_saved_data.title}, '') || ' ' || 
                        COALESCE(${czn_saved_data.descriptionText}, '') || ' ' || 
                        COALESCE(${czn_saved_data.combatant}, '')
                    ),
                    plainto_tsquery('english', ${searchQuery})
                )`.as('rank')
            } : {})
        })
        .from(czn_bookmarks)
        .innerJoin(
            czn_saved_data,
            eq(czn_bookmarks.savedDataId, czn_saved_data.id)
        )
        .where(eq(czn_bookmarks.userId, userId))
        .$dynamic();

    // Apply search filter
    if (searchQuery) {
        query = query.where(
            sql`to_tsvector('english', 
                COALESCE(${czn_saved_data.title}, '') || ' ' || 
                COALESCE(${czn_saved_data.descriptionText}, '') || ' ' || 
                COALESCE(${czn_saved_data.combatant}, '')
            ) @@ plainto_tsquery('english', ${searchQuery})`
        );
    }

    // Apply sorting
    let sortExpression;
    if (searchQuery && sortBy === "relevance") {
        sortExpression = desc(sql`ts_rank(
            to_tsvector('english', 
                COALESCE(${czn_saved_data.title}, '') || ' ' || 
                COALESCE(${czn_saved_data.descriptionText}, '') || ' ' || 
                COALESCE(${czn_saved_data.combatant}, '')
            ),
            plainto_tsquery('english', ${searchQuery})
        )`);
    } else if (sortBy === "bookmarked_at") {
        sortExpression = sortOrder === "desc"
            ? desc(czn_bookmarks.createdAt)
            : asc(czn_bookmarks.createdAt);
    } else if (sortBy === "bookmark_count") {
        sortExpression = sortOrder === "desc"
            ? desc(czn_saved_data.bookmarkCount)
            : asc(czn_saved_data.bookmarkCount);
    } else if (sortBy === "updated_at") {
        sortExpression = sortOrder === "desc"
            ? desc(czn_saved_data.updatedAt)
            : asc(czn_saved_data.updatedAt);
    } else {
        sortExpression = sortOrder === "desc"
            ? desc(czn_saved_data.createdAt)
            : asc(czn_saved_data.createdAt);
    }

    query = query.orderBy(sortExpression).limit(limit).offset(offset);

    const results = await query;

    // Get total count with search
    let countQuery = db
        .select({ count: count() })
        .from(czn_bookmarks)
        .innerJoin(
            czn_saved_data,
            eq(czn_bookmarks.savedDataId, czn_saved_data.id)
        )
        .where(eq(czn_bookmarks.userId, userId))
        .$dynamic();

    if (searchQuery) {
        countQuery = countQuery.where(
            sql`to_tsvector('english', 
                COALESCE(${czn_saved_data.title}, '') || ' ' || 
                COALESCE(${czn_saved_data.descriptionText}, '') || ' ' || 
                COALESCE(${czn_saved_data.combatant}, '')
            ) @@ plainto_tsquery('english', ${searchQuery})`
        );
    }

    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
        bookmarkedData: results,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        searchQuery,
    };
}