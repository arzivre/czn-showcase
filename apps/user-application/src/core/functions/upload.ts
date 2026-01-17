import { env } from "cloudflare:workers";
import { randomUUID } from "crypto";
import { basePostFunction } from "./base";

export const putImageToR2 = basePostFunction.inputValidator((data: unknown) => {
    if (!(data instanceof FormData)) {
        throw new Error('Expected FormData')
    }
    if (!(data.get('file'))) {
        throw new Error('Expected file')
    }

    return {
        file: data.get('file') as File
    }
}).handler(async ({ data }) => {
    try {

        const file = data.file
        const uniqueKey = `saved-data/${randomUUID()}-${file.name}`;
        await env.IMAGES.put(uniqueKey, file);

        return {
            uniqueKey: uniqueKey
        };

    } catch (error) {
        console.error(error)
        throw new Error('Upload file to R2 failed')
    }
})