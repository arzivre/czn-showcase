import { COMBATANS_ENUMS } from '@/constants/combatants';
import z from 'zod';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const savedDataFormSchema = z.object({
    title: z
        .string()
        .min(5, "title must be at least 5 characters.")
        .max(256, "title must be at most 256 characters."),
    descriptionHtml: z
        .string()
        .min(2, "Description is required")
        .max(10000, "Description reach characters limit."),
    descriptionText: z
        .string(),
    combatant: z.enum(COMBATANS_ENUMS, { error: "Invalid combatant name. Choose from the available combatants list." }),
    file: z
        .instanceof(File, { message: 'A saved data image is required' })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: `The max file size is 5MB.`,
        })
        .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
            message: 'Only .jpg, .jpeg, .png and .webp formats are supported.',
        }),
})

export const postsavedDataSchema = z.object({
    title: z
        .string()
        .min(5, "title must be at least 5 characters.")
        .max(256, "title must be at most 256 characters."),
    descriptionHtml: z
        .string()
        .min(2, "Description is required")
        .max(10000, "Description reach characters limit.")
        .optional(),
    descriptionText: z
        .string()
        .min(2),
    combatant: z.enum(COMBATANS_ENUMS, { error: "Invalid combatant name. Choose from the available combatants list." }),
    imgUrl: z.string().min(2, 'image is required'),
    bookmarkCount: z.number().default(0)
})

export const updatesavedDataSchema = z.object({
    id: z.string(),
    title: z
        .string()
        .min(5, "title must be at least 5 characters.")
        .max(256, "title must be at most 256 characters."),
    descriptionHtml: z
        .string()
        .max(10000, "Description reach characters limit."),
    descriptionText: z
        .string(),
    combatant: z.enum(COMBATANS_ENUMS, { error: "Invalid combatant name. Choose from the available combatants list." }),
    imgUrl: z.string().optional(),
    deleteKey: z.string().optional(),
    file: z.union([
        z.instanceof(File)
            .refine((file) => file.size <= MAX_FILE_SIZE, {
                message: `The max file size is 5MB.`,
            })
            .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
                message: 'Only .jpg, .jpeg, .png and .webp formats are supported.',
            }),
        z.undefined()
    ]),
})

export type TSavedDataForm = z.infer<typeof savedDataFormSchema>;
export type TSavedDataValue = z.infer<typeof postsavedDataSchema>;
export type TUpdateSavedDataValue = z.infer<typeof updatesavedDataSchema>;