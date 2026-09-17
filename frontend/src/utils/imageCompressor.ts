/**
 * Client-side Image Compression Utility using HTML5 Canvas API.
 * Optimizes user-uploaded food pictures before uploading to Gemini Vision API,
 * reducing payload size from ~5-10MB down to ~150-300KB without visible loss.
 */

export interface CompressionResult {
  compressedFile: File;
  previewUrl: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 960,
  maxHeight: 960,
  quality: 0.78,
  mimeType: 'image/jpeg',
};

/**
 * Compresses an image file client-side.
 *
 * @param file The original File object from input[type="file"] or drag-and-drop
 * @param options Custom compression parameters (maxWidth, maxHeight, quality)
 * @returns Promise resolving to the compressed file and metadata
 */
export const compressImage = (
  file: File,
  options?: CompressionOptions
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Tệp tải lên không phải là định dạng hình ảnh hợp lệ.'));
    }

    const config = { ...DEFAULT_OPTIONS, ...options };
    const originalSize = file.size;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > config.maxWidth || height > config.maxHeight) {
          if (width / height > config.maxWidth / config.maxHeight) {
            height = Math.round((height * config.maxWidth) / width);
            width = config.maxWidth;
          } else {
            width = Math.round((width * config.maxHeight) / height);
            height = config.maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Không thể khởi tạo môi trường vẽ Canvas 2D.'));
        }

        // Apply smooth interpolation
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Xử lý nén ảnh thất bại.'));
            }

            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], fileName, {
              type: config.mimeType,
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const compressionRatio = Math.round(
              ((originalSize - compressedSize) / originalSize) * 100
            );

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              compressedFile,
              previewUrl,
              originalSize,
              compressedSize,
              compressionRatio: Math.max(0, compressionRatio),
            });
          },
          config.mimeType,
          config.quality
        );
      };

      img.onerror = () => {
        reject(new Error('Không thể tải hoặc giải mã hình ảnh đã chọn.'));
      };
    };

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc tệp tin từ thiết bị.'));
    };
  });
};

/**
 * Formats byte numbers into human-readable strings (KB, MB).
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
