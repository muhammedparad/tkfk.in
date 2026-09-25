import 'server-only';
import { DBService } from '@/services/db';
import { QuizSession, ClientQuestion, ResultsReleaseConfig } from '@/types';
import { EVENT_CONFIG, isQuizWindowOpen } from '@/lib/config';

export class QuizEngineService {
  /**
   * Initialize or retrieve Quiz Session for participant (Server managed window & frozen question set)
   */
  static async startSession(participantId: string): Promise<{
    session: QuizSession;
    questions: ClientQuestion[];
  }> {
    // Authoritative Server-side Date Gating Check (Issue 16 & 17)
    if (!isQuizWindowOpen()) {
      throw new Error(`The quiz portal is locked. Competition will open on ${EVENT_CONFIG.eventDateDisplay}.`);
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
