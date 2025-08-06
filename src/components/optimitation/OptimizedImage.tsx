import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { getResponsiveImageSources } from '../../lib/utils/image-helpers';

interface OptimizedImageProps {
  s3Key: string;
  alt: string;
  className?: string;
  showPlaceholder?: boolean;
}

export function OptimizedImage({ s3Key, alt, className, showPlaceholder = true }: OptimizedImageProps) {
  const [sources, setSources] = useState<{ original: string | null; webp: string | null }>({ original: null, webp: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!s3Key) {
      setLoading(false);
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    const fetchUrls = async () => {
      try {
        console.log('[OptimizedImage] Fetching image for key:', s3Key);
        const urls = await getResponsiveImageSources(s3Key);
        
        if (!urls.original) {
          console.error('[OptimizedImage] Failed to load image for key:', s3Key);
          setError(true);
        } else {
          console.log('[OptimizedImage] Successfully loaded image for key:', s3Key);
          console.log('[OptimizedImage] WebP available:', !!urls.webp);
        }
        
        setSources(urls);
      } catch (err) {
        console.error('[OptimizedImage] Error fetching image sources:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUrls();
  }, [s3Key]);

  if (loading) {
    return <div className={`placeholder ${className} animate-pulse bg-gray-200 dark:bg-gray-700`} />;
  }

  if (error || !sources.original) {
    if (!showPlaceholder) return null;
    
    // Placeholder with icon for failed images
    return (
      <div className={`flex items-center justify-center ${className} bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded`}>
        <ImageIcon className="text-gray-400 dark:text-gray-500" size={24} />
      </div>
    );
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