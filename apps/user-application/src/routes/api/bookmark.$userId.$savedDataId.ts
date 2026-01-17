import { protectedRequestMiddleware } from '@/core/middleware/auth'
import { toggleBookmark } from '@repo/data-ops/queries/bookmark-saved-data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/bookmark/$userId/$savedDataId')({
    server: {
        middleware:[protectedRequestMiddleware],
        handlers: {
            PUT: async ({ params: { userId, savedDataId } }) => {
                const res = await toggleBookmark(userId, savedDataId)
                return Response.json(res)
            }
        }
    }
})