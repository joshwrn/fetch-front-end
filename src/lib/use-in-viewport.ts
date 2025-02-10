import React from 'react'

export const useHasBeenInViewport = ({
  onVisible,
}: {
  onVisible?: () => void
}) => {
  const [hasBeenSeen, setHasBeenSeen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement | null>(null)
  React.useLayoutEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasBeenSeen(true)
        if (onVisible) onVisible()
        observer.disconnect()
      }
    })
    if (ref.current) {
      observer.observe(ref.current)
    }
  }, [ref, onVisible])

  return { hasBeenSeen, ref }
}
