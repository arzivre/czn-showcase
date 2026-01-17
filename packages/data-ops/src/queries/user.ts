import { getDb } from "@/database/setup";
import { auth_user } from "@/drizzle";
import { eq } from "drizzle-orm";

//* READ ==============================
export async function getUserData(userId: string) {
    const db = getDb();
    const rows = await db
        .select()
        .from(auth_user)
        .where(eq(auth_user.id, userId))
        .limit(1);

    return rows[0] ?? null;
}

//* Write ==============================
export async function updateUserDisplayUsername(userId: string, displayUsername: string) {
    const db = getDb();
    const [updated] = await db
        .update(auth_user)
        .set({
            displayUsername: displayUsername,
            updatedAt: new Date(),
        })
        .where(eq(auth_user.id, userId))
        .returning({ insertedId: auth_user.id })
    return updated;
}