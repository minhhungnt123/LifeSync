import { Camera, CameraResultType, CameraSource, type Photo } from '@capacitor/camera';

/**
 * Camera Service Interface
 * Tuân thủ nguyên lý Single Responsibility Principle (SRP) & Dependency Inversion Principle (DIP):
 * Độc lập hóa toàn bộ logic chụp ảnh và chọn ảnh native,
 * cung cấp đầu ra là tệp File chuẩn cho ứng dụng Web SPA.
 */
export interface ICameraService {
  takePhoto(): Promise<File | null>;
  pickPhoto(): Promise<File | null>;
}

class CameraService implements ICameraService {
  /**
   * Chuyển đổi đối tượng Photo của Capacitor thành Web File chuẩn
   */
  private async convertPhotoToFile(photo: Photo, fileNamePrefix = 'food_scan'): Promise<File> {
    const extension = photo.format || 'jpeg';
    const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    const fileName = `${fileNamePrefix}_${Date.now()}.${extension}`;

    if (photo.webPath) {
      const response = await fetch(photo.webPath);
      const blob = await response.blob();
      return new File([blob], fileName, { type: mimeType });
    }

    if (photo.base64String) {
      const byteCharacters = atob(photo.base64String);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      return new File([blob], fileName, { type: mimeType });
    }

    throw new Error('Không thể trích xuất dữ liệu nhị phân từ ảnh chụp.');
  }

  /**
   * Mở Camera Native của thiết bị để chụp ảnh món ăn
   * Trả về null nếu người dùng hủy thao tác.
   */
  public async takePhoto(): Promise<File | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
      });

      return await this.convertPhotoToFile(photo, 'food_capture');
    } catch (error: any) {
      // Người dùng nhấn nút Back hoặc Hủy chụp
      if (
        error?.message?.includes('User cancelled') ||
        error?.message?.includes('canceled') ||
        error?.message?.includes('No image picked')
      ) {
        return null;
      }
      console.warn('[CameraService] Lỗi khi chụp ảnh qua Camera Native:', error);
      throw error;
    }
  }

  /**
   * Mở Thư viện ảnh Native (Gallery / Photos) của thiết bị để chọn ảnh món ăn
   * Trả về null nếu người dùng hủy thao tác.
   */
  public async pickPhoto(): Promise<File | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
      });

      return await this.convertPhotoToFile(photo, 'food_gallery');
    } catch (error: any) {
      // Người dùng nhấn nút Back hoặc Hủy chọn ảnh
      if (
        error?.message?.includes('User cancelled') ||
        error?.message?.includes('canceled') ||
        error?.message?.includes('No image picked')
      ) {
        return null;
      }
      console.warn('[CameraService] Lỗi khi chọn ảnh từ thư viện:', error);
      throw error;
    }
  }
}

export const cameraService = new CameraService();
