import { NotFound } from '@/components/not-found';
import { ASSETS_URL } from '@/constants/assets-url';
import { toogleBookmarkFn } from '@/core/functions/bookmark';
import { authClient } from '@/lib/auth-client';
import { unslugify } from '@/utils/unslugify';
import { queryOptions, useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link, notFound } from '@tanstack/react-router';
import { Image } from "@unpic/react";
import { Heart, Share2, UserCircle } from 'lucide-react';
import { FaHeart } from 'react-icons/fa6';
import { toast } from 'sonner';

type SavedDataDetail = Promise<{
  displayUsername: string | null;
  id: string;
  userId: string;
  title: string;
  descriptionHtml: string | null;
  combatant: string;
  imgUrl: string;
  bookmarkCount: number;
  createdAt: Date;
  updatedAt: Date;
  isBookmarked: boolean
} | null>

function getSavedData(id: string) {
  return fetch(`/api/saved-data/${id}`).then((res) => res.json() as SavedDataDetail)
}

export const savedDatasQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['saved-data-detail', id],
    queryFn: () => getSavedData(id),
  })

export const Route = createFileRoute('/saved-data/$id')({
  loader: async ({ context, params: { id } }) => {
    const data = await context.queryClient.ensureQueryData(savedDatasQueryOptions(id))
    if (!data) throw notFound()
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  component: RouteComponent,
  notFoundComponent: () => {
    return <NotFound />
  },
})

function RouteComponent() {
  const { id } = Route.useParams()
  const navigate = Route.useNavigate()
  const { data: savedData, refetch } = useSuspenseQuery(savedDatasQueryOptions(id))

  const { data: session } = authClient.useSession()
  const user = session?.user!

  const { mutate: updateBookmark, isPending } = useMutation({
    mutationFn: async (savedDataId: string) => await toogleBookmarkFn({ data: { savedDataId } }),
    onMutate: () => toast('Loading Request'),
    onSuccess: () => {
      refetch()
      toast('Favorite Updated')
    },
  })

  async function handleBookmark() {
    if (!user) return navigate({ to: '/login' })
    if (savedData?.userId === user.id) return toast.info('You cant bookmark your saved data')
    updateBookmark(savedData?.id!)
  }

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
    <div className='container mx-auto w-full max-w-7xl py-24 sm:py-32 px-6 lg:px-8'>
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold  tracking-tight mb-3">
            {savedData?.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-slate-400">
            <div className="flex items-center gap-2">
              <UserCircle />
              <span className="font-medium text-muted-foreground">{savedData?.displayUsername}</span>
            </div>
            <span className="hidden md:inline text-slate-700">•</span>
            <div className='text-muted-foreground'>
              📅  {new Date(savedData?.createdAt as Date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
            <span className="hidden md:inline text-slate-700">•</span>
            <div className="bg-slate-800 px-2 py-0.5 rounded text-xs border border-slate-700">
              COMBATANT: <span className="text-amber-400 font-bold">
                {unslugify(savedData?.combatant!)}
              </span>
            </div>
          </div>
        </div>
        <div className='flex gap-3 text-muted-foreground'>
          <button type="button"
            onClick={handleBookmark}
            className='group cursor-pointer hover:underline'
          >
            {savedData?.isBookmarked ?
              <p className='flex items-center'>
                <FaHeart className='w-4 h-4 mr-1 text-rose-500' />
                {isPending ? 'Loading' : 'Favorite'}
              </p>
              :
              <p className='flex items-center'>
                <Heart className={'w-4 h-4 mr-1 group-hover:text-rose-500'} />
                {isPending ? 'Loading' : 'Favorite'}
              </p>
            }
          </button>
          <button type="button"
            onClick={() => handleShare(savedData?.title!, `${savedData?.combatant} saved data`)}
            className='cursor-pointer'
          >
            <p
              className="flex items-center gap-1 hover:underline">
              <Share2 className='w-4 h-4' />
              Share</p>
          </button>
        </div>
      </section>

      <main >
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-amber-500 to-purple-600 rounded lg:rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative rounded lg:rounded-2xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800">
            <Image
              alt={savedData?.title}
              src={`${ASSETS_URL}/${savedData?.imgUrl}`}
              layout='fullWidth'
            />
          </div>
        </div>
      </main>

      <section className='flex flex-col py-8 lg:flex-row'>
        <div className='flex flex-col space-y-2 lg:w-1/3'>
          <h2 className='pb-4 text-xl'>Details</h2>
          <div className='grid grid-cols-2 text-muted-foreground'>
            <p>Author:</p>
            <Link to={`/user/$userId/$page/$size`} params={{ userId: savedData?.userId!, page: '1', size: '25' }}>
              <p className='flex'>
                <span className='text-primary ml-1'>{savedData?.displayUsername}</span>
              </p>
            </Link>
          </div>
          <div className='grid grid-cols-2 text-muted-foreground'>
            <p>
              Created At:
            </p>
            <p>
              {new Date(savedData?.createdAt as Date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className='grid grid-cols-2 text-muted-foreground'>
            <p>
              Updated At:
            </p>
            <p>
              {new Date(savedData?.updatedAt as Date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className='grid grid-cols-2 text-muted-foreground'>
            <p>Favorites:</p>
            <p className='flex items-center'>
              <Heart className={"w-4 h-4 mr-1"} />
              {savedData?.bookmarkCount}
            </p>
          </div>
        </div>
        <div className='pt-4 lg:w-2/3 lg:pt-0'>
          <h2 className='pb-4 text-xl'>Author Notes:</h2>
          <article dangerouslySetInnerHTML={{ __html: savedData?.descriptionHtml! }} className='w-full max-w-full prose prose-headings:text-primary prose-p:text-muted-foreground' />
        </div>
      </section>

    </div >
  )
}