import { useSyncExternalStore } from "react";

function subscribe(callback) {
    const mediaQuery = window.matchMedia('(max-width: 640px)');
    mediaQuery.addEventListener('change', callback);
    return () => mediaQuery.removeEventListener('change', callback);
}

function getSnapshot() {
    return window.matchMedia('(max-width: 640px)').matches;
}

export function useIsMobile() {
    return useSyncExternalStore(subscribe, getSnapshot);
}

function subscribeDesktop(callback) {
  const mediaQuery = window.matchMedia('(min-width: 1024px)');
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
}

function getDesktopSnapshot() {
  return window.matchMedia('(min-width: 1024px)').matches;
}

export function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, getDesktopSnapshot);
}