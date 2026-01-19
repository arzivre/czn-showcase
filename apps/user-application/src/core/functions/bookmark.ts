import { toggleBookmark } from "@repo/data-ops/queries/bookmark-saved-data";
import z from "zod";
import { basePostFunction } from "./base";

const bookmarkSchema = z.object({
    savedDataId: z.string(),
})
type TDeleteSavedData = z.infer<typeof bookmarkSchema>

export const toogleBookmarkFn = basePostFunction
    .inputValidator((data: TDeleteSavedData) => bookmarkSchema.parse(data))
    .handler(async ({ context, data }) => {
        try {
            const res = await toggleBookmark(context.userId, data.savedDataId)
            return { success: true, message: res.action };
        } catch (error) {
            console.error(error)
            throw error
        }
    })