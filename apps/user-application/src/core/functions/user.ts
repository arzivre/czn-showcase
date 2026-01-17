import { updateDisplayUsernameSchema } from "@/zod/auth-user";
import { updateUserDisplayUsername } from "@repo/data-ops/queries/user";
import z from "zod";
import { basePostFunction } from "./base";

export type TUpdateUserDisplayName = z.infer<typeof updateDisplayUsernameSchema>
export const updateUserDisplayName = basePostFunction.inputValidator((data: TUpdateUserDisplayName) => {
    const result = updateDisplayUsernameSchema.safeParse(data);
    if (!result.success) {
        throw new Error(result.error.message);
    } else {
        return data
    }
}).handler(async ({ context, data }) => {
    try {
        const update = await updateUserDisplayUsername(context.userId, data.displayUsername)
        return { success: true, message: `success`, return: update };
    } catch (error) {
        console.error(error)
    }
})