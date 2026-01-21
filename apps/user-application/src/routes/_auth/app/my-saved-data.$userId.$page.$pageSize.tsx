import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getPageArray,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ASSETS_URL } from '@/constants/assets-url'
import { deleteSavedData } from "@/core/functions/save-data"
import { protectedRequestMiddleware } from '@/core/middleware/auth'
import { cn } from '@/lib/utils'
import { getPaginatedSavedDataWithBookmarks } from '@repo/data-ops/queries/czn-saved-data'
import { keepPreviousData, queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Share2 } from "lucide-react"
import { FaHeart } from 'react-icons/fa6'
import { toast } from "sonner"

export const userSavedDatasQueryOptions = (userId: string, page: string, pageSize: string) =>
  queryOptions({
    queryKey: ['my-saved-data', userId, page, pageSize],
    queryFn: () => fetch(`/api/user-saved-data/${userId}/${page}/${pageSize}`)
      .then((res) => res.json() as ReturnType<typeof getPaginatedSavedDataWithBookmarks>),
    placeholderData: keepPreviousData,
  })

export const Route = createFileRoute('/_auth/app/my-saved-data/$userId/$page/$pageSize')({
  server: {
    middleware: [protectedRequestMiddleware],
  },
  loader: async ({ context, params: { userId, page, pageSize } }) => {
    await context.queryClient.ensureQueryData(userSavedDatasQueryOptions(userId, page, pageSize))
  },
  component: RouteComponent,
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const { userId, page, pageSize } = Route.useParams()
  const { data: savedDataQuery } = useSuspenseQuery(userSavedDatasQueryOptions(userId, page, pageSize))
  const { totalPages, hasPrevPage, hasNextPage } = savedDataQuery.pagination

  const deleteSavedDataMutation = useMutation({
    mutationFn: async ({ id, imageKey }: { id: string; imageKey: string }) => {
      return await deleteSavedData({ data: { id, imageKey } })
    },
    onSettled: (value) => {
      context.queryClient.invalidateQueries({ queryKey: ['my-saved-data', userId, page, pageSize] })
      toast.success(`${value?.message}`)
    },
  })

  async function handleShare(title: string, text: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error in sharing:', err);
      }
    } else {
      alert('Web Share API is not supported in this browser. You can copy the link manually.');
    }
  };

  return (
    <main className="mx-auto w-full relative px-4 lg:px-8 py-24 sm:py-32">
      <section>
        <h1 className='py-8 text-primary text-2xl'>
          My Saved Data
        </h1>
        <ul className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-12 mb-8">
          {savedDataQuery?.savedData.map(saved => (
            <li key={saved.id} className="group border rounded shadow">
              <Link
                to="/saved-data/$id"
                params={{
                  id: String(saved.id),
                }}
                preloadDelay={600}
              >
                <img alt={saved.title} src={`${ASSETS_URL}/${saved.imgUrl}`}
                  className="aspect-video object-cover w-full" />
                  
                <div className="flex items-center justify-between p-2">
                  <p className="text-left line-clamp-1 text-muted-foreground group-hover:text-secondary">
                    {saved.title}
                  </p>
                </div>
              </Link>

              <div className="flex items-center justify-between p-2 border-t">
                <div className="flex items-center space-x-4">
                  <Link to="/app/edit/$id" params={{ id: saved.id }}>
                    <Button type="button" variant={'outline'}>Edit</Button>
                  </Link>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant={'destructive'}
                      >
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Delete saved data</DialogTitle>
                        <DialogDescription>
                          Are you sure to delete <span className="text-primary">"{saved.title}"</span>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            className="rounded"
                          >
                            Cancel
                          </Button>
                        </DialogClose>
                        <Button
                          type="button"
                          variant={'destructive'}
                          className="rounded"
                          onClick={() => deleteSavedDataMutation.mutate({ id: saved.id, imageKey: saved.imgUrl })}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="flex items-center gap-1 text-rose-400">
                    <FaHeart className="" /> {saved.bookmarkCount}
                  </p>
                  <button type="button" onClick={() => handleShare(saved.title, `${saved.combatant} saved data`)} className="text-muted-foreground hover:text-white">
                    <Share2 />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Pagination>
          <PaginationContent>
            <PaginationItem >
              <PaginationPrevious to={'/'}
                search={{ page: savedDataQuery.pagination.page - 1, pageSize: 10 }}
                preload={hasPrevPage ? 'intent' : false}
                disabled={!hasPrevPage}
                className={cn(hasPrevPage ? 'cursor-pointer' : 'cursor-not-allowed')} />
            </PaginationItem>
            {getPageArray(savedDataQuery.pagination.page, totalPages, 5).map((arr) => {
              if (arr === '...') {
                return (<PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>)
              }
              return (
                <PaginationItem key={arr}>
                  <PaginationLink to={'/'}
                    search={{ page: Number(arr), pageSize: 10 }}
                    isActive={savedDataQuery.pagination.page === arr}>
                    {arr}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext to={'/'}
                search={{ page: savedDataQuery.pagination.page + 1, pageSize: 10 }}
                preload={hasNextPage ? 'intent' : false}
                disabled={!hasNextPage}
                className={cn(hasNextPage ? 'cursor-pointer' : 'cursor-not-allowed')} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </main>
  )
}
