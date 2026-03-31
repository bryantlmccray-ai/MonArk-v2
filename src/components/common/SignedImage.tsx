import React from 'react';
import { useSignedPhotoUrl } from '@/hooks/useSignedPhotoUrl';

interface SignedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** Photo reference: can be a file path (e.g. "userId/timestamp.jpg") or a full URL */
  photoRef: string | null | undefined;
}

/**
 * Drop-in replacement for <img> that resolves private bucket paths to signed URLs.
 * Backward-compatible with legacy public URLs (they pass through unchanged).
 */
export const SignedImage: React.FC<SignedImageProps> = ({ photoRef, alt = '', ...imgProps }) => {
  const url = useSignedPhotoUrl(photoRef);

  if (!url) return null;

  return <img src={url} alt={alt} {...imgProps} />;
};
