import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/contributors')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <main>
            <section className="mx-auto min-h-screen max-w-2xl relative px-6 lg:px-8 pt-24 sm:pt-32">
                <h1 className='text text-3xl py-4'>
                    Keep CZN-Showcase.online Alive & Thriving
                </h1>
                <p className='text-muted-foreground'>
                    Every contribution keep this site running.
                </p>
                <a href="https://ko-fi.com/cznshowcase" target="_blank" rel="noopener noreferrer">ko-fi.com/cznshowcase</a>
            </section>
        </main>)
}
