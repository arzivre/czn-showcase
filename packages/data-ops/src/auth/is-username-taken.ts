import { getDb } from "@/database/setup";
import { auth_user } from "@/drizzle/auth-schema";
import { eq } from "drizzle-orm";

type IsTakenFn = (username: string) => Promise<boolean>;

export const isUsernameTaken = async (u: string): Promise<boolean> => {
    const db = getDb();
    const result = await db
        .select({ id: auth_user.id })
        .from(auth_user)
        .where(eq(auth_user.username, u))
        .limit(1);

    return result.length > 0;
};

export async function generateUniqueUsername(
    preferred: string,
    isTaken: IsTakenFn
): Promise<string> {
    const base = normalizeUsername(preferred) || "user";

    // 1 First attempt: clean base username
    if (!(await isTaken(base))) {
        return base;
    }

    // 2 Try short random suffixes
    for (let i = 0; i < 5; i++) {
        const suffix = crypto.randomUUID()
        const candidate = `${base}_${suffix}`.slice(0, 24);

        if (!(await isTaken(candidate))) {
            return candidate;
        }
    }

    // 3 Guaranteed fallback (timestamp-based)
    return `user_${Date.now().toString(36)}`;
}

function normalizeUsername(input: string) {
    return input
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 20);
}
