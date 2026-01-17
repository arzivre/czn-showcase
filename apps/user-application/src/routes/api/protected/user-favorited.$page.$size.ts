import { protectedRequestMiddleware } from '@/core/middleware/auth'
import { getUserBookmarkedData } from '@repo/data-ops/queries/bookmark-saved-data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/protected/user-favorited/$page/$size')({
    server: {
        middleware: [protectedRequestMiddleware],
        handlers: {
            GET: async ({ context, params: { page, size } }) => {
                const paginatedData = await getUserBookmarkedData({ userId: context.userId, page: Number(page), limit: Number(size), })
                return Response.json(paginatedData)
            }
        }
    }
},)
