'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';

const DEFAULT_IMAGE_DURATION = 3500; // 3.5 seconds per slide

export default function ProductMediaCarousel({
  product,
  media,
  aspectRatio = 'aspect-square',
  className = '',
  autoPlay = true,
  interval = DEFAULT_IMAGE_DURATION,
  showStoryBars = true,
  showControls = true,
  enableSoundToggle = true,
  onSlideChange,
}) {
  // 1. Fail-Safe Media Array Fallback & Normalization
  const mediaList = React.useMemo(() => {
    let items = [];
    if (Array.isArray(media) && media.length > 0) {
      items = media;
    } else if (product?.media_gallery && product.media_gallery.length > 0) {
      items = product.media_gallery;
    } else if (product?.images && product.images.length > 0) {
      items = product.images;
    } else if (product?.image_url || product?.image) {
      items = [product.image_url || product.image];
    } else {
      items = [
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
      ];
    }

    return items
      .filter(Boolean)
      .map((item, idx) => {
        if (typeof item === 'string') {
          const isVid = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item);
          return {
            id: `media-${idx}`,
            type: isVid ? 'VIDEO' : 'IMAGE',
            url: item,
            thumbnail_url: item,
            display_order: idx,
          };
        }
        return {
          id: item.id || `media-${idx}`,
          type:
            item.type ||
            (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item.url || '') ? 'VIDEO' : 'IMAGE'),
          url: item.url || item.thumbnail_url || '',
          thumbnail_url: item.thumbnail_url || item.url || '',
          display_order: item.display_order ?? idx,
        };
      })
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [media, product]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const videoRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchDeltaXRef = useRef(0);

  const currentItem = mediaList[currentIndex] || mediaList[0];
  const isVideo = currentItem?.type === 'VIDEO';
  const hasMultiple = mediaList.length > 1;

  // Slide navigation
  const goToNext = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    },
    [mediaList.length]
  );

  const goToPrev = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    },
    [mediaList.length]
  );

  // Notify parent on slide change
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex, currentItem);
    }
  }, [currentIndex, currentItem, onSlideChange]);

  // 1. Reliable, Standalone Auto-Advance Timer (pure setInterval)
  useEffect(() => {
    if (!autoPlay || mediaList.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    }, interval || DEFAULT_IMAGE_DURATION);

    return () => clearInterval(timer);
  }, [autoPlay, mediaList.length, interval, currentIndex]);

  // 3. Mobile Video Policy Fix (Prevent Freezing)
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const vid = videoRef.current;
      vid.defaultMuted = true;
      vid.muted = isMuted;
      vid.playsInline = true;
      vid.currentTime = 0;
      vid.play().catch(() => {
        /* Ignore autoplay restrictions */
      });
    }
  }, [currentIndex, isVideo, isMuted]);

  // Touch Swipe gestures for mobile
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
  };

  const handleTouchMove = (e) => {
    if (!touchStartXRef.current) return;
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    if (hasMultiple && Math.abs(touchDeltaXRef.current) >= 40) {
      if (touchDeltaXRef.current < 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
    touchStartXRef.current = 0;
    touchDeltaXRef.current = 0;
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  return (
    <div
      className={`relative overflow-hidden group select-none touch-pan-y ${aspectRatio} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* CSS Animation Keyframes for Story Fill */}
      <style>
        {`
          @keyframes storyFill {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}
      </style>

      {/* 2. Media Slide Rendering (Image or Video) */}
      {isVideo ? (
        <div className="w-full h-full relative bg-black">
          <video
            ref={videoRef}
            src={currentItem.url}
            poster={currentItem.thumbnail_url}
            autoPlay
            muted={isMuted}
            playsInline
            preload="metadata"
            onEnded={() => setCurrentIndex((prev) => (prev + 1) % mediaList.length)}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {/* Video Reel Indicator Badge */}
          <div className="absolute top-4 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 pointer-events-none">
            <Play className="w-2.5 h-2.5 fill-current text-pink-400" />
            <span>ভিডিও রিল</span>
          </div>
        </div>
      ) : (
        <img
          src={currentItem.url}
          alt={product?.name || 'Product media'}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
      )}

      {/* 2. Story-Style Top Progress Indicators (Smooth Fill according to currentIndex) */}
      {showStoryBars && hasMultiple && (
        <div className="absolute top-2.5 inset-x-2.5 z-20 flex gap-1.5 px-0.5 pointer-events-none">
          {mediaList.map((item, idx) => {
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;

            return (
              <div
                key={item.id || idx}
                className="h-1 flex-1 bg-black/30 backdrop-blur-xs rounded-full overflow-hidden shadow-xs"
              >
                <div
                  key={`${idx}-${currentIndex}`}
                  className={`h-full bg-white/95 rounded-full ${
                    isCompleted
                      ? 'w-full'
                      : isActive
                      ? 'w-0'
                      : 'w-0'
                  }`}
                  style={
                    isActive
                      ? { animation: `storyFill ${interval || DEFAULT_IMAGE_DURATION}ms linear forwards` }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Tap to Advance (Instant Mobile Interaction: Left Half -> Prev, Right Half -> Next) */}
      {hasMultiple && (
        <div className="absolute inset-0 z-10 flex">
          {/* Left half: Tap to Previous */}
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={goToPrev}
            aria-label="Previous slide"
          />
          {/* Right half: Tap to Next */}
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={goToNext}
            aria-label="Next slide"
          />
        </div>
      )}

      {/* Navigation Arrows (Desktop hover) */}
      {showControls && hasMultiple && (
        <div className="hidden sm:block">
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-20 active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-20 active:scale-95 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sound Toggle (When Video is Active) */}
      {isVideo && enableSoundToggle && (
        <button
          type="button"
          onClick={toggleSound}
          className="absolute bottom-3 right-3 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md active:scale-90"
          title={isMuted ? 'সাউন্ড অন করুন' : 'সাউন্ড মিউট করুন'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-pink-400" />}
        </button>
      )}

      {/* Media Counter Pill */}
      {hasMultiple && (
        <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200">
          {currentIndex + 1} / {mediaList.length}
        </div>
      )}
    </div>
  );
}
