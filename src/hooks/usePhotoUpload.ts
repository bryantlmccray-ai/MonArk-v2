
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const DANGEROUS_EXTENSIONS = new Set(['exe', 'bat', 'cmd', 'sh', 'ps1', 'js', 'html', 'svg', 'php', 'py']);

export const usePhotoUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) {
      return null;
    }

    // ---- Client-side validation (defense in depth) ----
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: 'File too large', description: 'Photos must be under 10 MB.', variant: 'destructive' });
      return null;
    }
    if (file.size < 1024) {
      toast({ title: 'Invalid file', description: 'File appears to be empty or corrupted.', variant: 'destructive' });
      return null;
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      toast({ title: 'Invalid file type', description: 'Please upload a JPEG, PNG, or WebP image.', variant: 'destructive' });
      return null;
    }
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext && DANGEROUS_EXTENSIONS.has(ext)) {
      toast({ title: 'File type not allowed', description: `".${ext}" files are not permitted.`, variant: 'destructive' });
      return null;
    }

    setUploading(true);
    
    try {
      // ---- Server-side pre-flight validation ----
      const { data: validation, error: valError } = await supabase.functions.invoke('validate-upload', {
        body: { fileName: file.name, fileSize: file.size, mimeType: file.type }
      });

      if (valError || (validation && !validation.valid)) {
        const msg = validation?.errors?.[0] || 'File did not pass server validation.';
        toast({ title: 'Upload rejected', description: msg, variant: 'destructive' });
        return null;
      }

      // ---- Upload to storage ----
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file);

      if (uploadError) {
        toast({ title: 'Upload failed', description: 'Could not upload photo. Please try again.', variant: 'destructive' });
        return null;
      }

      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;

      // ---- Post-upload content moderation ----
      try {
        const { data: modResult, error: modError } = await supabase.functions.invoke('photo-moderation', {
          body: { photoUrl: publicUrl, filePath }
        });

        if (modError) {
          console.error('Moderation check failed:', modError);
          // Allow photo if moderation service is unavailable (fail open for UX)
        } else if (modResult && !modResult.approved) {
          // Photo was rejected and already deleted server-side
          toast({
            title: 'Photo not accepted',
            description: modResult.reason || 'This photo doesn\'t meet our content guidelines. Please try a different one.',
            variant: 'destructive',
          });
          return null;
        }
      } catch (modErr) {
        console.error('Moderation error:', modErr);
        // Fail open — don't block upload if moderation service is down
      }

      return publicUrl;
    } catch (error) {
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoUrl: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const filePath = `${user.id}/${urlParts[urlParts.length - 1]}`;

      const { error } = await supabase.storage
        .from('profile-photos')
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting photo:', error);
      return false;
    }
  };

  return { uploadPhoto, deletePhoto, uploading };
};
