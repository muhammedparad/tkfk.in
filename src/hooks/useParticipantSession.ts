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
  } | null;
  registration: {
    id: string;
    payment_status: string;
    registration_status: string;
  } | null;
  loading: boolean;
}

export function useParticipantSession(): ParticipantSessionState {
  const [state, setState] = useState<ParticipantSessionState>({
    isLoggedIn: false,
    participant: null,
    registration: null,
    loading: true,
  });

  useEffect(() => {
    let isMounted = true;
    async function checkSession() {
      try {
        const res = await fetch('/api/participant/me', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.participant) {
            setState({
              isLoggedIn: true,
              participant: data.participant,
              registration: data.registration || null,
              loading: false,
            });
            return;
          }
        }
      } catch {}

      if (isMounted) {
        setState({
          isLoggedIn: false,
          participant: null,
          registration: null,
          loading: false,
        });
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
