import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export const FETCH_URL = `https://frontend-take-home-service.fetch.com`

export const fetchUrl = (path: string) => {
  return new URL(path, FETCH_URL)
}

export const useHandleFetchStatus = () => {
  const router = useRouter()
  return (response: Response) => {
    if (response.status === 401) {
      toast(`You are not logged in`, { id: `auth` })
      router.push(`/`)
      return
    }
    if (response.status !== 200) {
      toast.error(`Something went wrong`, { id: `error` })
      return
    }
    return response
  }
}
