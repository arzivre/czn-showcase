import { ASSETS_URL } from '@/constants/assets-url';
import { getPaginatedSavedDataWithBookmarks } from '@repo/data-ops/queries/czn-saved-data';
import { getUserData } from '@repo/data-ops/queries/user';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { FaHeart } from 'react-icons/fa6';
import {
  getPageArray,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from '@/lib/utils';

export const userDetailssQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ['user-details', userId],
    queryFn: () => fetch(`/api/user-details/${userId}`)
      .then((res) => res.json() as ReturnType<typeof getUserData>)
  })

export const userSavedDatasQueryOptions = (userId: string, page: string, size: string) =>
  queryOptions({
    queryKey: ['user-saved-data', userId, page, size],
    queryFn: () => fetch(`/api/protected/user-saved-data/${page}/${size}`)
      .then((res) => res.json() as ReturnType<typeof getPaginatedSavedDataWithBookmarks>)
  })

export const Route = createFileRoute('/user/$userId/$page/$size')({
  loader: async ({ context, params: { userId, page, size } }) => {
    const user = await context.queryClient.ensureQueryData(userDetailssQueryOptions(userId))
    const data = await context.queryClient.ensureQueryData(userSavedDatasQueryOptions(userId, page, size))
    if (!user || !data) throw notFound()
    return user;
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const { userId, page, size } = Route.useParams()

  const { data: savedDataQuery } = useSuspenseQuery(userSavedDatasQueryOptions(userId, page, size))
  const { totalPages, hasPrevPage, hasNextPage } = savedDataQuery.pagination

  return (
    <main>
      <section className="relative mx-auto min-h-screen px-6 lg:px-8 py-24 sm:py-32">
        <h1 className='py-8 text-primary text-2xl'>
          {data.displayUsername} Saved Data
        </h1>
        <ul className="grid grid-cols-5 gap-4 mb-8">
          {savedDataQuery.savedData.map(saved => (
            <li key={saved.id} className="border rounded shadow">
              <Link
                to="/saved-data/$id"
                params={{
                  id: String(saved.id),
                }}>
                <img alt={saved.title} src={`${ASSETS_URL}/${saved.imgUrl}`}
                  className="aspect-video object-cover w-full" />
                <div className="flex items-center gap-1 p-2">
                  <p className="flex items-center gap-1 text-rose-400">
                    <FaHeart className="" /> {saved.bookmarkCount}
                  </p>
                  <p className="text-left p-1 line-clamp-1">
                    {saved.title}
                  </p>
                </div>
              </Link>
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
                    isActive={savedDataQuery.pagination.page === Number(arr)}>
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
