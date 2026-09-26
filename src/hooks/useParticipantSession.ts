'use client';

import { useState, useEffect } from 'react';

export interface ParticipantSessionState {
  isLoggedIn: boolean;
  participant: {
    id: string;
    participant_id: string | null;
    name: string;
    email: string;
    status: string;
    college?: string;
    state?: string;
    city?: string;
  } | null;
  registration: {
    id: string;
    payment_status: string;
    registration_status: string;
  } | null;
  loading: boolean;
}

const CACHE_KEY = 'tkfk_participant_session_v1';

export function getCachedParticipantSession(): ParticipantSessionState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.isLoggedIn && parsed.participant) {
      return {
        isLoggedIn: true,
        participant: parsed.participant,
        registration: parsed.registration || null,
        loading: false,
      };
    }
  } catch {}
  return null;
}

export function saveParticipantSessionCache(data: {
  participant: any;
  registration?: any;
}) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        isLoggedIn: true,
        participant: data.participant,
        registration: data.registration || null,
        updatedAt: Date.now(),
      })
    );
    window.dispatchEvent(new Event('tkfk_session_updated'));
  } catch {}
}

export function clearParticipantSessionCache() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem('tkfk_participant_session');
    localStorage.removeItem('tkfk26_participant');
    localStorage.removeItem('gkc26_participant');
    window.dispatchEvent(new Event('tkfk_session_updated'));
  } catch {}
}

export function useParticipantSession(): ParticipantSessionState {
  const [state, setState] = useState<ParticipantSessionState>(() => {
    const cached = getCachedParticipantSession();
    if (cached) return cached;
    return {
      isLoggedIn: false,
      participant: null,
      registration: null,
      loading: true,
    };
  });

  useEffect(() => {
    let isMounted = true;

    // Immediately hydrate from local storage cache at 0ms
    const cached = getCachedParticipantSession();
    if (cached && isMounted) {
      setState(cached);
    }

    const handleSessionUpdated = () => {
      const updated = getCachedParticipantSession();
      if (updated && isMounted) {
        setState(updated);
      } else if (isMounted) {
        setState({
          isLoggedIn: false,
          participant: null,
          registration: null,
          loading: false,
        });
      }
    };

    window.addEventListener('tkfk_session_updated', handleSessionUpdated);

    // Background Stale-While-Revalidate check
    async function revalidateSession() {
      try {
        const res = await fetch('/api/participant/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.participant) {
            saveParticipantSessionCache({
              participant: data.participant,
              registration: data.registration || null,
            });
            setState({
              isLoggedIn: true,
              participant: data.participant,
              registration: data.registration || null,
              loading: false,
            });
            return;
          }
        } else if (res.status === 401 || res.status === 403 || res.status === 404) {
          // Explicitly unauthenticated / session expired
          if (isMounted) {
            clearParticipantSessionCache();
            setState({
              isLoggedIn: false,
              participant: null,
              registration: null,
              loading: false,
            });
          }
        }
      } catch {
        // Network offline or error: keep cached session if available, stop loading
        if (isMounted) {
          setState((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    revalidateSession();

    return () => {
      isMounted = false;
      window.removeEventListener('tkfk_session_updated', handleSessionUpdated);
    };
  }, []);

  return state;
}
