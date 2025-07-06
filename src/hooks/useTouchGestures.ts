import { useState, useEffect, useRef, RefObject } from 'react';

interface TouchGestureState {
  isDragging: boolean;
  isZooming: boolean;
  dragStart: { x: number; y: number };
  lastPosition: { x: number; y: number };
  hasMoved: boolean;
  zoomLevel: number;
  initialDistance: number;
}

interface UseTouchGesturesProps {
  onDrag?: (deltaX: number, deltaY: number) => void;
  onZoom?: (scale: number) => void;
  onTap?: (x: number, y: number) => void;
  onDoubleTap?: (x: number, y: number) => void;
  dragSensitivity?: number;
  zoomSensitivity?: number;
  minZoom?: number;
  maxZoom?: number;
}

export const useTouchGestures = (
  elementRef: RefObject<HTMLElement>,
  options: UseTouchGesturesProps = {}
) => {
  const {
    onDrag,
    onZoom,
    onTap,
    onDoubleTap,
    dragSensitivity = 1,
    zoomSensitivity = 0.01,
    minZoom = 0.5,
    maxZoom = 3
  } = options;

  const [gestureState, setGestureState] = useState<TouchGestureState>({
    isDragging: false,
    isZooming: false,
    dragStart: { x: 0, y: 0 },
    lastPosition: { x: 0, y: 0 },
    hasMoved: false,
    zoomLevel: 1,
    initialDistance: 0
  });

  const lastTapRef = useRef<number>(0);
  const touchesRef = useRef<TouchList | null>(null);

  const getDistance = (touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  const getTouchCenter = (touches: TouchList): { x: number; y: number } => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    const x = (touches[0].clientX + touches[1].clientX) / 2;
    const y = (touches[0].clientY + touches[1].clientY) / 2;
    return { x, y };
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      touchesRef.current = e.touches;

      if (e.touches.length === 1) {
        // Single touch - potential drag or tap
        const touch = e.touches[0];
        const center = getTouchCenter(e.touches);
        
        setGestureState(prev => ({
          ...prev,
          isDragging: true,
          dragStart: center,
          lastPosition: center,
          hasMoved: false
        }));
      } else if (e.touches.length === 2) {
        // Two finger touch - zoom
        const distance = getDistance(e.touches);
        setGestureState(prev => ({
          ...prev,
          isZooming: true,
          initialDistance: distance,
          isDragging: false
        }));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      
      if (e.touches.length === 1 && gestureState.isDragging) {
        // Single finger drag
        const center = getTouchCenter(e.touches);
        const deltaX = (center.x - gestureState.lastPosition.x) * dragSensitivity;
        const deltaY = (center.y - gestureState.lastPosition.y) * dragSensitivity;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 5) {
          setGestureState(prev => ({
            ...prev,
            hasMoved: true,
            lastPosition: center
          }));
          
          onDrag?.(deltaX, deltaY);
        }
      } else if (e.touches.length === 2 && gestureState.isZooming) {
        // Two finger zoom
        const currentDistance = getDistance(e.touches);
        const scale = currentDistance / gestureState.initialDistance;
        const newZoomLevel = Math.max(minZoom, Math.min(maxZoom, scale));
        
        setGestureState(prev => ({
          ...prev,
          zoomLevel: newZoomLevel
        }));
        
        onZoom?.(newZoomLevel);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        // All fingers lifted
        if (!gestureState.hasMoved && !gestureState.isZooming) {
          // Handle tap
          const now = Date.now();
          const timeSinceLastTap = now - lastTapRef.current;
          
          if (timeSinceLastTap < 300) {
            // Double tap
            onDoubleTap?.(gestureState.dragStart.x, gestureState.dragStart.y);
          } else {
            // Single tap
            onTap?.(gestureState.dragStart.x, gestureState.dragStart.y);
          }
          
          lastTapRef.current = now;
        }
        
        setGestureState(prev => ({
          ...prev,
          isDragging: false,
          isZooming: false,
          hasMoved: false
        }));
      }
    };

    // Add event listeners with passive: false to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [
    elementRef.current,
    gestureState.isDragging,
    gestureState.isZooming,
    gestureState.hasMoved,
    gestureState.lastPosition,
    gestureState.dragStart,
    gestureState.initialDistance,
    onDrag,
    onZoom,
    onTap,
    onDoubleTap,
    dragSensitivity,
    zoomSensitivity,
    minZoom,
    maxZoom
  ]);

  return {
    isDragging: gestureState.isDragging,
    isZooming: gestureState.isZooming,
    zoomLevel: gestureState.zoomLevel
  };
};