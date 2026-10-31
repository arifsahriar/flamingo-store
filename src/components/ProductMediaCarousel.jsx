'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';

const DEFAULT_IMAGE_DURATION = 3500; // 3.5 seconds per image
const MAX_VIDEO_PREVIEW_DURATION = 6500; // 6.5s preview loop or full video

export default function ProductMediaCarousel({
  product,
  media,
  aspectRatio = 'aspect-square',
  className = '',
  autoPlay = true,
  showStoryBars = true,
  showControls = true,
  enableSoundToggle = true,
  onSlideChange,
}) {
  // 1. Normalize media items
  const mediaList = React.useMemo(() => {
    let items = [];
    if (Array.isArray(media) && media.length > 0) {
      items = media;
    } else if (product?.media_gallery && Array.isArray(product.media_gallery) && product.media_gallery.length > 0) {
      items = product.media_gallery;
    } else if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
      items = product.images.map((url, idx) => ({
        id: `img-${idx}`,
        type: 'IMAGE',
        url,
        thumbnail_url: url,
        display_order: idx,
      }));
    } else if (product?.image) {
      items = [
        {
          id: 'single-img',
          type: 'IMAGE',
          url: product.image,
          thumbnail_url: product.image,
          display_order: 0,
        },
      ];
    } else {
      items = [
        {
          id: 'placeholder',
          type: 'IMAGE',
          url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
          thumbnail_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
          display_order: 0,
        },
      ];
    }

    return items
      .slice()
      .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [media, product]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100 for current slide
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoDuration, setVideoDuration] = useState(MAX_VIDEO_PREVIEW_DURATION);

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const elapsedBeforePauseRef = useRef(0);

  const currentItem = mediaList[currentIndex] || mediaList[0];
  const isVideo = currentItem?.type === 'VIDEO';
  const hasMultiple = mediaList.length > 1;

  // Slide navigation
  const goToNext = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
      setCurrentIndex((prev) => (prev + 1) % mediaList.length);
    },
    [mediaList.length]
  );

  const goToPrev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setProgress(0);
      elapsedBeforePauseRef.current = 0;
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

  // Handle Video Metadata & Playback
  useEffect(() => {
    if (isVideo && videoRef.current) {
      const vid = videoRef.current;
      vid.currentTime = 0;

      const handleLoadedMetadata = () => {
        const dur = vid.duration ? vid.duration * 1000 : MAX_VIDEO_PREVIEW_DURATION;
        // Cap preview duration at max or full clip if shorter
        setVideoDuration(Math.min(dur, MAX_VIDEO_PREVIEW_DURATION));
      };

      const handleEnded = () => {
        if (!isPaused && autoPlay) {
          goToNext();
        }
      };

      vid.addEventListener('loadedmetadata', handleLoadedMetadata);
      vid.addEventListener('ended', handleEnded);

      if (!isPaused) {
        vid.play().catch(() => {
          // Auto-play was prevented (often due to non-muted)
          vid.muted = true;
          vid.play().catch(() => {});
        });
      } else {
        vid.pause();
      }

      return () => {
        vid.removeEventListener('loadedmetadata', handleLoadedMetadata);
        vid.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentIndex, isVideo, isPaused, autoPlay, goToNext]);

  // Auto-slide Timer & Progress Tracker
  useEffect(() => {
    if (!autoPlay || !hasMultiple) {
      setProgress(0);
      return;
    }

    if (isPaused) {
      // While paused, freeze progress
      if (videoRef.current && isVideo) {
        videoRef.current.pause();
      }
      return;
    }

    if (videoRef.current && isVideo) {
      videoRef.current.play().catch(() => {});
    }

    const duration = isVideo ? videoDuration : DEFAULT_IMAGE_DURATION;
    startTimeRef.current = Date.now() - elapsedBeforePauseRef.current;

    const tickInterval = 40; // 25fps progress updates for smoothness
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(progressIntervalRef.current);
        goToNext();
      }
    }, tickInterval);

    return () => {
      clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPaused, autoPlay, hasMultiple, isVideo, videoDuration, goToNext]);

  // Pause interactions
  const handleMouseEnter = () => {
    if (startTimeRef.current > 0) {
      elapsedBeforePauseRef.current = Date.now() - startTimeRef.current;
    }
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };

  const handleTouchStart = () => {
    if (startTimeRef.current > 0) {
      elapsedBeforePauseRef.current = Date.now() - startTimeRef.current;
    }
    setIsPaused(true);
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
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
      className={`relative overflow-hidden group select-none ${aspectRatio} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {/* 1. Media Slide Rendering */}
      {isVideo ? (
        <div className="w-full h-full relative bg-black">
          <video
            ref={videoRef}
            src={currentItem.url}
            poster={currentItem.thumbnail_url}
            muted={isMuted}
            playsInline
            autoPlay
            preload="metadata"
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          {/* Subtle Video Reel Indicator Badge */}
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

      {/* 2. Story-Style Top Progress Bars */}
      {showStoryBars && hasMultiple && (
        <div className="absolute top-2.5 inset-x-2.5 z-20 flex gap-1.5 px-0.5 pointer-events-none">
          {mediaList.map((item, idx) => {
            let fillPct = 0;
            if (idx < currentIndex) {
              fillPct = 100;
            } else if (idx === currentIndex) {
              fillPct = progress;
            } else {
              fillPct = 0;
            }

            return (
              <div
                key={item.id || idx}
                className="h-1 flex-1 bg-black/30 backdrop-blur-xs rounded-full overflow-hidden shadow-xs"
              >
                <div
                  className="h-full bg-white/95 rounded-full transition-all duration-75 ease-linear"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Navigation Arrows (Desktop hover) */}
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

      {/* 4. Tap Zones for Mobile Navigation */}
      {hasMultiple && (
        <div className="sm:hidden absolute inset-0 z-10 flex pointer-events-auto">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
          />
          <div className="w-1/3 h-full pointer-events-none" />
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          />
        </div>
      )}

      {/* 5. Sound Toggle (When Video is Active) */}
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

      {/* 6. Media Counter Pill */}
      {hasMultiple && (
        <div className="absolute bottom-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium font-mono pointer-events-none opacity-0 group-hover:opacity-100 transition duration-200">
          {currentIndex + 1} / {mediaList.length}
        </div>
      )}
    </div>
  );
}
