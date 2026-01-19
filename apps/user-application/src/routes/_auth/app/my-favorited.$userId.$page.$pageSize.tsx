import { ListSavedData } from "@/components/contents/list-saved-data"
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
import { protectedRequestMiddleware } from '@/core/middleware/auth'
import { cn } from '@/lib/utils'
import { getUserBookmarkedData } from '@repo/data-ops/queries/bookmark-saved-data'
import { keepPreviousData, queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const userFavoritedDatasQueryOptions = (userId: string, page: string, pageSize: string) =>
    queryOptions({
        queryKey: ['my-favorited-data-details', userId, page, pageSize],
        queryFn: () => fetch(`/api/protected/user-favorited/${page}/${pageSize}`)
            .then((res) => res.json() as ReturnType<typeof getUserBookmarkedData>),
        placeholderData: keepPreviousData,
    })

export const Route = createFileRoute('/_auth/app/my-favorited/$userId/$page/$pageSize')({
    server: {
        middleware: [protectedRequestMiddleware],
    },
    loader: async ({ context, params: { userId, page, pageSize } }) => {
        await context.queryClient.ensureQueryData(userFavoritedDatasQueryOptions(userId, page, pageSize))
    },
    component: RouteComponent,
})

function RouteComponent() {
    const { userId, page, pageSize } = Route.useParams()
    const { data: dataQuery } = useSuspenseQuery(userFavoritedDatasQueryOptions(userId, page, pageSize))
    const { totalPages, hasPrevPage, hasNextPage } = dataQuery.pagination

    return (
        <main className="mx-auto w-full relative px-4 lg:px-8 py-24 sm:py-32">
            <section>
                <h1 className='py-8 text-primary text-2xl'>
                    My Favorited Saved Data
                </h1>
                {dataQuery.pagination.total === 0 ?
                    <p>
                        You haven't favorited any saved data.
                    </p>
                    : null}
                <ListSavedData savedData={dataQuery.bookmarkedData} />
                <Pagination>
                    <PaginationContent>
                        <PaginationItem >
                            <PaginationPrevious to={'/'}
                                search={{ page: dataQuery.pagination.page - 1, pageSize: 10 }}
                                preload={hasPrevPage ? 'intent' : false}
                                disabled={!hasPrevPage}
                                className={cn(hasPrevPage ? 'cursor-pointer' : 'cursor-not-allowed')} />
                        </PaginationItem>
                        {getPageArray(dataQuery.pagination.page, totalPages, 5).map((arr) => {
                            if (arr === '...') {
                                return (<PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>)
                            }
                            return (
                                <PaginationItem key={arr}>
                                    <PaginationLink to={'/'}
                                        search={{ page: Number(arr), pageSize: 10 }}
                                        isActive={dataQuery.pagination.page === arr}>
                                        {arr}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        })}
                        <PaginationItem>
                            <PaginationNext to={'/'}
                                search={{ page: dataQuery.pagination.page + 1, pageSize: 10 }}
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