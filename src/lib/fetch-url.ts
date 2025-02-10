import { FETCH_URL } from '@/constants/fetch-url'
import { AuthenticationError } from './errors'

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
}
