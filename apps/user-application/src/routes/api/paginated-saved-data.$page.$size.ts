import { getPaginatedSavedDataWithBookmarks } from '@repo/data-ops/queries/czn-saved-data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/paginated-saved-data/$page/$size')({
  server: {
    handlers: {
      GET: async ({ request, params: { page, size } }) => {
        const url = new URL(request.url);
        const params = url.searchParams;
        const search = params.get('search') ?? ''
        const searchQuery = search.length === 0 ? undefined : search
        const paginatedData = await getPaginatedSavedDataWithBookmarks({ page: Number(page), limit: Number(size), searchQuery })
        return Response.json(paginatedData)
      }
    }
  }
})

