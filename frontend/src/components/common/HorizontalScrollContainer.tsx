import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  showArrows?: boolean;
  scrollStep?: number;
}

/**
 * HorizontalScrollContainer - Giải pháp cuộn ngang đa nền tảng tối ưu (Desktop & Mobile)
 * Tuân thủ nguyên lý Single Responsibility Principle (SRP):
 * 1. Hỗ trợ con lăn chuột (Wheel-to-horizontal-scroll)
 * 2. Kéo thả chuột để cuộn (Click & Drag-to-scroll)
 * 3. Nút bấm mũi tên điều hướng (Chevron left/right)
 * 4. Fade-edge gradient động (tự động bật/tắt theo vị trí cuộn)
 */
export const HorizontalScrollContainer: React.FC<HorizontalScrollContainerProps> = ({
  children,
  className = '',
  innerClassName = '',
  showArrows = true,
  scrollStep = 220,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Cập nhật trạng thái xem có thể cuộn trái/phải không
  const checkScrollability = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollability();

    // Lắng nghe resize để cập nhật lại mũi tên và fade mask
    const resizeObserver = new ResizeObserver(() => checkScrollability());
    resizeObserver.observe(el);

    // 1. Xử lý Wheel-to-Horizontal Scroll trên Desktop
    const onWheel = (e: WheelEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
        checkScrollability();
      }
    };

    // 2. Xử lý Click & Drag to scroll
    let isMouseDown = false;
    let startX = 0;
    let initialScrollLeft = 0;
    let draggedDistance = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (el.scrollWidth <= el.clientWidth) return;
      // Chỉ kích hoạt khi nhấn chuột trái
      if (e.button !== 0) return;

      isMouseDown = true;
      draggedDistance = 0;
      startX = e.pageX - el.offsetLeft;
      initialScrollLeft = el.scrollLeft;
      setIsDragging(true);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      e.preventDefault();
      const currentX = e.pageX - el.offsetLeft;
      const walk = (currentX - startX) * 1.2;
      draggedDistance += Math.abs(walk);
      el.scrollLeft = initialScrollLeft - walk;
      checkScrollability();
    };

    const onMouseUp = () => {
      isMouseDown = false;
      setIsDragging(false);
    };

    // Chặn click nhầm vào các nút/chip con khi người dùng đang kéo rê chuột
    const onClickCapture = (e: MouseEvent) => {
      if (draggedDistance > 5) {
        e.stopPropagation();
        e.preventDefault();
        draggedDistance = 0;
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    el.addEventListener('click', onClickCapture, { capture: true });
    el.addEventListener('scroll', checkScrollability);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('click', onClickCapture, { capture: true });
      el.removeEventListener('scroll', checkScrollability);
    };
  }, [checkScrollability]);

  // Nút cuộn trái/phải
  const handleScrollBy = (offset: number) => {
    containerRef.current?.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className={`relative group/hscroll select-none ${className}`}>
      {/* Nút cuộn sang trái (Desktop) */}
      {showArrows && canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScrollBy(-scrollStep)}
          aria-label="Cuộn sang trái"
          className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md border border-slate-200/80 hover:bg-white hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-80 group-hover/hscroll:opacity-100"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Container nội dung cuộn */}
      <div
        ref={containerRef}
        className={`scroll-fade-x flex flex-nowrap items-center ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab md:cursor-auto'
        } ${innerClassName}`}
      >
        {children}
      </div>

      {/* Nút cuộn sang phải (Desktop) */}
      {showArrows && canScrollRight && (
        <button
          type="button"
          onClick={() => handleScrollBy(scrollStep)}
          aria-label="Cuộn sang phải"
          className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md border border-slate-200/80 hover:bg-white hover:text-indigo-600 hover:scale-110 active:scale-95 transition-all cursor-pointer opacity-80 group-hover/hscroll:opacity-100"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
