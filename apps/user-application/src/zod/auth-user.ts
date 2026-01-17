import z from "zod";

export const updateDisplayUsernameSchema = z.object({
    displayUsername: z.string().min(5, 'title must be at least 5 characters.')
})
