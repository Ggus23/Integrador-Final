'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function BackgroundMusic() {
  const { user } = useAuth();
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [apiLoaded, setApiLoaded] = useState(false);

  useEffect(() => {
    // Load YouTube Iframe API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        setApiLoaded(true);
      };
    } else if (window.YT && window.YT.Player) {
      setApiLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!apiLoaded || !containerRef.current) return;

    if (user) {
      if (!playerRef.current) {
        // Create an inner div because YT.Player replaces the target element
        const innerDiv = document.createElement('div');
        containerRef.current.appendChild(innerDiv);

        playerRef.current = new window.YT.Player(innerDiv, {
          height: '200', // Normal size to avoid browser optimizations that mute invisible frames
          width: '200',
          videoId: '6H-PLF2CR18',
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: '6H-PLF2CR18',
            controls: 0,
            disablekb: 1,
            playsinline: 1,
          },
          events: {
            onReady: (event: any) => {
              event.target.setVolume(50);
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                event.target.playVideo();
              }
            },
            onError: (event: any) => {
              console.error('YouTube Player Error:', event.data);
            },
          },
        });
      } else {
        if (typeof playerRef.current.playVideo === 'function') {
          playerRef.current.playVideo();
        }
      }
    } else {
      if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
        playerRef.current.pauseVideo();
      }
    }
  }, [user, apiLoaded]);

  return (
    <div
      style={{
        position: 'fixed',
        top: '-9999px',
        left: '-9999px',
        width: '200px',
        height: '200px',
        opacity: 0.01,
        pointerEvents: 'none',
        zIndex: -9999,
      }}
    >
      <div ref={containerRef}></div>
    </div>
  );
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}
