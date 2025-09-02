import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

interface OptimizedImage {
  src: string;
  loading: boolean;
  error: boolean;
  originalSize?: number;
  optimizedSize?: number;
}

export const useOptimizedImages = (
  images: string[],
  options: ImageOptimizationOptions = {}
) => {
  const [optimizedImages, setOptimizedImages] = useState<Record<string, OptimizedImage>>({});
  const [loadingCount, setLoadingCount] = useState(0);

  const {
    quality = 0.8,
    maxWidth = 800,
    maxHeight = 600,
    format = 'jpeg'
  } = options;

  const optimizeImage = useCallback(async (src: string): Promise<OptimizedImage> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve({ src, loading: false, error: true });
            return;
          }

          // Calculate new dimensions
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height;
            
            if (width > height) {
              width = Math.min(width, maxWidth);
              height = width / aspectRatio;
            } else {
              height = Math.min(height, maxHeight);
              width = height * aspectRatio;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          const mimeType = `image/${format}`;
          const optimizedDataUrl = canvas.toDataURL(mimeType, quality);
          
          // Calculate sizes for comparison
          const originalSize = src.length * 0.75; // Rough estimate
          const optimizedSize = optimizedDataUrl.length * 0.75;

          resolve({
            src: optimizedDataUrl,
            loading: false,
            error: false,
            originalSize,
            optimizedSize
          });
        } catch (error) {
          resolve({ src, loading: false, error: true });
        }
      };

      img.onerror = () => {
        resolve({ src, loading: false, error: true });
      };

      img.src = src;
    });
  }, [quality, maxWidth, maxHeight, format]);

  const processImage = useCallback(async (src: string) => {
    if (optimizedImages[src] && !optimizedImages[src].loading) {
      return; // Already processed
    }

    setOptimizedImages(prev => ({
      ...prev,
      [src]: { src, loading: true, error: false }
    }));
    
    setLoadingCount(prev => prev + 1);

    const optimized = await optimizeImage(src);
    
    setOptimizedImages(prev => ({
      ...prev,
      [src]: optimized
    }));
    
    setLoadingCount(prev => prev - 1);
  }, [optimizeImage, optimizedImages]);

  useEffect(() => {
    const processImages = async () => {
      const promises = images.map(processImage);
      await Promise.all(promises);
    };

    if (images.length > 0) {
      processImages();
    }
  }, [images, processImage]);

  const getOptimizedImage = (src: string): OptimizedImage => {
    return optimizedImages[src] || { src, loading: true, error: false };
  };

  const isLoading = loadingCount > 0;
  const hasErrors = Object.values(optimizedImages).some(img => img.error);
  
  const totalOriginalSize = Object.values(optimizedImages)
    .reduce((sum, img) => sum + (img.originalSize || 0), 0);
  
  const totalOptimizedSize = Object.values(optimizedImages)
    .reduce((sum, img) => sum + (img.optimizedSize || 0), 0);
  
  const compressionRatio = totalOriginalSize > 0 
    ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100 
    : 0;

  return {
    optimizedImages,
    getOptimizedImage,
    isLoading,
    hasErrors,
    compressionRatio,
    totalOriginalSize,
    totalOptimizedSize
  };
};

// Lazy loading hook for images
export const useLazyImage = (src: string, rootMargin = '50px') => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    const imageElement = document.querySelector(`[data-src="${src}"]`);
    if (imageElement) {
      observer.observe(imageElement);
    }

    return () => observer.disconnect();
  }, [src, rootMargin]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setError(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return { isLoaded, isInView, error, shouldLoad: isInView };
};