import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";

export const uploadImage = createServerFn({ method: 'POST' }).inputValidator((data) => {
    if (!(data instanceof FormData)) {
        throw new Error('Expected FormData')
    }
    if (!data.get('file')) {
        throw new Error('Expected file')
    }

    return {
        file: data.get('file') as File
    }
})
    .handler(async ({ data }) => {
        const file = data.file
        const key = `builds/${crypto.randomUUID()}-${file.name}`;

        // Upload to R2
        await env.IMAGES.put(key, file.stream(), {
            httpMetadata: { contentType: file.type },
        });

        // Return the public URL (you must enable Public Access on R2 bucket via dashboard)
        return { urls: [{ name: file.name, imgUrl: `https://pub-627e0371c000434aba5c2e7054d93bfe.r2.dev/${key}` }] };
    })