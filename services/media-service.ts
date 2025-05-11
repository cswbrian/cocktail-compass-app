import { supabase } from '@/lib/supabase';
import imageCompression from 'browser-image-compression';

export enum StorageBucket {
  COCKTAIL_LOGS = 'cocktail-logs',
  USER_AVATARS = 'user-avatars',
  COCKTAIL_IMAGES = 'cocktail-images',
  // Add more buckets as needed
}

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
}

export class MediaService {
  private readonly defaultCompressionOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  constructor(private readonly bucket: StorageBucket) {}

  private async compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file; // Return original file if not an image
    }

    const compressionOptions = {
      ...this.defaultCompressionOptions,
      ...options
    };

    try {
      const compressedFile = await imageCompression(file, compressionOptions);
      return new File([compressedFile], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original file if compression fails
    }
  }

  async uploadMedia(file: File, userId: string, entityId: string, compressionOptions?: CompressionOptions): Promise<string> {
    // Compress image if it's an image file
    const processedFile = await this.compressImage(file, compressionOptions);
    
    const fileExt = processedFile.name.split('.').pop();
    const fileName = `${userId}/${entityId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(this.bucket)
      .upload(fileName, processedFile);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  }

  async getSignedUrl(fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(fileName, 3600); // URL valid for 1 hour

    if (error) throw error;
    return data.signedUrl;
  }

  async softDeleteMedia(url: string): Promise<void> {
    // Instead of deleting the file, we'll just mark it as deleted in the database
    // The actual file will remain in storage but won't be accessible through the app
    const { error } = await supabase
      .from('media_items')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString()
      })
      .eq('url', url);

    if (error) {
      throw error;
    }
  }

  async uploadMultipleMedia(files: File[], userId: string, entityId: string, compressionOptions?: CompressionOptions): Promise<string[]> {
    const uploadPromises = files.map(file => this.uploadMedia(file, userId, entityId, compressionOptions));
    return Promise.all(uploadPromises);
  }

  async softDeleteMultipleMedia(urls: string[]): Promise<void> {
    const deletePromises = urls.map(url => this.softDeleteMedia(url));
    await Promise.all(deletePromises);
  }

  // This method should be used by an admin or cleanup job
  async hardDeleteMedia(url: string): Promise<void> {
    // Extract the file path from the URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const fileName = pathParts[pathParts.length - 2] + '/' + pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from(this.bucket)
      .remove([fileName]);

    if (error) {
      throw error;
    }

    // Also remove the database record
    const { error: dbError } = await supabase
      .from('media_items')
      .delete()
      .eq('url', url);

    if (dbError) {
      throw dbError;
    }
  }

  // This method should be used by an admin or cleanup job
  async hardDeleteMultipleMedia(urls: string[]): Promise<void> {
    const deletePromises = urls.map(url => this.hardDeleteMedia(url));
    await Promise.all(deletePromises);
  }

  // Method to restore soft-deleted media
  async restoreMedia(url: string): Promise<void> {
    const { error } = await supabase
      .from('media_items')
      .update({
        status: 'active',
        deleted_at: null
      })
      .eq('url', url);

    if (error) {
      throw error;
    }
  }

  async getSignedUrlForMediaItem(mediaItem: { url: string; type: 'image' | 'video' }): Promise<{ url: string; type: 'image' | 'video' }> {
    // Extract the file path from the URL
    const urlParts = mediaItem.url.split('/');
    const fileName = urlParts.slice(urlParts.indexOf(this.bucket) + 1).join('/');
    const signedUrl = await this.getSignedUrl(fileName);
    return { ...mediaItem, url: signedUrl };
  }

  async getSignedUrlsForMediaItems(mediaItems: { url: string; type: 'image' | 'video' }[]): Promise<{ url: string; type: 'image' | 'video' }[]> {
    return Promise.all(mediaItems.map(item => this.getSignedUrlForMediaItem(item)));
  }
}

// Create instances for different buckets
export const cocktailLogsMediaService = new MediaService(StorageBucket.COCKTAIL_LOGS);
export const userAvatarsMediaService = new MediaService(StorageBucket.USER_AVATARS);
export const cocktailImagesMediaService = new MediaService(StorageBucket.COCKTAIL_IMAGES); 