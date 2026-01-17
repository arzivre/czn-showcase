import { getAuth } from '@repo/data-ops/auth/server'
import { getIsBookmarked } from '@repo/data-ops/queries/bookmark-saved-data'
import { getSavedDataQuerie } from '@repo/data-ops/queries/czn-saved-data'
import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'
import sanitizeHtml from 'sanitize-html'

export const Route = createFileRoute('/api/saved-data/$id')({
  server: {
    handlers: {
      GET: async ({ params: { id }, request }) => {
        let isBookmarked = false
        const auth = getAuth();
        const session = await auth.api.getSession({
          headers: request.headers
        })
        if (session) {
          isBookmarked = await getIsBookmarked(session.user.id, id)
        }
        const savedData = await getSavedDataQuerie(id)
        return json({ ...savedData, descriptionHtml: sanitizeHtml(savedData?.descriptionHtml ?? ''), isBookmarked })
      }
    }
  }
})
