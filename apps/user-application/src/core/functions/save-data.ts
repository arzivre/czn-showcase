import { postsavedDataSchema, updatesavedDataSchema } from "@/zod/saved-data-schema";
import { createId } from "@paralleldrive/cuid2";
import { deleteSavedDataQuery, postSavedDataQuery, updateSavedDataQuery } from "@repo/data-ops/queries/czn-saved-data";
import { env } from "cloudflare:workers";
import { czn_saved_data } from "node_modules/@repo/data-ops/dist/drizzle";
import sanitizeHtml from 'sanitize-html';
import z from "zod";
import { basePostFunction } from "./base";

export type TAddSavedData = Omit<typeof czn_saved_data.$inferInsert, 'id' | 'userId'>
export const addSavedData = basePostFunction
    .inputValidator((data: TAddSavedData) => postsavedDataSchema.parse(data))
    .handler(async ({ context, data }) => {
        try {
            const now = new Date()
            const payload = {
                id: createId(),
                userId: context.userId,
                title: data.title,
                descriptionHtml: sanitizeHtml(data.descriptionHtml ?? ""),
                descriptionText: data.descriptionText ?? "",
                combatant: data.combatant,
                imgUrl: data.imgUrl,
                createdAt: now,
                updatedAt: now
            }
            const savedData = await postSavedDataQuery(payload)
            return { success: true, message: `success`, return: savedData };
        } catch (error) {
            console.error(error)
        }
    })

export type TUpdateSavedData = Omit<typeof czn_saved_data.$inferInsert, 'userId'> & { deleteKey?: string }
export const updateSavedData = basePostFunction
    .inputValidator((data: TUpdateSavedData) => updatesavedDataSchema.parse(data))
    .handler(async ({ data }) => {
        try {
            if (data.deleteKey) {
                await env.IMAGES.delete(data.deleteKey);
            }

            const now = new Date()
            const payload = {
                title: data.title,
                descriptionHtml: sanitizeHtml(data.descriptionHtml ?? ""),
                descriptionText: data.descriptionText ?? "",
                combatant: data.combatant,
                imgUrl: data.imgUrl,
                updatedAt: now
            }

            const savedData = await updateSavedDataQuery(data.id, payload)
            return { success: true, message: `success`, return: savedData };
        } catch (error) {
            console.error(error)
            return { success: false, message: 'request failed' };
        }
    })

const deleteSavedDataSchema = z.object({
    id: z.string(),
    imageKey: z.string(),
})
type TDeleteSavedData = z.infer<typeof deleteSavedDataSchema>

export const deleteSavedData = basePostFunction
    .inputValidator((data: TDeleteSavedData) => deleteSavedDataSchema.parse(data))
    .handler(async ({ context, data }) => {
        try {
            await env.IMAGES.delete(data.imageKey);
            const deleted = await deleteSavedDataQuery(data.id, context.userId)
            return { success: true, message: `${deleted?.title} deleted` };
        } catch (error) {
            console.error(error)
            return { success: false, message: 'request failed' };
        }
    })