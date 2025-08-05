import { useState, useEffect } from 'react';
import { getResponsiveImageSources } from '../../lib/utils/image-helpers'; // Asegúrate de que esta función esté implementada para obtener las URLs correctas

interface OptimizedImageProps {
  s3Key: string;
  alt: string;
  className?: string;
}

export function OptimizedImage({ s3Key, alt, className }: OptimizedImageProps) {
  const [sources, setSources] = useState<{ original: string | null; webp: string | null }>({ original: null, webp: null });

  useEffect(() => {
    if (!s3Key) return;

    const fetchUrls = async () => {
      const urls = await getResponsiveImageSources(s3Key);
      setSources(urls);
    };

    fetchUrls();
  }, [s3Key]);

  if (!sources.original) {
    // Muestra un placeholder o nada mientras carga
    return <div className={`placeholder ${className}`} />;
  }

  return (
    <picture>
      {/* Si existe la versión WebP, el navegador la usará */}
      {sources.webp && <source srcSet={sources.webp} type="image/webp" />}
      
      {/* Fallback a la imagen original */}
      <img src={sources.original} alt={alt} className={className} />
    </picture>
  );
}