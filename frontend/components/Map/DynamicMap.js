'use client';
/**
 * Wrapper that uses next/dynamic to client-only render AmbulanceMap.
 * Import THIS component in pages, not AmbulanceMap directly.
 */
import dynamic from 'next/dynamic';

const AmbulanceMapNoSSR = dynamic(() => import('./AmbulanceMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-2xl bg-dark-surface flex items-center justify-center animate-pulse">
      <div className="text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-sm text-[var(--muted)]">Loading map...</p>
      </div>
    </div>
  ),
});

export default AmbulanceMapNoSSR;
