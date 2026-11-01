'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';

const DEFAULT_IMAGE_DURATION = 3500; // 3.5 seconds per image
const MAX_VIDEO_FALLBACK_TIMEOUT = 12000; // 12s safety timeout if video stalls

// Helper: robust video detection for Cloudinary, Supabase Storage, and standard video formats
export function isMediaVideo(item) {
  if (!item) return false;
  if (typeof item === 'object') {
    if (item.type === 'VIDEO') return true;
    const url = item.url || '';
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) return true;
    if (url.includes('/video/upload/')) return true;
    return false;
  }
  if (typeof item === 'string') {
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item)) return true;
    if (item.includes('/video/upload/')) return true;
  }
  return false;
}

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
  // 1. Fail-Safe Media Normalization
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
        const isVid = isMediaVideo(item);
        if (typeof item === 'string') {
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
          type: isVid ? 'VIDEO' : 'IMAGE',
          url: item.url || item.thumbnail_url || '',
          thumbnail_url: item.thumbnail_url || item.url || '',
          display_order: item.display_order ?? idx,
        };
      })
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [media, product]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDuration, setVideoDuration] = useState(MAX_VIDEO_FALLBACK_TIMEOUT);

  const videoRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchDeltaXRef = useRef(0);

  const currentItem = mediaList[currentIndex] || mediaList[0];
  const isVideo = currentItem?.type === 'VIDEO';
  const hasMultiple = mediaList.length > 1;

  // Slide navigation
  const handleNextSlide = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    },
    [mediaList.length]
  );

  const handlePrevSlide = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
    },
    [mediaList.length]
  );

  // Notify parent on change
  useEffect(() => {
    if (onSlideChange) {
      onSlideChange(currentIndex, currentItem);
    }
  }, [currentIndex, currentItem, onSlideChange]);

  // Component Playback Logic:
  // - If IMAGE: Auto-advance after 3500ms using a standard cleanup-safe setInterval
  // - If VIDEO: Fallback safety timeout (12s) to prevent stalling if onEnded doesn't fire
  useEffect(() => {
    if (!autoPlay || mediaList.length <= 1) return;

    if (!isVideo) {
      const timer = setInterval(() => {
        handleNextSlide();
      }, interval || DEFAULT_IMAGE_DURATION);

      return () => clearInterval(timer);
    } else {
      const safetyTimeout = setTimeout(() => {
        handleNextSlide();
      }, MAX_VIDEO_FALLBACK_TIMEOUT);

      return () => clearTimeout(safetyTimeout);
    }
  }, [autoPlay, mediaList.length, isVideo, currentIndex, interval, handleNextSlide]);

  // Video Autoplay & Lifecycle management
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const vid = videoRef.current;
      vid.defaultMuted = true;
      vid.muted = isMuted;
      vid.playsInline = true;
      vid.currentTime = 0;

      const handleLoadedMetadata = () => {
        if (vid.duration && !isNaN(vid.duration)) {
          // Duration in ms, capped at 15 seconds
          setVideoDuration(Math.min(vid.duration * 1000, 15000));
        }
      };

      vid.addEventListener('loadedmetadata', handleLoadedMetadata);

      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy prevented playback, force mute and retry
          vid.muted = true;
          setIsMuted(true);
          vid.play().catch(() => {});
        });
      }

      return () => {
        vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [currentIndex, isVideo, isMuted]);

  // Mobile Touch Swipe Handling
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
        handleNextSlide();
      } else {
        handlePrevSlide();
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

  const activeDuration = isVideo ? videoDuration : (interval || DEFAULT_IMAGE_DURATION);

  return (
    <div
      className={`relative overflow-hidden group select-none touch-pan-y ${aspectRatio} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Keyframes for Story Indicator Fill */}
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
            loop={false}
            preload="metadata"
            onEnded={() => handleNextSlide()}
            onError={() => handleNextSlide()}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {/* Video Reel Badge */}
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

      {/* Top Story Progress Bars (reflecting active index accurately) */}
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
                    isCompleted ? 'w-full' : 'w-0'
                  }`}
                  style={
                    isActive
                      ? { animation: `storyFill ${activeDuration}ms linear forwards` }
                      : undefined
                  }
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Tap to Advance (Left Half -> Prev, Right Half -> Next) */}
      {hasMultiple && (
        <div className="absolute inset-0 z-10 flex">
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={handlePrevSlide}
            aria-label="Previous slide"
          />
          <div
            className="w-1/2 h-full cursor-pointer"
            onClick={handleNextSlide}
            aria-label="Next slide"
          />
        </div>
      )}

      {/* Desktop Controls */}
      {showControls && hasMultiple && (
        <div className="hidden sm:block">
          <button
            type="button"
            onClick={handlePrevSlide}
            aria-label="Previous slide"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-20 active:scale-95 shadow-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNextSlide}
            aria-label="Next slide"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-20 active:scale-95 shadow-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Sound Toggle */}
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
