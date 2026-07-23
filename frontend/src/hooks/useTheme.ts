import { useState, useEffect } from 'react';

import { flushSync } from 'react-dom';

export type ThemeMode = 'dark' | 'light';

function createRippleFallback(x: number, y: number, nextTheme: ThemeMode) {
  const ripple = document.createElement('div');
  ripple.className = 'theme-ripple-fallback';
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.style.width = `${endRadius * 2}px`;
  ripple.style.height = `${endRadius * 2}px`;
  ripple.style.backgroundColor = nextTheme === 'light' ? '#f8fafc' : '#030712';
  document.body.appendChild(ripple);

  const anim = ripple.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0.9 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
    ],
    {
      duration: 450,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  );

  anim.onfinish = () => {
    ripple.remove();
  };
}

function getEventCoordinates(event?: unknown): { x: number; y: number } {
  if (event && typeof event === 'object') {
    const e = event as Record<string, unknown>;
    if (typeof e.clientX === 'number' && typeof e.clientY === 'number' && e.clientX !== 0) {
      return { x: e.clientX, y: e.clientY };
    }
    if (
      e.nativeEvent &&
      typeof (e.nativeEvent as Record<string, unknown>).clientX === 'number' &&
      (e.nativeEvent as Record<string, unknown>).clientX !== 0
    ) {
      const ne = e.nativeEvent as Record<string, unknown>;
      return { x: ne.clientX as number, y: ne.clientY as number };
    }
    if (
      e.currentTarget &&
      typeof (e.currentTarget as HTMLElement).getBoundingClientRect === 'function'
    ) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
    if (e.target && typeof (e.target as HTMLElement).getBoundingClientRect === 'function') {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }
  }
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = (event?: unknown) => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const { x, y } = getEventCoordinates(event);

    const isAppearanceTransition =
      'startViewTransition' in document &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isAppearanceTransition) {
      createRippleFallback(x, y, nextTheme);
      setTheme(nextTheme);
      return;
    }

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    document.documentElement.classList.add('theme-transitioning');

    const transition = document.startViewTransition(() => {
      flushSync(() => {
        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
      });
    });

    transition.ready.then(() => {
      const clipPath = [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`];

      const anim = document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      );

      anim.onfinish = () => {
        document.documentElement.classList.remove('theme-transitioning');
      };
    });
  };

  return { theme, toggleTheme };
}
