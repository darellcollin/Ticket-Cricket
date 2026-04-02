/**
 * Image component with fallback to a colored placeholder.
 */
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string | null;
  alt: string;
  className?: string;
  fallbackText?: string;
  fallbackColor?: string;
}

export function ImageWithFallback({
  src,
  alt,
  className = "",
  fallbackText = "?",
  fallbackColor = "#374151",
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl text-2xl font-bold text-white ${className}`}
        style={{ backgroundColor: fallbackColor }}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}
