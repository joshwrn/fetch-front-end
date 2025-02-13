'use client'
import React from 'react'
import { Skeleton } from './skeleton'

export const ProgressiveImage = ({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) => {
  const [isLoading, setIsLoading] = React.useState(true)
  return (
    <>
      {isLoading && <Skeleton className={className} />}
      {/* Don't want to use up all of my vercel "Image Optimization" on this app */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        style={{
          opacity: isLoading ? 0 : 1,
          position: isLoading ? `absolute` : `static`,
        }}
        {...props}
        loading="eager"
        onLoad={() => setIsLoading(false)}
      />
    </>
  )
}
