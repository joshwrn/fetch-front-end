'use client'

import React from 'react'
import { useMutation } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  FormProvider,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { dogUrl } from '@/lib/dog-url'

const formSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
})

export default function Home() {
  const router = useRouter()
  const loginMutation = useMutation({
    mutationKey: [`login`],
    mutationFn: async (input: z.infer<typeof formSchema>) => {
      const res = await fetch(dogUrl(`/auth/login`), {
        credentials: `include`,
        headers: {
          'Content-Type': `application/json`,
        },
        body: JSON.stringify({
          name: input.name,
          email: input.email,
        }),
        method: `POST`,
      })
      if (res.status === 200) {
        router.push(`/dogs`)
      }
    },
  })
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: ``,
      email: ``,
    },
  })

  return (
    <div className="bg-orange-100 h-screen flex flex-col justify-center items-center">
      <FormProvider {...form}>
        <form
          className="flex flex-col gap-4 p-8 rounded-lg bg-orange-50 shadow-md max-w-full w-[400px]"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit((input) => loginMutation.mutate(input))()
          }}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </FormProvider>
    </div>
  )
}
