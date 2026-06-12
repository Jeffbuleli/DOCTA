import { useEffect, useState } from 'react';

/** Mini-routeur sans dependance : navigation par history API. */
export function navigate(to: string) {
  window.history.pushState({}, '', to);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePath(): string {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => {
    const on = () => setPath(window.location.pathname);
    window.addEventListener('popstate', on);
    return () => window.removeEventListener('popstate', on);
  }, []);
  return path;
}

export function queryParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}
