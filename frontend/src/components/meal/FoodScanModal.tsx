import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Camera,
  UploadCloud,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileCheck2,
  ScanLine,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { compressImage, formatFileSize } from '../../utils/imageCompressor';
import { aiApi } from '../../api/aiApi';
import { cameraService } from '../../services/cameraService';
import type { FoodScanResponse } from '../../types/ai';

interface FoodScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (result: FoodScanResponse, previewUrl: string) => void;
}

const SCANNING_STEPS = [
  'Đang nạp dữ liệu hình ảnh vào Gemini Vision...',
  'Đang nhận diện món ăn & ước tính khẩu phần...',
  'Đang tính toán Calorie, Protein, Carbs, Fat...',
  'Đang đối chiếu dữ liệu tim mạch & lối sống...',
  'Hoàn tất phân tích dinh dưỡng!',
];

export const FoodScanModal: React.FC<FoodScanModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);

  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to prevent memory leaks
  const cleanupPreview = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const resetState = useCallback(() => {
    cleanupPreview();
    setCompressedFile(null);
    setPreviewUrl(null);
    setOriginalSize(0);
    setCompressedSize(0);
    setCompressionRatio(0);
    setIsCompressing(false);
    setIsScanning(false);
    setScanStepIndex(0);
    setErrorMessage(null);
  }, [cleanupPreview]);

  // Reset when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  // Simulated progress step ticker during AI scanning
  useEffect(() => {
    let interval: any;
    if (isScanning) {
      interval = setInterval(() => {
        setScanStepIndex((prev) => (prev < SCANNING_STEPS.length - 2 ? prev + 1 : prev));
      }, 1400);
    } else {
      setScanStepIndex(0);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isOpen) return null;

  const handleProcessImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn một tệp hình ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }

    try {
      setErrorMessage(null);
      setIsCompressing(true);

      // Client-side image compression
      const result = await compressImage(file, {
        maxWidth: 960,
        maxHeight: 960,
        quality: 0.78,
      });

      cleanupPreview();
      setCompressedFile(result.compressedFile);
      setPreviewUrl(result.previewUrl);
      setOriginalSize(result.originalSize);
      setCompressedSize(result.compressedSize);
      setCompressionRatio(result.compressionRatio);
    } catch (err: any) {
      toast.error(err.message || 'Không thể xử lý hình ảnh này.');
      setErrorMessage(err.message);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessImage(file);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  const handleCaptureCamera = async () => {
    try {
      const file = await cameraService.takePhoto();
      if (file) {
        handleProcessImage(file);
      }
    } catch {
      // Fallback cho trình duyệt Web thông thường
      cameraInputRef.current?.click();
    }
  };

  const handlePickGallery = async () => {
    try {
      const file = await cameraService.pickPhoto();
      if (file) {
        handleProcessImage(file);
      }
    } catch {
      // Fallback cho trình duyệt Web thông thường
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessImage(file);
    }
  };

  const handleStartScan = async () => {
    if (!compressedFile) {
      toast.error('Vui lòng chụp hoặc tải ảnh món ăn trước.');
      return;
    }

    try {
      setIsScanning(true);
      setErrorMessage(null);

      const response = await aiApi.scanFood(compressedFile);

      if (response.success && response.data) {
        const data = response.data;
        if (data.isFood === false) {
          setErrorMessage(
            'Gemini AI không nhận diện được món ăn hoặc thực phẩm trong hình ảnh. Vui lòng thử lại với góc chụp rõ nét hơn!'
          );
          setIsScanning(false);
          return;
        }

        setScanStepIndex(SCANNING_STEPS.length - 1);
        toast.success(`Đã nhận diện thành công món: ${data.foodName || 'Món ăn'}`);

        // Small delay so user sees completion animation
        setTimeout(() => {
          onScanSuccess(data, previewUrl || '');
          onClose();
        }, 600);
      } else {
        throw new Error(response.message || 'Không nhận được kết quả từ AI.');
      }
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Lỗi khi kết nối với Gemini AI. Vui lòng thử lại sau.';
      setErrorMessage(msg);
      toast.error(msg);
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Hidden Inputs for File and Camera */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                Quét Dinh Dưỡng Món Ăn
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full">
                  Gemini Flash AI
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Chụp hoặc tải ảnh để tự động ước tính Calorie và dinh dưỡng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isScanning}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Upload / Preview View */}
          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[280px] ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                  : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50 bg-slate-50/20'
              }`}
            >
              {isCompressing ? (
                <div className="flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                  <p className="text-sm font-semibold text-slate-700">
                    Đang nén và tối ưu hóa hình ảnh...
                  </p>
                  <p className="text-xs text-slate-400">
                    Xử lý trực tiếp trên trình duyệt để tiết kiệm băng thông
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 mb-4 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-inner">
                    <Camera className="w-8 h-8" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 mb-1">
                    Chụp ảnh hoặc Tải ảnh bữa ăn của bạn
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mb-6">
                    Kéo và thả hình ảnh vào đây, hoặc chọn một trong các thao tác bên dưới
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                    {/* Camera Button */}
                    <button
                      type="button"
                      onClick={handleCaptureCamera}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all hover:scale-105 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Chụp từ Camera</span>
                    </button>

                    {/* File Upload Button */}
                    <button
                      type="button"
                      onClick={handlePickGallery}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
                    >
                      <UploadCloud className="w-4 h-4 text-indigo-600" />
                      <span>Chọn ảnh từ máy</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Image Preview & Scan Mode */
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-md max-h-[320px] flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Xem trước món ăn"
                  className={`w-full h-auto max-h-[320px] object-cover transition-all ${
                    isScanning ? 'brightness-75' : ''
                  }`}
                />

                {/* Laser Scanning Animation Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col justify-between overflow-hidden">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-pulse absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
                    <div className="absolute inset-0 bg-indigo-950/20 backdrop-brightness-90 flex flex-col items-center justify-center p-6 text-center text-white">
                      <div className="p-3 bg-indigo-600/80 rounded-full shadow-lg mb-3 animate-spin">
                        <ScanLine className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-xs font-bold text-cyan-200 tracking-wide mb-1">
                        AI VISION ĐANG PHÂN TÍCH
                      </p>
                      <p className="text-sm font-semibold text-white drop-shadow-md">
                        {SCANNING_STEPS[scanStepIndex]}
                      </p>
                    </div>
                  </div>
                )}

                {/* Re-pick / Action buttons overlay when not scanning */}
                {!isScanning && (
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePickGallery}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 shadow-sm cursor-pointer transition-all hover:scale-105"
                      title="Chọn ảnh khác"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Đổi ảnh</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Compression Metadata Badge */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Dung lượng gốc: <strong className="text-slate-800">{formatFileSize(originalSize)}</strong>
                  </span>
                  <span className="text-slate-300">|</span>
                  <span>
                    Sau nén: <strong className="text-emerald-700">{formatFileSize(compressedSize)}</strong>
                  </span>
                </div>
                {compressionRatio > 0 && (
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[11px] rounded-lg">
                    Giảm {compressionRatio}%
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Tips */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 text-xs text-indigo-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11.5px]">
              <strong>Mẹo chụp ảnh đẹp:</strong> Đặt góc máy nhìn thẳng hoặc chếch 45° từ trên xuống, ánh sáng đầy đủ để Gemini AI phân tích thành phần đĩa ăn chính xác nhất.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={onClose}
            disabled={isScanning}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            Hủy
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleStartScan}
              disabled={isScanning || isCompressing}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang phân tích...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt đầu quét với Gemini AI</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
