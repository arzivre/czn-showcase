import { TiptapSimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { Button } from "@/components/ui/button";
import { CombatanCombobox, } from "@/components/ui/combatant-combobox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field";
import {
  Input,
} from '@/components/ui/input';
import { ASSETS_URL } from "@/constants/assets-url";
import { type TUpdateSavedData, updateSavedData } from "@/core/functions/save-data";
import { putImageToR2 } from "@/core/functions/upload";
import { protectedRequestMiddleware } from "@/core/middleware/auth";
import useFileInput from "@/hooks/use-file-input";
import { TUpdateSavedDataValue, updatesavedDataSchema } from "@/zod/saved-data-schema";
import { getSavedDataQuerie } from "@repo/data-ops/queries/czn-saved-data";
import { useForm } from "@tanstack/react-form";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { createFileRoute, notFound } from '@tanstack/react-router';
import * as React from "react";
import sanitizeHtml from 'sanitize-html';
import { toast } from "sonner";

function getSavedData(id: string) {
  return fetch(`/api/saved-data/${id}`).then((res) => res.json() as ReturnType<typeof getSavedDataQuerie>)
}

export const savedDatasQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['saved-data-detail', id],
    queryFn: () => getSavedData(id),
  })

export const Route = createFileRoute('/_auth/app/edit/$id')({
  server: {
    middleware: [protectedRequestMiddleware],
  },
  loader: async ({ context, params: { id } }) => {
    const data = await context.queryClient.ensureQueryData(savedDatasQueryOptions(id))
    if (!data) throw notFound()
    return data;
  },
  wrapInSuspense: true,
  head: ({ loaderData }) => ({
    meta: loaderData ? [{ title: loaderData.title }] : undefined,
  }),
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const navigate = Route.useNavigate()

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const {
    files,
    previews,
    handleFileChange,
  } = useFileInput({
    maxSize: 2,
    accept: ['image/*'],
    multiple: false
  });

  const { mutate: updateSavedDataMutate, isPending } = useMutation({
    mutationFn: async (value: TUpdateSavedDataValue) => {
      let payload: TUpdateSavedData = {
        id: data.id as string,
        title: value.title,
        combatant: value.combatant,
        descriptionHtml: sanitizeHtml(value.descriptionHtml),
        descriptionText: value.descriptionText,
        imgUrl: data.imgUrl,
        deleteKey: data.imgUrl,
      }

      if (value.file) {
        const file = value.file
        const formData = new FormData
        formData.append('file', file)
        const { uniqueKey } = await putImageToR2({ data: formData })
        payload.imgUrl = uniqueKey
        payload.deleteKey = data.imgUrl
      } else {
        payload.imgUrl = data.imgUrl
        delete payload.deleteKey
      }

      return await updateSavedData({ data: payload })
    },
    onError(error, variables, onMutateResult, context) {
      console.error(error, variables, onMutateResult, context)
      toast.error('Request error')
    },
    onSuccess: (data) => {
      form.reset()
      toast("Saved Data successfully updated")
      navigate({ to: `/saved-data/${data?.return?.insertedId}` })
    },
  })

  const form = useForm({
    defaultValues: {
      id: data.id,
      title: data.title,
      descriptionHtml: data.descriptionHtml ?? "",
      descriptionText: data.descriptionText ?? "",
      combatant: data.combatant,
      file: undefined as File | undefined,
    },
    validators: {
      onChange: updatesavedDataSchema,
      onSubmit: updatesavedDataSchema,
    },
    canSubmitWhenInvalid: true,
    onSubmit: async ({ value }) => {
      await updateSavedDataMutate(updatesavedDataSchema.parse(value))
    },
    onSubmitInvalid() {
      const InvalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement

      InvalidInput?.focus()
    },
  })

  return (
    <main className="mx-auto w-full max-w-[900px] relative px-0 lg:px-8 py-24 sm:py-32">
      <h1 className="text-xl py-4 lg:text-3xl lg:py-8">Update Saved Data</h1>
      <form
        id="post-czn-saved-data-form"
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          void form.handleSubmit()
        }}
        className="flex flex-col space-y-4"
      >
        <FieldGroup>
          <form.Field
            name="title"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Title</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="The Best Sereniel saved data"
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
        <FieldGroup>
          <form.Field
            name="combatant"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Combatant</FieldLabel>
                  <CombatanCombobox
                    value={field.state.value}
                    handleChange={field.handleChange}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} className="max-w-[900px]" />
                  )}
                </Field>
              )
            }}
          />
        </FieldGroup>
        <React.Suspense fallback={
          <div className="min-h-[450px] flex items-center justify-center bg-background">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>}>

          <form.Field
            name="descriptionHtml"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                  <TiptapSimpleEditor
                    initialValue={data.descriptionHtml!}
                    handleChange={(html, text) => {
                      field.handleChange(html)
                      form.setFieldValue('descriptionText', text)
                    }}
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          />
        </React.Suspense>
        <FieldGroup>
          <form.Field
            name="file"
            validators={
              { onChange: ({ value }) => (value?.size! / (1024 * 1024) > 2 ? [{ message: `File "${value?.name!}" exceeds 2MB limit` }] : undefined), }
            }
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Upload saved data screenshot</FieldLabel>
                  <Input
                    id={field.name}
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    name={field.name}
                    multiple={false}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      // If user cancels, file might be undefined.
                      // We update the form state with the File object or undefined.
                      field.handleChange(file);
                      handleFileChange(e)
                    }}
                    aria-invalid={isInvalid}
                    placeholder="Saved data screenshot"
                    autoComplete="off"
                    className="block w-full file:mr-4 text-muted-foreground"
                  />
                  {isInvalid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )
            }}
          />
        </FieldGroup>
        {files[0] ?
          <PreviewImage name={files[0]?.name} src={previews[0]} />
          : <PreviewImage name={data.title} src={`${ASSETS_URL}/${data.imgUrl}`} />
        }

        <div className="mt-4 flex w-full justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Uploading...' : 'Submit'}
          </Button>
        </div>

        {/* <form.Subscribe
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
        /> */}
      </form>
    </main>
  )
}

function PreviewImage({ name, src }: { name?: string, src?: string }) {
  if (!name && !src) {
    return null
  }
  return (
    <div className="flex flex-col space-y-3">
      <p className="text-sm text-primary">Preview {name}</p>
      <img alt="preview" src={src} />
    </div>)
}