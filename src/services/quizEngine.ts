import 'server-only';
import { DBService } from '@/services/db';
import { QuizSession, ClientQuestion, ResultsReleaseConfig } from '@/types';
import { EVENT_CONFIG, isQuizWindowOpen } from '@/lib/config';

export class QuizEngineService {
  /**
   * Initialize or retrieve Quiz Session for participant (Server managed window & frozen question set)
   * Entry Window: 3:00 PM – 6:00 PM IST.
   * If a user enters at 6:00 PM, they get their full 25-minute session duration (until 6:25 PM).
   * No user can enter or start a new attempt after 6:00 PM.
   */
  static async startSession(participantId: string, bypassDateGating: boolean = false): Promise<{
    session: QuizSession;
    questions: ClientQuestion[];
  }> {
    // 1. Check if participant already has a quiz session started
    const existingSession = await DBService.getQuizSessionByParticipantId(participantId);

    if (existingSession) {
      // Participant already entered before/at 6:00 PM
      // If already finalized (SUBMITTED or EXPIRED), return terminal state
      if (existingSession.status === 'SUBMITTED' || existingSession.status === 'EXPIRED') {
        return {
          session: existingSession,
          questions: []
        };
      }

      // Check if this participant's individual 25-minute timer has expired
      const now = Date.now();
      const exp = new Date(existingSession.expires_at).getTime();
      if (now > exp) {
        const expiredSession = await DBService.submitQuizSession(existingSession.id);
        return {
          session: expiredSession,
          questions: []
        };
      }

      // Existing active session is within its 25-minute window! Allow continued answering even past 6:00 PM.
      const questions = await DBService.getFrozenSessionClientQuestions(existingSession.id);
      return {
        session: existingSession,
        questions
      };
    }

    // 2. No existing session -> Participant is trying to ENTER/START for the first time.
    // Must be within entry window (3:00 PM – 6:00 PM IST) unless bypassed by admin.
    if (!bypassDateGating && !isQuizWindowOpen()) {
      const now = Date.now();
      const open = new Date(EVENT_CONFIG.quiz_open_at).getTime();
      if (now < open) {
        throw new Error(`The quiz portal is locked. Competition will open at ${EVENT_CONFIG.quizTimingDisplay} on ${EVENT_CONFIG.eventDateDisplay}.`);
      } else {
        throw new Error(`The quiz entry window is closed. Quiz entry was permitted between ${EVENT_CONFIG.quizTimingDisplay} on ${EVENT_CONFIG.eventDateDisplay}. New attempts cannot be started after 6:00 PM IST.`);
      }
    }

    const { session } = await DBService.getOrCreateQuizSession(participantId);

    // If session is terminal (SUBMITTED or EXPIRED), return session with no questions
    if (session.status === 'SUBMITTED' || session.status === 'EXPIRED') {
      return {
        session,
        questions: []
      };
    }

    // Retrieve frozen snapshot questions for this participant's session (Issue 12)
    const questions = await DBService.getFrozenSessionClientQuestions(session.id);

    return {
      session,
      questions
    };
  }

  /**
   * Auto-save answer to server with session ownership & frozen question validation (Issue 11)
   */
  static async autoSaveAnswer(
    sessionId: string, 
    questionId: string, 
    option: 'A' | 'B' | 'C' | 'D',
    participantId?: string
  ): Promise<boolean> {
    return DBService.saveAnswer(sessionId, questionId, option, participantId);
  }

  /**
   * Submit quiz session (Idempotent state machine - Issue 14 & 15)
   */
  static async submitSession(sessionId: string): Promise<QuizSession> {
    return DBService.submitQuizSession(sessionId);
  }

  /**
   * Controlled release status
   */
  static async getReleaseConfig(): Promise<ResultsReleaseConfig> {
    return DBService.getResultsReleaseConfig();
  }
}
