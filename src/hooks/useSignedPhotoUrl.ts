import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const SIGNED_URL_EXPIRY = 60 * 60; // 1 hour
const cache = new Map<string, { url: string; expiresAt: number }>();

/**
 * Resolves a photo reference (file path or legacy public URL) to a usable URL.
 * For private buckets, generates signed URLs with caching.
 */
export function resolvePhotoUrl(photoRef: string | null | undefined): string | null {
  if (!photoRef) return null;
  // Legacy public URLs (already full URLs) - still work if bucket was public
  if (photoRef.startsWith('http')) return photoRef;
  // File path - needs signed URL, return cached if available
  const cached = cache.get(photoRef);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  return null;
}

/**
 * Hook that returns a signed URL for a photo path.
 * Handles both legacy full URLs and new file paths.
 */
export function useSignedPhotoUrl(photoRef: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(() => resolvePhotoUrl(photoRef));

  useEffect(() => {
    if (!photoRef) { setUrl(null); return; }
    // Legacy full URLs pass through
    if (photoRef.startsWith('http')) { setUrl(photoRef); return; }

    // Check cache
    const cached = cache.get(photoRef);
    if (cached && cached.expiresAt > Date.now()) {
      setUrl(cached.url);
      return;
    }

    let cancelled = false;
    supabase.storage
      .from('profile-photos')
      .createSignedUrl(photoRef, SIGNED_URL_EXPIRY)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data?.signedUrl) {
          setUrl(null);
          return;
        }
        cache.set(photoRef, {
          url: data.signedUrl,
          expiresAt: Date.now() + (SIGNED_URL_EXPIRY - 60) * 1000, // refresh 1min early
        });
        setUrl(data.signedUrl);
      });

    return () => { cancelled = true; };
  }, [photoRef]);

  return url;
}

/**
 * Hook that returns signed URLs for an array of photo references.
 */
export function useSignedPhotoUrls(photoRefs: (string | null | undefined)[]): (string | null)[] {
  const [urls, setUrls] = useState<(string | null)[]>(() => photoRefs.map(resolvePhotoUrl));

  useEffect(() => {
    if (!photoRefs.length) { setUrls([]); return; }

    let cancelled = false;

    const resolve = async () => {
      const results = await Promise.all(
        photoRefs.map(async (ref) => {
          if (!ref) return null;
          if (ref.startsWith('http')) return ref;

          const cached = cache.get(ref);
          if (cached && cached.expiresAt > Date.now()) return cached.url;

          const { data, error } = await supabase.storage
            .from('profile-photos')
            .createSignedUrl(ref, SIGNED_URL_EXPIRY);

          if (error || !data?.signedUrl) return null;

          cache.set(ref, {
            url: data.signedUrl,
            expiresAt: Date.now() + (SIGNED_URL_EXPIRY - 60) * 1000,
          });
          return data.signedUrl;
        })
      );

      if (!cancelled) setUrls(results);
    };

    resolve();
    return () => { cancelled = true; };
  }, [JSON.stringify(photoRefs)]);

  return urls;
}
