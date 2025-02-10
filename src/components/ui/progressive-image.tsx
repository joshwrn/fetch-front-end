'use client'
import Image, { ImageProps } from 'next/image'
import React from 'react'
import { Skeleton } from './skeleton'

export const ProgressiveImage = ({
  src,
  alt,
  width,
  height,
  className,
  ...props
}: ImageProps) => {
  const [isLoading, setIsLoading] = React.useState(true)
  return (
    <>
      {isLoading && <Skeleton className={className} />}
      <Image
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
        loading="lazy"
        onLoadingComplete={() => setIsLoading(false)}
      />
    </>
  )
}
