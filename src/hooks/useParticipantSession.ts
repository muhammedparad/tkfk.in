'use client';

import { useState, useEffect } from 'react';
import { safeStorage } from '@/lib/storage';

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
  try {
    if (typeof window === 'undefined') return null;
    const raw = safeStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const isConfirmed = Boolean(
      parsed && 
      parsed.isLoggedIn && 
      parsed.participant && 
      parsed.participant.participant_id &&
      (parsed.participant.status === 'ACTIVE' || parsed.registration?.payment_status === 'SUCCESS' || parsed.registration?.registration_status === 'CONFIRMED' || parsed.isLoggedIn)
    );

    if (isConfirmed) {
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
  try {
    if (typeof window === 'undefined') return;
    const hasParticipantId = Boolean(data.participant && data.participant.participant_id);
    const isConfirmed = Boolean(
      hasParticipantId &&
      (data.participant.status === 'ACTIVE' || data.registration?.payment_status === 'SUCCESS' || data.registration?.registration_status === 'CONFIRMED' || !data.participant.status)
    );

    if (isConfirmed) {
      safeStorage.setItem(
        CACHE_KEY,
        JSON.stringify({
          isLoggedIn: true,
          participant: {
            ...data.participant,
            status: data.participant.status || 'ACTIVE'
          },
          registration: data.registration || null,
          updatedAt: Date.now(),
        })
      );
    } else {
      safeStorage.removeItem(CACHE_KEY);
    }
    window.dispatchEvent(new Event('tkfk_session_updated'));
  } catch {}
}

export function clearParticipantSessionCache() {
  try {
    if (typeof window === 'undefined') return;
    safeStorage.removeItem(CACHE_KEY);
    safeStorage.removeItem('tkfk_participant_session');
    safeStorage.removeItem('tkfk26_participant');
    safeStorage.removeItem('gkc26_participant');
    window.dispatchEvent(new Event('tkfk_session_updated'));
  } catch {}
}

export function useParticipantSession(): ParticipantSessionState {
  // Always initialize with safe server-matching default to avoid hydration error #418
  const [state, setState] = useState<ParticipantSessionState>({
    isLoggedIn: false,
    participant: null,
    registration: null,
    loading: false,
  });

  useEffect(() => {
    let isMounted = true;

    // Load from local storage cache after hydration
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

    // Only verify with server if a cached session exists
    if (!cached) {
      return () => {
        isMounted = false;
        window.removeEventListener('tkfk_session_updated', handleSessionUpdated);
      };
    }

    // Background Stale-While-Revalidate check
    async function revalidateSession() {
      try {
        const res = await fetch('/api/participant/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });

        if (res.ok) {
          const data = await res.json();
          const isConfirmed = Boolean(
            data.isConfirmed ||
            (data.participant && 
             data.participant.participant_id &&
             (data.participant.status === 'ACTIVE' || data.registration?.payment_status === 'SUCCESS' || data.registration?.registration_status === 'CONFIRMED'))
          );

          if (isMounted && data.participant && isConfirmed) {
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
          } else if (isMounted && !data.participant) {
            clearParticipantSessionCache();
            setState({
              isLoggedIn: false,
              participant: null,
              registration: null,
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
        // Network offline or error: retain state
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
