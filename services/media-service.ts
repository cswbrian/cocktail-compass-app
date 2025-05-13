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
  quality?: number;
  convertToWebP?: boolean;
}

interface MediaItem {
  url: string;
  type: 'image' | 'video';
}

type AllowedMimeTypes = {
  [key: string]: boolean;
};

export class MediaService {
  private readonly defaultCompressionOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    quality: 0.8,
    convertToWebP: true
  };

  private readonly allowedMimeTypes: AllowedMimeTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/webp': true,
    'image/gif': true
  };

  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor(private readonly bucket: StorageBucket) {}

  private async validateFile(file: File): Promise<void> {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (file.type.startsWith('image/') && !this.allowedMimeTypes[file.type]) {
      throw new Error('Unsupported image format');
    }
  }

  private async compressImage(file: File, options: CompressionOptions = {}): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    await this.validateFile(file);

    const compressionOptions = {
      ...this.defaultCompressionOptions,
      ...options
    };

    try {
      const compressedFile = await imageCompression(file, {
        ...compressionOptions,
        initialQuality: compressionOptions.quality
      });

      if (compressionOptions.convertToWebP && file.type !== 'image/webp') {
        const webpBlob = await this.convertToWebP(compressedFile);
        return new File([webpBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
          type: 'image/webp',
          lastModified: file.lastModified,
        });
      }

      return new File([compressedFile], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  }

  private async convertToWebP(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert to WebP'));
        }, 'image/webp', 0.8);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async uploadMedia(file: File, userId: string, entityId: string, compressionOptions?: CompressionOptions): Promise<string> {
    const processedFile = await this.compressImage(file, compressionOptions);
    
    const fileExt = processedFile.name.split('.').pop();
    const fileName = `${userId}/${entityId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(this.bucket)
      .upload(fileName, processedFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(this.bucket)
      .getPublicUrl(fileName, {
        transform: {
          width: 800,
          height: 800,
          quality: 80
        }
      });

    return publicUrl;
  }

  async getSignedUrl(fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.bucket)
      .createSignedUrl(fileName, 3600); // URL valid for 1 hour

    if (error) throw error;
    if (!data?.signedUrl) throw new Error('Failed to get signed URL');
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

  async getSignedUrlForMediaItem(mediaItem: MediaItem): Promise<MediaItem> {
    // Extract the file path from the URL
    const urlParts = mediaItem.url.split('/');
    const fileName = urlParts.slice(urlParts.indexOf(this.bucket) + 1).join('/');
    const signedUrl = await this.getSignedUrl(fileName);
    return { ...mediaItem, url: signedUrl };
  }

  async getSignedUrlsForMediaItems(mediaItems: MediaItem[]): Promise<MediaItem[]> {
    return Promise.all(mediaItems.map(item => this.getSignedUrlForMediaItem(item)));
  }
}

// Create instances for different buckets
export const cocktailLogsMediaService = new MediaService(StorageBucket.COCKTAIL_LOGS);
export const userAvatarsMediaService = new MediaService(StorageBucket.USER_AVATARS);
export const cocktailImagesMediaService = new MediaService(StorageBucket.COCKTAIL_IMAGES); 