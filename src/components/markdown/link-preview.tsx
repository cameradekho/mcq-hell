'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type LinkMetadata = {
  title?: string
  description?: string
  image?: string
  url: string
}

export const LinkPreview = ({ url }: { url: string }) => {
  const [metadata, setMetadata] = useState<LinkMetadata | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true)
        // Use a proxy to avoid CORS issues
        const response = await fetch('/api/link-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ url })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch preview')
        }

        const data = await response.json()
        setMetadata(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetadata()
  }, [url])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-background/95 to-background p-6">
        <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-primary" />
      </div>
    )
  }

  if (error || !metadata) {
    return (
      <div className="bg-gradient-to-br from-background/95 to-background p-4 text-sm text-muted-foreground">
        <p className="break-all border-l-4 border-muted py-0.5 pl-2">{url}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 bg-gradient-to-br from-background/95 to-background p-4">
      {metadata.image && (
        <div className="relative h-36 w-full overflow-hidden rounded-md border border-border/40 shadow-sm">
          <Image
            fill
            unoptimized
            alt={metadata.title || 'Link preview'}
            className="object-cover transition-transform duration-300 hover:scale-105"
            src={metadata.image}
          />
        </div>
      )}
      {metadata.title && (
        <h3 className="border-l-4 border-primary py-0.5 pl-2 text-sm font-semibold text-primary">
          {metadata.title}
        </h3>
      )}
      {metadata.description && (
        <p className="line-clamp-2 max-h-[180px] overflow-y-auto rounded-md border border-border/40 bg-muted/30 p-3 text-sm text-foreground/90 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/50 hover:scrollbar-thumb-primary/70">
          {metadata.description}
        </p>
      )}
      <p className="flex items-center text-xs text-muted-foreground">
        <svg
          className="mr-1.5"
          fill="none"
          height="12"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="12"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="truncate">{url}</span>
      </p>
    </div>
  )
}
