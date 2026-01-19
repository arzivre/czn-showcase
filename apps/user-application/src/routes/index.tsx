import { Input } from "@/components/ui/input";
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
import { ASSETS_URL } from "@/constants/assets-url";
import { cn } from "@/lib/utils";
import { getPaginatedSavedDataWithBookmarks } from "@repo/data-ops/queries/czn-saved-data";
import { useAsyncDebouncer } from '@tanstack/react-pacer/async-debouncer';
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Image } from "@unpic/react";
import React from "react";
import { FaHeart } from "react-icons/fa6";
import z from "zod";

const paginationSearchSchema = z.object({
  page: z.number(),
  pageSize: z.number(),
})

export const savedDatasQueryOptions = (page = 1, pageSize = 10, search = '') =>
  queryOptions({
    queryKey: ['saved-data', page, pageSize, search],
    queryFn: () => fetch(`/api/paginated-saved-data/${page}/${pageSize}?search=${search}`)
      .then((res) => res.json() as ReturnType<typeof getPaginatedSavedDataWithBookmarks>),
  })

export const Route = createFileRoute("/")({
  validateSearch: (search) => {
    return {
      page: search.page ? Number(search.page) : 1,
      pageSize: search.pageSize ? Number(search.pageSize) : 10,
    }
  },
  beforeLoad: async ({ search }) => {
    return search;
  },
  loader: async ({ context, location: { search } }) => {
    const { page, pageSize } = paginationSearchSchema.parse(search)
    await context.queryClient.ensureQueryData(savedDatasQueryOptions(page, pageSize))
  },
  component: LandingPage,
});

function LandingPage() {
  const { page, pageSize } = Route.useSearch();

  const [searchTerm, setSearchTerm] = React.useState('')
  const [debouncedSearchText, setDebouncedSearchText] = React.useState('')

  const savedDataQuery = useSuspenseQuery(savedDatasQueryOptions(page, pageSize, debouncedSearchText))
  const { totalPages, hasPrevPage, hasNextPage } = savedDataQuery.data.pagination

  const handleSearch = async (term: string) => {
    if (!term) {
      return
    }
    setDebouncedSearchText(term)
  }

  const asyncDebouncer = useAsyncDebouncer(
    handleSearch,
    {
      wait: 500,
      onError: (error) => {
        console.error('Search failed:', error)
      },
      asyncRetryerOptions: {
        maxAttempts: 3,
        maxExecutionTime: 1000,
      },
    },
  )

  const handleSearchDebounced = asyncDebouncer.maybeExecute

  async function onSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTerm = e.target.value
    setSearchTerm(newTerm)
    await handleSearchDebounced(newTerm)
  }

  return (
    <main>
      <section className="mx-auto min-h-screen relative px-6 lg:px-8 py-24 sm:py-32">
        <h1 className="mb-4 text-2xl">Most Recent Saved Data</h1>
        <Input autoFocus
          name="search"
          type="search"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Type to search..."
          className="mb-8 rounded"
        />
        <ul className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {savedDataQuery.data.savedData.map(saved => (
            <li key={saved.id} className="border rounded shadow overflow-hidden hover:border-primary">
              <Link
                to="/saved-data/$id"
                params={{
                  id: String(saved.id),
                }}
                preloadDelay={600}
              >
                <Image
                  alt={saved.title}
                  src={`${ASSETS_URL}/${saved.imgUrl}`}
                  layout="constrained"
                  width={467.2}
                  height={262.8}
                  className="aspect-video object-cover w-full"
                />
                <div className="grid grid-cols-[1fr_auto] items-center justify-end p-2 border-t">
                  <p className="text-left line-clamp-1">
                    {saved.title}
                  </p>
                  <p className="flex items-center gap-1 text-rose-400">
                    <FaHeart className="" /> {saved.bookmarkCount}
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
                search={{ page: page - 1, pageSize: 10 }}
                preload={hasPrevPage ? 'intent' : false}
                disabled={!hasPrevPage}
                className={cn(hasPrevPage ? 'cursor-pointer' : 'cursor-not-allowed')} />
            </PaginationItem>
            {getPageArray(page, totalPages, 5).map((arr) => {
              if (arr === '...') {
                return (<PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>)
              }
              return (
                <PaginationItem key={arr}>
                  <PaginationLink to={'/'}
                    search={{ page: Number(arr), pageSize: 10 }}
                    isActive={page === arr}>
                    {arr}
                  </PaginationLink>
                </PaginationItem>
              )
            })}
            <PaginationItem>
              <PaginationNext to={'/'}
                search={{ page: page + 1, pageSize: 10 }}
                preload={hasNextPage ? 'intent' : false}
                disabled={!hasNextPage}
                className={cn(hasNextPage ? 'cursor-pointer' : 'cursor-not-allowed')} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </section>
    </main>
  );
}
