import { FETCH_URL } from '@/constants/fetch-url'

export const fetchUrl = (path: string) => {
  return new URL(path, FETCH_URL)
}
