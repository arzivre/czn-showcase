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
import { LoadingScreen } from "@/components/ui/loading";
import { addSavedData, TAddSavedData } from "@/core/functions/save-data";
import { putImageToR2 } from "@/core/functions/upload";
import { protectedRequestMiddleware } from "@/core/middleware/auth";
import useFileInput from "@/hooks/use-file-input";
import { savedDataFormSchema, TSavedDataForm } from "@/zod/saved-data-schema";
import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute } from '@tanstack/react-router';
import * as React from "react";
import { toast } from "sonner";

export const Route = createFileRoute('/_auth/app/post')({
  component: RouteComponent,
  pendingComponent: () => <LoadingScreen />,
  server: {
    middleware: [protectedRequestMiddleware],
  },
  ssr: false,
  wrapInSuspense: true
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { mutate: addSavedDataMutate } = useMutation({
    mutationFn: async (value: TSavedDataForm) => {
      const file = value.file
      const formData = new FormData
      formData.append('file', file)
      const { uniqueKey } = await putImageToR2({ data: formData })

      const data: TAddSavedData = {
        title: value.title,
        combatant: value.combatant,
        descriptionHtml: value.descriptionHtml,
        descriptionText: value.descriptionText,
        imgUrl: uniqueKey,
        bookmarkCount: 0
      }
      return await addSavedData({ data })
    },
    onError(error, variables, onMutateResult, context) {
      console.error(error, variables, onMutateResult, context)
      toast.error('Request error')
    },
    onSuccess: (data) => {
      form.reset()
      toast("Saved Data successfully posted")
      navigate({ to: `/saved-data/${data?.return[0]?.insertedId}` })
    },
  })


  const form = useForm({
    defaultValues: {
      title: "",
      descriptionHtml: "",
      descriptionText: "",
      combatant: "",
      file: undefined as File | undefined,
    },
    validators: {
      onChange: savedDataFormSchema,
      onSubmit: savedDataFormSchema,
    },
    canSubmitWhenInvalid: true,
    onSubmit: async ({ value }) => {
      await addSavedDataMutate(savedDataFormSchema.parse(value))
    },
    onSubmitInvalid() {
      const InvalidInput = document.querySelector(
        '[aria-invalid="true"]',
      ) as HTMLInputElement

      InvalidInput?.focus()
    },
  })

  const {
    files,
    previews,
    handleFileChange,
  } = useFileInput({
    maxSize: 2,
    accept: ['image/*'],
    multiple: false
  });
  return (
    <main className="mx-auto w-full max-w-[900px] relative px-0 lg:px-8 py-24 sm:py-32">
      <h1 className="text-xl py-4 lg:text-3xl lg:py-8">Post Combatant Saved Data</h1>
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
        <PreviewImage name={files[0]?.name} src={previews[0]} />

        <div className="mt-4 flex w-full justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <form.Subscribe
            selector={(state) => [state.errorMap]}
            children={([canSubmit, isSubmitting,]) =>
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? 'Uploading...' : 'Submit'}
              </Button>}
          />
        </div>

        {/* <form.Subscribe
          selector={(state) => [state.errorMap]}
          children={([errorMap]) =>
            errorMap?.onSubmit ? (
              <div>
                <p>
                  There was an error on the form: {JSON.stringify(errorMap.onSubmit)}
                </p>
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