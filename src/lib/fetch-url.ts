import { AuthenticationError } from './errors'

export const FETCH_URL = `https://frontend-take-home-service.fetch.com`

export const fetchUrl = (path: string) => {
  return new URL(path, FETCH_URL)
}

export const handleFetchStatus = (response: Response) => {
  if (response.status === 401) {
    throw new AuthenticationError(`Not authenticated`)
  }
  if (response.status !== 200) {
    throw new Error(`Failed to fetch ${response.url}`)
  }
  return response
}
