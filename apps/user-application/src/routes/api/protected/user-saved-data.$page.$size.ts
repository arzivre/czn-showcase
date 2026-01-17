import { protectedRequestMiddleware } from '@/core/middleware/auth'
import { getPaginatedSavedDataWithBookmarks } from '@repo/data-ops/queries/czn-saved-data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/protected/user-saved-data/$page/$size')({
  server: {
    middleware: [protectedRequestMiddleware],
    handlers: {
      GET: async ({ context, params: { page, size } }) => {
        const paginatedData = await getPaginatedSavedDataWithBookmarks({ userId: context.userId, page: Number(page), limit: Number(size), })
        return Response.json(paginatedData)
      }
    }
  }
})
