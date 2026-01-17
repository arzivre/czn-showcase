import { getUserData } from '@repo/data-ops/queries/user'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/user-details/$userId')({
  server: {
    handlers: {
      GET: async ({ params: { userId } }) => {
        const savedData = await getUserData(userId)
        return Response.json(savedData)
      }
    }
  }
})
