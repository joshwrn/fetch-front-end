import { z } from 'zod'

export const DogsSearchSchema = z.object({
  resultIds: z.array(z.string()),
  total: z.number(),
  next: z.string().optional(),
  prev: z.string().optional(),
})

export const DogSchema = z.object({
  id: z.string(),
  img: z.string(),
  name: z.string(),
  age: z.number(),
  zip_code: z.string(),
  breed: z.string(),
})

export const DogResponseSchema = z.array(DogSchema)

export const MatchSchema = z.object({
  match: z.string(),
})

export const LocationSchema = z.object({
  zip_code: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string(),
  state: z.string(),
  county: z.string(),
})

export const CoordinatesSchema = z.object({
  lat: z.number(),
  lon: z.number(),
})
