import { getDb } from "@/database/setup";
import { auth_user } from "@/drizzle/auth-schema";
import { czn_bookmarks, czn_saved_data } from "@/drizzle/schema";
import { and, asc, count, desc, eq, getTableColumns, sql } from "drizzle-orm";

export type TSavedData = typeof czn_saved_data.$inferInsert;

type TReturnInsertedSavedData = {
    insertedId: NonNullable<(typeof czn_saved_data.$inferSelect)['userId']>;
}[];

//* Write saved data ==============================
export async function postSavedDataQuery(data: TSavedData): Promise<TReturnInsertedSavedData> {
    const db = getDb();
    return await db
        .insert(czn_saved_data)
        .values(data)
        .returning({ insertedId: czn_saved_data.id })
}

export async function updateSavedDataQuery(
    id: string,
    updates: Partial<TSavedData>
) {
    const db = getDb();
    const [updated] = await db
        .update(czn_saved_data)
        .set({
            ...updates,
            updatedAt: new Date(),
        })
        .where(eq(czn_saved_data.id, id))
        .returning({ insertedId: czn_saved_data.id })
    return updated;
}

//! DELETE ==============================
export async function deleteSavedDataQuery(id: string, userId: string) {
    const db = getDb();
    const [deleted] = await db
        .delete(czn_saved_data)
        .where(and(eq(czn_saved_data.id, id), eq(czn_saved_data.userId, userId)))
        .returning();
    return deleted;
}

export async function deleteAllSavedDataByUserQuery(userId: string) {
    const db = getDb();
    return await db
        .delete(czn_saved_data)
        .where(eq(czn_saved_data.userId, userId));
}

//* READ ==============================
export async function getSavedDataQuerie(id: string) {
    const db = getDb();
    const rows = await db
        .select({
            ...getTableColumns(czn_saved_data),
            displayUsername: auth_user.displayUsername,
        })
        .from(czn_saved_data)
        .leftJoin(
            auth_user,
            eq(czn_saved_data.userId, auth_user.id)
        )
        .where(eq(czn_saved_data.id, id))
        .limit(1);

    return rows[0] ?? null;
}

//* Query to get paginated saved data with bookmark count
export async function getPaginatedSavedDataWithBookmarks(params: {
    page: number;
    limit: number;
    userId?: string;
    searchQuery?: string;
    sortBy?: "created_at" | "updated_at" | "bookmark_count" | "relevance";
    sortOrder?: "asc" | "desc";
}) {
    const db = getDb();
    const {
        page,
        limit,
        userId,
        searchQuery,
        sortBy = "created_at",
        sortOrder = "desc"
    } = params;
    const offset = (page - 1) * limit;

    let query = db
        .select({
            ...getTableColumns(czn_saved_data),
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
        .from(czn_saved_data)
        .$dynamic();

    // Apply user filter
    if (userId) {
        query = query.where(eq(czn_saved_data.userId, userId));
    }

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
        // Sort by search relevance when searching
        sortExpression = desc(sql`ts_rank(
            to_tsvector('english', 
                COALESCE(${czn_saved_data.title}, '') || ' ' || 
                COALESCE(${czn_saved_data.descriptionText}, '') || ' ' || 
                COALESCE(${czn_saved_data.combatant}, '')
            ),
            plainto_tsquery('english', ${searchQuery})
        )`);
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

    // Get total count with search filter
    let countQuery = db
        .select({ count: count() })
        .from(czn_saved_data)
        .$dynamic();

    if (userId) {
        countQuery = countQuery.where(eq(czn_saved_data.userId, userId));
    }

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
        savedData: results,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        searchQuery, // Return search query for UI
    };
}