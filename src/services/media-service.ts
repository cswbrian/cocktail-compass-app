import imageCompression from 'browser-image-compression';
import { AuthService } from './auth-service';
import { supabase } from '@/lib/supabase';

export enum StorageBucket {
  COCKTAIL_LOGS = 'cocktail-logs',
  USER_AVATARS = 'user-avatars',
  COCKTAIL_IMAGES = 'cocktail-images',
}

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  convertToWebP?: boolean;
}

interface MediaItem {
  id: string;
  url: string;
}

type AllowedMimeTypes = {
  [key: string]: boolean;
};

export class MediaService {
  private readonly defaultCompressionOptions: CompressionOptions =
    {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      quality: 0.8,
      convertToWebP: true,
    };

  private readonly allowedMimeTypes: AllowedMimeTypes = {
    'image/jpeg': true,
    'image/png': true,
    'image/webp': true,
    'image/gif': true,
  };

  private readonly maxFileSize = 8 * 1024 * 1024; // 8MB
  private readonly workerUrl: string;
  private readonly r2BucketUrl: string;

  constructor(
    private readonly bucket: StorageBucket,
    workerUrl: string = import.meta.env
      .VITE_UPLOAD_WORKER_URL || '',
    r2BucketUrl: string = import.meta.env
      .VITE_R2_BUCKET_URL || '',
  ) {
    this.workerUrl = workerUrl;
    this.r2BucketUrl = r2BucketUrl;

    // Validate R2 bucket URL
    if (!this.r2BucketUrl) {
      console.warn(
        'R2 bucket URL is not configured. Media URLs may not work correctly.',
      );
    }
  }

  // Helper method to ensure proper URL formatting
  private getFullUrl(filePath: string): string {
    if (filePath.startsWith('http')) {
      return filePath;
    }
    if (!this.r2BucketUrl) {
      console.warn(
        'R2 bucket URL is not configured. Using relative path:',
        filePath,
      );
      return filePath;
    }
    return `${this.r2BucketUrl}/${filePath}`;
  }

  private async validateFile(file: File): Promise<void> {
    if (file.size > this.maxFileSize) {
      throw new Error(
        `File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`,
      );
    }

    if (
      file.type.startsWith('image/') &&
      !this.allowedMimeTypes[file.type]
    ) {
      throw new Error('Unsupported image format');
    }
  }

  private async compressImage(
    file: File,
    options: CompressionOptions = {},
  ): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    await this.validateFile(file);

    const compressionOptions = {
      ...this.defaultCompressionOptions,
      ...options,
    };

    try {
      const compressedFile = await imageCompression(file, {
        ...compressionOptions,
        initialQuality: compressionOptions.quality,
      });

      // If WebP conversion is enabled and the file isn't already WebP
      if (
        compressionOptions.convertToWebP &&
        file.type !== 'image/webp'
      ) {
        const webpBlob = await this.convertToWebP(compressedFile);
        // Create a new file with the WebP blob, but keep the original name
        return new File([webpBlob], file.name, {
          type: 'image/webp',
          lastModified: file.lastModified,
        });
      }

      // If no WebP conversion, return the compressed file
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
        canvas.toBlob(
          blob => {
            if (blob) resolve(blob);
            else
              reject(
                new Error('Failed to convert to WebP'),
              );
          },
          'image/webp',
          0.8,
        );
      };
      img.onerror = () =>
        reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private async getAuthToken(): Promise<string> {
    const user = await AuthService.getCurrentSession();
    if (!user) {
      throw new Error('Not authenticated');
    }
    const token = await AuthService.getAccessToken();
    if (!token) {
      throw new Error('Failed to get access token');
    }
    return token;
  }

  async uploadMedia(
    file: File,
    userId: string,
    entityId: string,
    metadata: Record<string, any> = {},
    compressionOptions?: CompressionOptions,
  ): Promise<string> {
    // Process the file (compress and convert to WebP if needed)
    const processedFile = await this.compressImage(file, {
      ...compressionOptions,
      // If the file is already WebP, don't convert it again
      convertToWebP:
        file.type !== 'image/webp' &&
        (compressionOptions?.convertToWebP ??
          this.defaultCompressionOptions.convertToWebP),
    });

    const authToken = await this.getAuthToken();

    // Get upload URL from worker
    const presignResponse = await fetch(
      `${this.workerUrl}/api/upload/presign`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          fileName: processedFile.name,
          contentType: processedFile.type,
          userId,
          entityId,
          entityType: metadata.entityType || 'cocktail_log',
        }),
      },
    );

    if (!presignResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const { filePath, uploadUrl } =
      await presignResponse.json();

    // Upload through worker
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': processedFile.type,
        Authorization: `Bearer ${authToken}`,
      },
      body: processedFile,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file');
    }

    // Notify worker of successful upload
    const completeResponse = await fetch(
      `${this.workerUrl}/api/upload/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          filePath,
          userId,
          entityId,
          metadata: {
            ...metadata,
            contentType: processedFile.type,
            fileSize: processedFile.size,
            originalName: processedFile.name,
            entityType:
              metadata.entityType || 'cocktail_log',
          },
        }),
      },
    );

    if (!completeResponse.ok) {
      throw new Error('Failed to complete upload');
    }

    // Return the full R2 bucket URL for the file
    return this.getFullUrl(filePath);
  }

  async uploadMultipleMedia(
    files: File[],
    userId: string,
    entityId: string,
    metadata: Record<string, any> = {},
    compressionOptions?: CompressionOptions,
  ): Promise<string[]> {
    const uploadPromises = files.map(file =>
      this.uploadMedia(
        file,
        userId,
        entityId,
        metadata,
        compressionOptions,
      ),
    );
    return Promise.all(uploadPromises);
  }

  async softDeleteMedia(mediaId: string): Promise<void> {
    console.log('Starting soft delete for media item:', { mediaId });
    
    try {
      const { data, error } = await supabase
        .from('media_items')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', mediaId)
        .select();

      if (error) {
        console.error('Error in softDeleteMedia:', {
          mediaId,
          error,
        });
        throw error;
      }

      console.log('Successfully soft deleted media item:', {
        mediaId,
        updatedItem: data?.[0],
      });
    } catch (error) {
      console.error('Unexpected error in softDeleteMedia:', {
        mediaId,
        error,
      });
      throw error;
    }
  }

  async softDeleteMultipleMedia(
    ids: string[],
  ): Promise<void> {
    console.log('Starting soft delete for multiple media items:', {
      ids,
    });

    try {
      const { data, error } = await supabase
        .from('media_items')
        .update({
          status: 'deleted',
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .in('id', ids)
        .select();

      if (error) {
        console.error('Error in softDeleteMultipleMedia:', {
          ids,
          error,
        });
        throw error;
      }

      console.log('Successfully soft deleted multiple media items:', {
        ids,
        updatedCount: data?.length,
        updatedItems: data,
      });
    } catch (error) {
      console.error('Unexpected error in softDeleteMultipleMedia:', {
        ids,
        error,
      });
      throw error;
    }
  }

  mapMediaFromUrls(urls: { id: string; url: string }[]): {
    id: string;
    url: string;
    type: 'image' | 'video';
    contentType: string;
    fileSize: number;
    originalName: string;
    createdAt: Date;
    status: 'active';
  }[] {
    return (urls || []).map((item: { id: string; url: string }) => ({
      id: item.id,
      url: item.url.startsWith('http')
        ? item.url
        : `${import.meta.env.VITE_R2_BUCKET_URL}/${item.url}`,
      type: item.url.match(/\.(mp4|mov)$/i)
        ? 'video'
        : ('image' as const),
      contentType: item.url.match(/\.(mp4|mov)$/i)
        ? 'video/mp4'
        : 'image/jpeg',
      fileSize: 0,
      originalName: item.url.split('/').pop() || '',
      createdAt: new Date(),
      status: 'active',
    }));
  }
}

// Create instances for different buckets
export const cocktailLogsMediaService = new MediaService(
  StorageBucket.COCKTAIL_LOGS,
);
export const userAvatarsMediaService = new MediaService(
  StorageBucket.USER_AVATARS,
);
export const cocktailImagesMediaService = new MediaService(
  StorageBucket.COCKTAIL_IMAGES,
);
