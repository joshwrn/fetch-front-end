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

import dog_image from '@/public/dog.webp'
import { ProgressiveImage } from '@/components/ui/progressive-image'

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
      <div className="w-full max-w-[800px] h-fit md:h-full max-h-[500px] flex rounded-lg bg-orange-50 shadow-md overflow-hidden relative">
        <div className="w-full max-w-[600px] h-full hidden md:flex overflow-hidden relative">
          <ProgressiveImage
            src={dog_image}
            width={500}
            height={500}
            alt="dog"
            className="object-cover object-bottom w-full h-full"
          />
        </div>
        <FormProvider {...form}>
          <form
            className="flex flex-col gap-4 p-8 w-full md:max-w-[350px] overflow-hidden"
            onSubmit={(e) => {
              e.preventDefault()
              form.handleSubmit((input) => loginMutation.mutate(input))()
            }}
          >
            <h1 className="text-xl font-bold text-orange-950">Login</h1>
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
            <Button type="submit" className="bg-orange-950 hover:bg-orange-900">
              Submit
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}
