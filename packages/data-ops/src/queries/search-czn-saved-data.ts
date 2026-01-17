// TODO: need to test there are lot condition
import { getDb } from "@/database/setup";
import { czn_bookmarks, czn_saved_data } from "@/drizzle/schema";
import { sql, count, eq, desc, asc, ilike, or } from "drizzle-orm";

// Search saved data by title with pagination and bookmark count
export async function searchSavedDataByTitle(params: {
    searchTerm: string;
    page?: number;
    limit?: number;
    userId?: string; // Optional: filter by user
    exactMatch?: boolean; // Optional: exact match vs partial match
    sortBy?: "created_at" | "updated_at" | "bookmark_count" | "relevance";
    sortOrder?: "asc" | "desc";
}) {
    const {
        searchTerm,
        page = 1,
        limit = 10,
        userId,
        exactMatch = false,
        sortBy = "relevance",
        sortOrder = "desc",
    } = params;
    const db = getDb();
    const offset = (page - 1) * limit;

    // Prepare search pattern
    const searchPattern = exactMatch ? searchTerm : `%${searchTerm}%`;

    // Subquery to count bookmarks for each saved data
    const bookmarkCounts = db.$with("bookmark_counts").as(
        db
            .select({
                savedDataId: czn_bookmarks.savedDataId,
                count: count().as("count"),
            })
            .from(czn_bookmarks)
            .groupBy(czn_bookmarks.savedDataId)
    );

    // Create the main query with CTE
    const withClause = db.with(bookmarkCounts);

    let query = withClause
        .select({
            id: czn_saved_data.id,
            userId: czn_saved_data.userId,
            title: czn_saved_data.title,
            descriptionHtml: czn_saved_data.descriptionHtml,
            combatant: czn_saved_data.combatant,
            imgUrl: czn_saved_data.imgUrl,
            createdAt: czn_saved_data.createdAt,
            updatedAt: czn_saved_data.updatedAt,
            bookmarkCount: sql<number>`COALESCE(${bookmarkCounts.count}, 0)`.as("bookmarkCount"),
            // Add relevance score for search ranking
            relevanceScore: sql<number>`
        CASE 
          WHEN ${czn_saved_data.title} ILIKE ${searchTerm} THEN 3
          WHEN ${czn_saved_data.title} ILIKE ${searchPattern} THEN 2
          WHEN ${czn_saved_data.combatant} ILIKE ${searchPattern} THEN 1
          ELSE 0
        END
      `.as("relevanceScore"),
        })
        .from(czn_saved_data)
        .leftJoin(bookmarkCounts, eq(czn_saved_data.id, bookmarkCounts.savedDataId))
        .where(
            or(
                ilike(czn_saved_data.title, searchPattern),
                ilike(czn_saved_data.combatant, searchPattern)
            )
        )
        .$dynamic();

    // Apply user filter if provided
    if (userId) {
        query = query.where(eq(czn_saved_data.userId, userId));
    }

    // Apply sorting
    if (sortBy === "relevance") {
        // Sort by relevance score first, then bookmark count or date
        if (sortOrder === "desc") {
            query = query.orderBy(
                desc(sql`relevanceScore`),
                desc(czn_saved_data.createdAt)
            );
        } else {
            query = query.orderBy(
                asc(sql`relevanceScore`),
                asc(czn_saved_data.createdAt)
            );
        }
    } else if (sortBy === "bookmark_count") {
        if (sortOrder === "desc") {
            query = query.orderBy(
                desc(sql`COALESCE(${bookmarkCounts.count}, 0)`),
                desc(czn_saved_data.createdAt)
            );
        } else {
            query = query.orderBy(
                asc(sql`COALESCE(${bookmarkCounts.count}, 0)`),
                asc(czn_saved_data.createdAt)
            );
        }
    } else if (sortBy === "updated_at") {
        if (sortOrder === "desc") {
            query = query.orderBy(desc(czn_saved_data.updatedAt));
        } else {
            query = query.orderBy(asc(czn_saved_data.updatedAt));
        }
    } else {
        // Default: sort by created_at
        if (sortOrder === "desc") {
            query = query.orderBy(desc(czn_saved_data.createdAt));
        } else {
            query = query.orderBy(asc(czn_saved_data.createdAt));
        }
    }

    // Apply pagination
    query = query.limit(limit).offset(offset);

    const results = await query;

    // Get total count for pagination metadata
    const countQuery = db
        .select({ count: count() })
        .from(czn_saved_data)

    if (userId) {
        countQuery.where(eq(czn_saved_data.userId, userId));
    } else {
        countQuery.where(
            or(
                ilike(czn_saved_data.title, searchPattern),
                ilike(czn_saved_data.combatant, searchPattern)
            )
        );
    }

    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
        data: results,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
        search: {
            term: searchTerm,
            exactMatch,
            totalResults: total,
        },
    };
}

// Alternative: Search with full-text search capabilities (PostgreSQL tsvector)
export async function searchSavedDataFullText(params: {
    searchTerm: string;
    page?: number;
    limit?: number;
    userId?: string;
}) {
    const {
        searchTerm,
        page = 1,
        limit = 10,
        userId,
    } = params;
    const db = getDb();
    const offset = (page - 1) * limit;

    // For full-text search, you'd need to create a tsvector column
    // This is an example if you had a tsvector column for title and description
    // First, let's use a simpler approach with ILIKE and to_tsvector

    const bookmarkCounts = db.$with("bookmark_counts").as(
        db
            .select({
                savedDataId: czn_bookmarks.savedDataId,
                count: count().as("count"),
            })
            .from(czn_bookmarks)
            .groupBy(czn_bookmarks.savedDataId)
    );

    const withClause = db.with(bookmarkCounts);

    // Using PostgreSQL full-text search functions
    const query = withClause
        .select({
            id: czn_saved_data.id,
            userId: czn_saved_data.userId,
            title: czn_saved_data.title,
            descriptionHtml: czn_saved_data.descriptionHtml,
            combatant: czn_saved_data.combatant,
            imgUrl: czn_saved_data.imgUrl,
            createdAt: czn_saved_data.createdAt,
            updatedAt: czn_saved_data.updatedAt,
            bookmarkCount: sql<number>`COALESCE(${bookmarkCounts.count}, 0)`,
            // Full-text search relevance
            relevance: sql<number>`
        ts_rank(
          to_tsvector('english', ${czn_saved_data.title} || ' ' || COALESCE(${czn_saved_data.descriptionHtml}, '')),
          plainto_tsquery('english', ${searchTerm})
        )
      `.as("relevance"),
        })
        .from(czn_saved_data)
        .leftJoin(bookmarkCounts, eq(czn_saved_data.id, bookmarkCounts.savedDataId))
        .where(
            sql`to_tsvector('english', ${czn_saved_data.title} || ' ' || COALESCE(${czn_saved_data.descriptionHtml}, '')) @@ plainto_tsquery('english', ${searchTerm})`
        )
        .$dynamic();

    if (userId) {
        query.where(eq(czn_saved_data.userId, userId));
    }

    query.orderBy(desc(sql`relevance`));
    query.limit(limit).offset(offset);

    const results = await query;

    // Get total count
    const countQuery = db
        .select({ count: count() })
        .from(czn_saved_data)


    if (userId) {
        countQuery.where(eq(czn_saved_data.userId, userId));
    } else {
        countQuery.where(
            sql`to_tsvector('english', ${czn_saved_data.title} || ' ' || COALESCE(${czn_saved_data.descriptionHtml}, '')) @@ plainto_tsquery('english', ${searchTerm})`
        );
    }

    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
        data: results,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

// Simple search function without CTE (easier for simple use cases)
export async function simpleSearchByTitle(params: {
    searchTerm: string;
    page?: number;
    limit?: number;
    userId?: string;
}) {
    const { searchTerm, page = 1, limit = 10, userId } = params;
    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;
    const db = getDb();
    // Create bookmark count subquery
    const bookmarkCountSubquery = db
        .select({
            savedDataId: czn_bookmarks.savedDataId,
            bookmarkCount: count().as("bookmarkCount"),
        })
        .from(czn_bookmarks)
        .groupBy(czn_bookmarks.savedDataId)
        .as("bookmark_counts");

    // Build main query
    let query = db
        .select({
            id: czn_saved_data.id,
            userId: czn_saved_data.userId,
            title: czn_saved_data.title,
            descriptionHtml: czn_saved_data.descriptionHtml,
            combatant: czn_saved_data.combatant,
            imgUrl: czn_saved_data.imgUrl,
            createdAt: czn_saved_data.createdAt,
            updatedAt: czn_saved_data.updatedAt,
            bookmarkCount: sql<number>`COALESCE(${bookmarkCountSubquery.bookmarkCount}, 0)`,
        })
        .from(czn_saved_data)
        .leftJoin(
            bookmarkCountSubquery,
            eq(czn_saved_data.id, bookmarkCountSubquery.savedDataId)
        ).$dynamic()


    // Apply user filter
    if (userId) {
        query = query.where(eq(czn_saved_data.userId, userId));
    } else {
        query = query.where(ilike(czn_saved_data.title, searchPattern));
    }

    // Apply sorting and pagination
    query = query
        .orderBy(desc(czn_saved_data.createdAt))
        .limit(limit)
        .offset(offset);

    const results = await query;

    // Get total count
    let countQuery = db
        .select({ count: count() })
        .from(czn_saved_data)
        .$dynamic()
        .where(ilike(czn_saved_data.title, searchPattern));

    if (userId) {
        countQuery = countQuery.where(eq(czn_saved_data.userId, userId));
    }

    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
        data: results,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

// Search with multiple fields (title, combatant, description)
export async function searchSavedDataMultiField(params: {
    searchTerm: string;
    searchFields?: ("title" | "combatant" | "description")[];
    page?: number;
    limit?: number;
    userId?: string;
}) {
    const {
        searchTerm,
        searchFields = ["title", "combatant"],
        page = 1,
        limit = 10,
        userId,
    } = params;
    const db = getDb();

    const offset = (page - 1) * limit;
    const searchPattern = `%${searchTerm}%`;

    // Build conditions based on selected fields
    const conditions = [];

    if (searchFields.includes("title")) {
        conditions.push(ilike(czn_saved_data.title, searchPattern));
    }

    if (searchFields.includes("combatant")) {
        conditions.push(ilike(czn_saved_data.combatant, searchPattern));
    }

    if (searchFields.includes("description")) {
        conditions.push(ilike(czn_saved_data.descriptionHtml, searchPattern));
    }

    // If no conditions, return empty
    if (conditions.length === 0) {
        return {
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
            },
        };
    }

    const bookmarkCounts = db.$with("bookmark_counts").as(
        db
            .select({
                savedDataId: czn_bookmarks.savedDataId,
                count: count().as("count"),
            })
            .from(czn_bookmarks)
            .groupBy(czn_bookmarks.savedDataId)
    );

    const withClause = db.with(bookmarkCounts);

    let query = withClause
        .select({
            id: czn_saved_data.id,
            userId: czn_saved_data.userId,
            title: czn_saved_data.title,
            descriptionHtml: czn_saved_data.descriptionHtml,
            combatant: czn_saved_data.combatant,
            imgUrl: czn_saved_data.imgUrl,
            createdAt: czn_saved_data.createdAt,
            updatedAt: czn_saved_data.updatedAt,
            bookmarkCount: sql<number>`COALESCE(${bookmarkCounts.count}, 0)`,
            // Calculate match type for ranking
            matchType: sql<string>`
        CASE 
          WHEN ${czn_saved_data.title} ILIKE ${searchTerm} THEN 'exact_title'
          WHEN ${czn_saved_data.title} ILIKE ${searchPattern} THEN 'partial_title'
          WHEN ${czn_saved_data.combatant} ILIKE ${searchPattern} THEN 'combatant'
          WHEN ${czn_saved_data.descriptionHtml} ILIKE ${searchPattern} THEN 'description'
          ELSE 'other'
        END
      `.as("matchType"),
        })
        .from(czn_saved_data)
        .leftJoin(bookmarkCounts, eq(czn_saved_data.id, bookmarkCounts.savedDataId))
        .where(or(...conditions))
        .$dynamic();

    if (userId) {
        query = query.where(eq(czn_saved_data.userId, userId));
    }

    // Order by match quality then date
    query = query
        .orderBy(
            sql`
        CASE matchType
          WHEN 'exact_title' THEN 1
          WHEN 'partial_title' THEN 2
          WHEN 'combatant' THEN 3
          WHEN 'description' THEN 4
          ELSE 5
        END
      `,
            desc(czn_saved_data.createdAt)
        )
        .limit(limit)
        .offset(offset);

    const results = await query;

    // Get total count
    const countQuery = db
        .select({ count: count() })
        .from(czn_saved_data)

    if (userId) {
        countQuery.where(eq(czn_saved_data.userId, userId));
    } else {
        countQuery.where(or(...conditions));
    }

    const totalResult = await countQuery;
    const total = totalResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / limit);

    return {
        data: results,
        pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        },
    };
}

// TypeScript types for the responses
export interface SearchResult {
    id: string;
    userId: string;
    title: string;
    descriptionHtml: string | null;
    combatant: string;
    imgUrl: string;
    createdAt: Date;
    updatedAt: Date;
    bookmarkCount: number;
    relevanceScore?: number;
    relevance?: number;
    matchType?: string;
}

export interface SearchResponse {
    data: SearchResult[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    search?: {
        term: string;
        exactMatch?: boolean;
        totalResults: number;
    };
}

// Example usage:
async function exampleUsage() {
    // Basic search
    const results1 = await searchSavedDataByTitle({
        searchTerm: "dragon",
        page: 1,
        limit: 10,
    });

    // Search with user filter and exact match
    const results2 = await searchSavedDataByTitle({
        searchTerm: "Red Dragon",
        userId: "user-123",
        exactMatch: true,
        sortBy: "bookmark_count",
    });

    // Multi-field search
    const results3 = await searchSavedDataMultiField({
        searchTerm: "fire",
        searchFields: ["title", "combatant", "description"],
        page: 1,
        limit: 20,
    });

    console.log(results1.data[0]?.title); // "Ancient Dragon"
    console.log(results1.data[0]?.bookmarkCount); // 42
}