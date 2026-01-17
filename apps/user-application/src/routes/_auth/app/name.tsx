import { Button } from '@/components/ui/button';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel
} from "@/components/ui/field";
import { Input } from '@/components/ui/input';
import { updateUserDisplayName } from '@/core/functions/user';
import { protectedRequestMiddleware } from '@/core/middleware/auth';
import { authClient } from '@/lib/auth-client';
import { updateDisplayUsernameSchema } from '@/zod/auth-user';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { toast } from 'sonner';
import z from 'zod';

export const Route = createFileRoute('/_auth/app/name')({
    component: RouteComponent,
    server: {
        middleware: [protectedRequestMiddleware],
    },
})


function RouteComponent() {
    const { data: session } = authClient.useSession();
    const user = session?.user;

    const { mutate: updateUserDisplayNameMutation } = useMutation({
        mutationFn: async (value: z.infer<typeof updateDisplayUsernameSchema>) => {
            return await updateUserDisplayName({ data: { displayUsername: value.displayUsername } })
        },
        onError(error, variables, onMutateResult, context) {
            console.error(error, variables, onMutateResult, context)
            toast.error('Request error')
        },
        onSuccess: () => {
            form.reset()
            toast("Display Name successfully updated")
            window.location.reload();
        },
    })

    const form = useForm({
        defaultValues: {
            displayUsername: '',
        },
        validators: {
            onSubmit: updateDisplayUsernameSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                updateUserDisplayNameMutation(value)
            } catch (error) {
                console.error(error)
                toast.error("Submitt error!")
            }
        },
    })

    return (
        <main className="mx-auto w-full max-w-[900px] relative px-0 lg:px-8 py-24 sm:py-32">
            <h1 className="text-xl py-4 lg:text-3xl lg:py-8">Update Display Name</h1>
            <p className='mb-8 text-muted-foreground'>Current Display Name: <span className='text-primary'>{user?.displayUsername}</span></p>
            <form
                id="post-czn-saved-data-form"
                onSubmit={(e) => {
                    e.preventDefault()
                    form.handleSubmit()
                }}
                className="flex flex-col space-y-4"
            >
                <FieldGroup>
                    <form.Field
                        name="displayUsername"
                        children={(field) => {
                            const isInvalid =
                                field.state.meta.isTouched && !field.state.meta.isValid
                            return (
                                <Field data-invalid={isInvalid}>
                                    <FieldLabel htmlFor={field.name}>New Display Name</FieldLabel>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        aria-invalid={isInvalid}
                                        placeholder="eg. John Doe"
                                        autoComplete="off"
                                    />
                                    {isInvalid && (
                                        <FieldError errors={field.state.meta.errors} />
                                    )}
                                </Field>
                            )
                        }}
                    />
                </FieldGroup>
                <div className="mt-4 flex w-full justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => form.reset()}>
                        Reset
                    </Button>
                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button type="submit" disabled={!canSubmit}>
                                {isSubmitting ? 'Uploading...' : 'Submit'}
                            </Button>
                        )}
                    />
                </div>

                <form.Subscribe
                    selector={(state) => [state.errorMap]}
                    children={([errorMap]) =>
                        errorMap?.onSubmit ? (
                            <div>
                                <em>
                                    There was an error on the form: {JSON.stringify(errorMap.onSubmit)}
                                </em>
                            </div>
                        ) : null
                    }
                />
            </form>
        </main>
    )
}
