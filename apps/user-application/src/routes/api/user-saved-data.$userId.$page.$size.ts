import { getPaginatedSavedDataWithBookmarks } from '@repo/data-ops/queries/czn-saved-data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/user-saved-data/$userId/$page/$size')({
  server: {
    handlers: {
      GET: async ({ params: { userId, page, size } }) => {
        const paginatedData = await getPaginatedSavedDataWithBookmarks({ page: Number(page), limit: Number(size), userId: userId })
        return Response.json(paginatedData)
      }
    }
  }
})
