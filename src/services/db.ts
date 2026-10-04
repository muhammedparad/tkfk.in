import 'server-only';
import { 
  Participant, 
  Registration, 
  ReferralCode, 
  Question, 
  ClientQuestion, 
  QuizSession, 
  QuizSessionQuestion,
  QuizAnswer, 
  Certificate, 
  Announcement, 
  AuditLog, 
  ResultsReleaseConfig,
  PaymentStatus,
  RegistrationStatus,
  SessionStatus,
  PaymentTransaction,
  PaymentEvent,
  ProctoringStreamItem,
  ProctoringActionRequest
} from '@/types';
import crypto from 'crypto';
import { isSupabaseMode, validateDatabaseConfig, supabaseAdmin } from '@/lib/supabase';
import { generateParticipantId, generateVerificationHash, generateCertificateCode, normalizePhoneNumber } from '@/lib/utils';
import { EVENT_CONFIG } from '@/lib/config';
import { 
  OFFICIAL_50_QUESTIONS, 
  PREVIOUS_ORIGINAL_50_QUESTIONS, 
  CURRENT_RECONDUCT_50_QUESTIONS, 
  ADMIN_QUESTION_BANKS 
} from '@/data/questions';

function shuffleWithSeed<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    hash = Math.imul(16807, hash) % 2147483647;
    const j = Math.abs(hash) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function normalizeQuestionId(qId: string): string {
  if (!qId) return qId;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(qId)) {
    return qId;
  }
  const num = parseInt(qId.replace(/[^0-9]/g, ''), 10) || 1;
  return `00000000-0000-0000-0000-${String(num).padStart(12, '0')}`;
}

// =========================================================================
// [DEVELOPMENT ONLY] MOCK IN-MEMORY TEST DATABASE STORE (Used ONLY when DATA_MODE=mock)
// =========================================================================

const INITIAL_QUESTIONS: Question[] = OFFICIAL_50_QUESTIONS;

// [DEVELOPMENT ONLY] In-memory mock database store
const mockStore = {
  participants: [
    {
      id: "p-101",
      participant_id: "TKFK26-004821",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      phone: "9876543210",
      college: "General Participant",
      state: "Kerala",
      city: "Thiruvananthapuram",
      referral_code: "TKFK-A81F",
      status: "ACTIVE" as const,
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "p-102",
      participant_id: "TKFK26-004822",
      name: "Ananya Nair",
      email: "ananya.nair@example.com",
      phone: "9876543211",
      college: "Kochi Resident",
      state: "Kerala",
      city: "Kochi",
      referral_code: "TKFK-7C22",
      status: "ACTIVE" as const,
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
  ] as Participant[],
  registrations: [
    {
      id: "r-101",
      participant_id: "p-101",
      registration_status: "CONFIRMED" as const,
      payment_status: "SUCCESS" as const,
      payment_reference: "PAY_MOCK_994812",
      amount: 99,
      currency: "INR",
      confirmed_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: "r-102",
      participant_id: "p-102",
      registration_status: "CONFIRMED" as const,
      payment_status: "SUCCESS" as const,
      payment_reference: "PAY_MOCK_994813",
      amount: 99,
      currency: "INR",
      confirmed_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    }
  ] as Registration[],
  referralCodes: [
    { id: "ref-1", code: "TKFK-A81F", active: true, usage_count: 83, created_at: new Date().toISOString() },
    { id: "ref-2", code: "TKFK-7C22", active: true, usage_count: 71, created_at: new Date().toISOString() },
    { id: "ref-3", code: "TKFK-B91D", active: true, usage_count: 64, created_at: new Date().toISOString() },
  ] as ReferralCode[],
  questions: INITIAL_QUESTIONS,
  quizSessions: [] as QuizSession[],
  quizSessionQuestions: [] as QuizSessionQuestion[],
  quizAnswers: [] as QuizAnswer[],
  certificates: [] as Certificate[],
  announcements: [
    {
      id: "ann-1",
      title: "Welcome to Gandhi Knowledge Challenge 2026!",
      body: "Official study materials are now live. Prepare well for the October 2, 2026 competition!",
      published: true,
      created_at: new Date().toISOString()
    }
  ] as Announcement[],
  auditLogs: [
    {
      id: "log-1",
      admin_user_id: "admin-system",
      action: "SYSTEM_INIT",
      entity_type: "SYSTEM",
      entity_id: "INIT",
      metadata: { note: "Database initialized" },
      created_at: new Date().toISOString()
    }
  ] as AuditLog[],
  resultsReleaseConfig: {
    published: false,
    note: "Official results verification in progress by TKFK academic committee."
  } as ResultsReleaseConfig,
  paymentTransactions: [] as PaymentTransaction[],
  paymentEvents: [] as PaymentEvent[]
};

// =========================================================================
// SERVICE METHODS
// =========================================================================

export class DBService {
  
  // -----------------------------------------------------------------------
  // PARTICIPANT AUTHENTICATION & REGISTRATION
  // -----------------------------------------------------------------------

  /**
   * Authenticate Participant using Participant ID (TKFK26-XXXXXX) AND Email or Phone
   */
  static async authenticateParticipant(participantId: string, identifier: string): Promise<Participant | null> {
    const cleanId = participantId.trim().toUpperCase();
    const cleanIdent = identifier.trim().toLowerCase();
    const cleanPhone = normalizePhoneNumber(identifier);

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      
      const { data, error } = await supabaseAdmin!
        .from('participants')
        .select('*')
        .eq('participant_id', cleanId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const matchEmail = data.email && data.email.trim().toLowerCase() === cleanIdent;
      const matchPhone = (data.phone && data.phone.trim() === cleanIdent) || 
                         (cleanPhone.length === 10 && (normalizePhoneNumber(data.phone) === cleanPhone || data.normalized_phone === cleanPhone));

      if (matchEmail || matchPhone) {
        return data;
      }
      return null;
    } else {
      // [DEVELOPMENT ONLY] Mock mode
      const found = mockStore.participants.find(p => 
        p.participant_id && p.participant_id.toUpperCase() === cleanId &&
        (p.email.toLowerCase() === cleanIdent || normalizePhoneNumber(p.phone) === cleanPhone || p.phone.trim() === cleanIdent)
      );
      return found || null;
    }
  }

  /**
   * Get Participant by ID or Participant_Id
   */
  static async getParticipantById(idOrParticipantId: string): Promise<Participant | null> {
    if (!idOrParticipantId) return null;
    const clean = idOrParticipantId.trim();
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      
      // 1. If it starts with official prefix, check participant_id first
      if (clean.toUpperCase().startsWith('TKFK') || clean.toUpperCase().startsWith('GKC')) {
        const { data: byPid, error: pidErr } = await supabaseAdmin!
          .from('participants')
          .select('*')
          .eq('participant_id', clean.toUpperCase())
          .maybeSingle();

        if (pidErr) throw pidErr;
        if (byPid) return byPid;
      }

      // 2. Query by primary key id (UUID / text)
      const { data: byId, error: idErr } = await supabaseAdmin!
        .from('participants')
        .select('*')
        .eq('id', clean)
        .maybeSingle();

      if (!idErr && byId) return byId;

      // 3. Fallback: Query by participant_id regardless of prefix
      const { data: byPidFallback, error: pidFallbackErr } = await supabaseAdmin!
        .from('participants')
        .select('*')
        .eq('participant_id', clean.toUpperCase())
        .maybeSingle();

      if (pidFallbackErr) throw pidFallbackErr;
      return byPidFallback;
    } else {
      return mockStore.participants.find(p => p.id === clean || (p.participant_id && p.participant_id.toUpperCase() === clean.toUpperCase())) || null;
    }
  }

  /**
   * Create new Participant registration record (Status defaults to PENDING prior to payment verification)
   */
  static async createRegistration(data: {
    name: string;
    email: string;
    phone: string;
    state: string;
    city?: string;
    college?: string;
    referral_code?: string;
  }): Promise<{ participant: Participant; registration: Registration; status: 'NEW' | 'PENDING' | 'ALREADY_REGISTERED' }> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedPhone = normalizePhoneNumber(data.phone);
    const normalizedRef = data.referral_code ? data.referral_code.trim().toUpperCase() : undefined;

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      // Check for existing participant
      const { data: existingP } = await supabaseAdmin!
        .from('participants')
        .select('*')
        .or(`email.ilike.${normalizedEmail},phone.eq.${normalizedPhone},normalized_phone.eq.${normalizedPhone}`)
        .maybeSingle();

      if (existingP) {
        const { data: existingReg } = await supabaseAdmin!
          .from('registrations')
          .select('*')
          .eq('participant_id', existingP.id)
          .maybeSingle();

        if (existingReg?.payment_status === 'SUCCESS' || existingP.status === 'ACTIVE') {
          return { participant: existingP, registration: existingReg!, status: 'ALREADY_REGISTERED' };
        }

        // Previous attempt was not paid (PENDING / FAILED / CANCELLED). Update with fresh info and reset to PENDING.
        await supabaseAdmin!
          .from('participants')
          .update({
            name: data.name.trim(),
            state: data.state.trim(),
            city: data.city?.trim() || null,
            college: data.college?.trim() || null,
            referral_code: normalizedRef || null,
            status: 'PENDING'
          })
          .eq('id', existingP.id);

        if (existingReg) {
          const { data: updatedReg } = await supabaseAdmin!
            .from('registrations')
            .update({
              payment_status: 'PENDING',
              registration_status: 'PENDING',
              amount: 99,
              currency: 'INR',
              payment_reference: null,
              confirmed_at: null
            })
            .eq('id', existingReg.id)
            .select()
            .single();

          const { data: updatedPart } = await supabaseAdmin!
            .from('participants')
            .select('*')
            .eq('id', existingP.id)
            .single();

          return { participant: updatedPart || existingP, registration: updatedReg || existingReg, status: 'PENDING' };
        }
      }

      // Do NOT generate participant ID prior to payment confirmation
      let rpcRes: any = null;
      try {
        const res = await supabaseAdmin!.rpc('create_participant_with_registration', {
          p_participant_id: null,
          p_name: data.name.trim(),
          p_email: normalizedEmail,
          p_phone: normalizedPhone,
          p_state: data.state.trim(),
          p_city: data.city?.trim() || null,
          p_college: data.college?.trim() || null,
          p_referral_code: normalizedRef || null,
          p_amount: 99,
          p_currency: 'INR'
        });

        if (!res.error && res.data) {
          rpcRes = res.data;
        }
      } catch (rpcErr) {
        console.warn('[CREATE REGISTRATION RPC FAILED, USING FALLBACK]', rpcErr);
      }

      if (rpcRes) {
        return rpcRes as { participant: Participant; registration: Registration; status: 'NEW' | 'PENDING' | 'ALREADY_REGISTERED' };
      }

      // Fallback if RPC is unavailable: JS level atomic insert (with rollback on error)
      const { data: participant, error: pErr } = await supabaseAdmin!
        .from('participants')
        .insert({
          participant_id: null,
          name: data.name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          normalized_phone: normalizedPhone,
          state: data.state.trim(),
          city: data.city?.trim(),
          college: data.college?.trim(),
          referral_code: normalizedRef,
          status: 'PENDING'
        })
        .select()
        .single();

      if (pErr) throw pErr;

      // Insert registration with rollback if it fails
      const { data: registration, error: rErr } = await supabaseAdmin!
        .from('registrations')
        .insert({
          participant_id: participant.id,
          registration_status: 'PENDING',
          payment_status: 'PENDING',
          amount: 99,
          currency: 'INR'
        })
        .select()
        .single();

      if (rErr) {
        // Rollback inserted participant record to maintain atomicity (Issue 32)
        await supabaseAdmin!.from('participants').delete().eq('id', participant.id);
        throw rErr;
      }

      return { participant, registration, status: 'NEW' };

    } else {
      // [DEVELOPMENT ONLY] Mock mode
      const existingP = mockStore.participants.find(
        p => p.email.toLowerCase() === normalizedEmail || normalizePhoneNumber(p.phone) === normalizedPhone
      );

      if (existingP) {
        const existingReg = mockStore.registrations.find(r => r.participant_id === existingP.id);
        if (existingReg?.payment_status === 'SUCCESS') {
          return { participant: existingP, registration: existingReg!, status: 'ALREADY_REGISTERED' };
        }
        if (existingReg) {
          return { participant: existingP, registration: existingReg, status: 'PENDING' };
        }
      }

      const mockUniqueId = crypto.randomUUID();

      const newParticipant: Participant = {
        id: `p-mock-${mockUniqueId}`,
        participant_id: null,
        name: data.name.trim(),
        email: normalizedEmail,
        phone: normalizedPhone,
        state: data.state.trim(),
        city: data.city?.trim(),
        college: data.college?.trim(),
        referral_code: normalizedRef,
        status: 'PENDING',
        created_at: new Date().toISOString()
      };

      const newRegistration: Registration = {
        id: `r-mock-${mockUniqueId}`,
        participant_id: newParticipant.id,
        registration_status: 'PENDING',
        payment_status: 'PENDING',
        amount: 99,
        currency: 'INR',
        created_at: new Date().toISOString()
      };

      mockStore.participants.push(newParticipant);
      mockStore.registrations.push(newRegistration);

      if (normalizedRef) {
        const refObj = mockStore.referralCodes.find(r => r.code === normalizedRef);
        if (refObj) {
          refObj.usage_count += 1;
        } else {
          mockStore.referralCodes.push({
            id: `ref-mock-${mockUniqueId}`,
            code: normalizedRef,
            active: true,
            usage_count: 1,
            created_at: new Date().toISOString()
          });
        }
      }

      return { participant: newParticipant, registration: newRegistration, status: 'NEW' };
    }
  }

  /**
   * Get Registration details for a participant
   */
  static async getRegistrationByParticipantId(participantUuid: string): Promise<Registration | null> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('registrations')
        .select('*')
        .eq('participant_id', participantUuid)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } else {
      return mockStore.registrations.find(r => r.participant_id === participantUuid) || null;
    }
  }

  /**
   * Get Registration by Registration ID
   */
  static async getRegistrationById(id: string): Promise<Registration | null> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('registrations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } else {
      return mockStore.registrations.find(r => r.id === id) || null;
    }
  }

  /**
   * Check if payment reference was previously used (Idempotency check)
   */
  static async isPaymentReferenceUsed(paymentReference: string): Promise<boolean> {
    if (!paymentReference) return false;
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data } = await supabaseAdmin!
        .from('registrations')
        .select('id')
        .eq('payment_reference', paymentReference)
        .eq('payment_status', 'SUCCESS')
        .maybeSingle();

      return Boolean(data);
    } else {
      return mockStore.registrations.some(
        r => r.payment_reference === paymentReference && r.payment_status === 'SUCCESS'
      );
    }
  }

  /**
   * Activate Registration on SUCCESS → Transitions registration_status to CONFIRMED and participant status to ACTIVE
   */
  static async activateConfirmedRegistration(
    registrationId: string, 
    paymentReference: string
  ): Promise<Registration & { participant_id?: string }> {
    const confirmedAt = new Date().toISOString();
    const cleanId = registrationId.trim();

    if (isSupabaseMode()) {
      validateDatabaseConfig();

      let targetParticipantUuid: string | null = null;
      if (cleanId.toUpperCase().startsWith('TKFK26-')) {
        const { data: pData } = await supabaseAdmin!
          .from('participants')
          .select('id')
          .eq('participant_id', cleanId.toUpperCase())
          .maybeSingle();
        if (pData) targetParticipantUuid = pData.id;
      }

      let { data: reg } = await supabaseAdmin!
        .from('registrations')
        .update({
          payment_status: 'SUCCESS',
          registration_status: 'CONFIRMED',
          payment_reference: paymentReference,
          confirmed_at: confirmedAt,
          updated_at: confirmedAt
        })
        .or(targetParticipantUuid 
          ? `participant_id.eq.${targetParticipantUuid},id.eq.${targetParticipantUuid}` 
          : `id.eq.${cleanId},participant_id.eq.${cleanId}`
        )
        .select()
        .maybeSingle();

      const pIdToUpdate = reg?.participant_id || targetParticipantUuid || cleanId;

      // Fetch participant to check if participant_id already exists
      const { data: currentParticipant } = await supabaseAdmin!
        .from('participants')
        .select('id, participant_id')
        .or(`id.eq.${pIdToUpdate},participant_id.eq.${cleanId.toUpperCase()}`)
        .maybeSingle();

      let assignedParticipantId = currentParticipant?.participant_id;

      // If participant_id is not assigned yet, generate a unique one now
      if (!assignedParticipantId) {
        for (let attempt = 0; attempt < 10; attempt++) {
          const candidateId = generateParticipantId();
          const { error: updateErr } = await supabaseAdmin!
            .from('participants')
            .update({ 
              participant_id: candidateId,
              status: 'ACTIVE',
              updated_at: confirmedAt
            })
            .eq('id', currentParticipant?.id || pIdToUpdate);

          if (!updateErr) {
            assignedParticipantId = candidateId;
            break;
          }

          if (!updateErr.message?.includes('duplicate key') && !updateErr.message?.includes('unique constraint')) {
            console.error('[ACTIVATE REGISTRATION ASSIGN ID ERROR]', updateErr);
            break;
          }
        }
      } else {
        await supabaseAdmin!
          .from('participants')
          .update({ status: 'ACTIVE', updated_at: confirmedAt })
          .eq('id', currentParticipant?.id || pIdToUpdate);
      }

      return {
        id: reg?.id || cleanId,
        participant_id: assignedParticipantId || undefined,
        registration_status: 'CONFIRMED',
        payment_status: 'SUCCESS',
        amount: reg?.amount || 99,
        currency: reg?.currency || 'INR',
        payment_reference: paymentReference,
        confirmed_at: confirmedAt,
        created_at: reg?.created_at || confirmedAt
      };

    } else {
      let reg = mockStore.registrations.find(r => r.id === cleanId || r.participant_id === cleanId);
      let participant = mockStore.participants.find(p => p.id === cleanId || (p.participant_id && p.participant_id.toUpperCase() === cleanId.toUpperCase()));
      
      if (!reg && participant) {
        reg = mockStore.registrations.find(r => r.participant_id === participant!.id);
      }

      if (reg) {
        reg.payment_status = 'SUCCESS';
        reg.registration_status = 'CONFIRMED';
        reg.payment_reference = paymentReference;
        reg.confirmed_at = confirmedAt;
      }

      if (participant) {
        if (!participant.participant_id) {
          participant.participant_id = generateParticipantId();
        }
        participant.status = 'ACTIVE';
      }

      return {
        id: reg?.id || cleanId,
        participant_id: participant?.participant_id || cleanId,
        registration_status: 'CONFIRMED',
        payment_status: 'SUCCESS',
        amount: reg?.amount || 99,
        currency: reg?.currency || 'INR',
        payment_reference: paymentReference,
        confirmed_at: confirmedAt,
        created_at: reg?.created_at || confirmedAt
      };
    }
  }

  /**
   * Update Payment & Registration status server-side
   */
  static async updatePaymentStatus(
    registrationId: string, 
    status: PaymentStatus, 
    paymentReference?: string
  ): Promise<Registration> {
    if (status === 'SUCCESS') {
      const activeReg = await this.activateConfirmedRegistration(
        registrationId, 
        paymentReference || `MANUAL_CONFIRMED_${Date.now()}`
      );
      return activeReg;
    }

    const regStatus: RegistrationStatus = (status === 'FAILED' || status === 'REFUNDED' ? 'CANCELLED' : 'PENDING');

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('registrations')
        .update({
          payment_status: status,
          registration_status: regStatus,
          payment_reference: paymentReference || null,
          confirmed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await supabaseAdmin!
          .from('participants')
          .update({ status: 'PENDING' })
          .eq('id', data.participant_id);
      }

      return data;
    } else {
      const reg = mockStore.registrations.find(r => r.id === registrationId);
      if (!reg) throw new Error("Registration record not found");
      reg.payment_status = status;
      reg.registration_status = regStatus;
      if (paymentReference) reg.payment_reference = paymentReference;
      reg.updated_at = new Date().toISOString();

      const participant = mockStore.participants.find(p => p.id === reg.participant_id);
      if (participant) {
        participant.status = 'PENDING';
      }

      return reg;
    }
  }

  // -----------------------------------------------------------------------
  // QUESTIONS & QUIZ ENGINE (Zero secret answer leak to client)
  // -----------------------------------------------------------------------

  static async getClientQuestions(): Promise<ClientQuestion[]> {
    return OFFICIAL_50_QUESTIONS.map(({ id, question_text, question_text_ml, option_a, option_a_ml, option_b, option_b_ml, option_c, option_c_ml, option_d, option_d_ml, category }) => ({
      id,
      question_text,
      question_text_ml,
      option_a,
      option_a_ml,
      option_b,
      option_b_ml,
      option_c,
      option_c_ml,
      option_d,
      option_d_ml,
      category
    }));
  }

  static async getAdminQuestions(bank?: string): Promise<Question[]> {
    if (bank === 'previous' || bank === 'original') {
      return PREVIOUS_ORIGINAL_50_QUESTIONS;
    }
    if (bank === 'current' || bank === 'reconduct') {
      return CURRENT_RECONDUCT_50_QUESTIONS;
    }
    return OFFICIAL_50_QUESTIONS;
  }

  static getAdminQuestionBanks() {
    return ADMIN_QUESTION_BANKS;
  }

  static async createQuestion(data: Omit<Question, 'id'>): Promise<Question> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data: q, error } = await supabaseAdmin!
        .from('questions')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return q;
    } else {
      const newQ: Question = { id: `q-${Date.now()}`, ...data };
      mockStore.questions.push(newQ);
      return newQ;
    }
  }

  static async updateQuestion(id: string, data: Partial<Question>): Promise<Question> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data: q, error } = await supabaseAdmin!
        .from('questions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return q;
    } else {
      const q = mockStore.questions.find(item => item.id === id);
      if (!q) throw new Error("Question not found");
      Object.assign(q, data);
      return q;
    }
  }

  static async deleteQuestion(id: string): Promise<boolean> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { error } = await supabaseAdmin!.from('questions').delete().eq('id', id);
      if (error) throw error;
      return true;
    } else {
      const idx = mockStore.questions.findIndex(q => q.id === id);
      if (idx !== -1) {
        mockStore.questions.splice(idx, 1);
        return true;
      }
      return false;
    }
  }

  // -----------------------------------------------------------------------
  // QUIZ SESSION MANAGEMENT (Server timestamps & auto-save)
  // -----------------------------------------------------------------------

  static async getQuizSessionByParticipantId(idOrParticipantId: string): Promise<QuizSession | null> {
    if (!idOrParticipantId) return null;
    const clean = idOrParticipantId.trim();

    if (isSupabaseMode()) {
      validateDatabaseConfig();

      let targetUuid = clean;
      if (clean.toUpperCase().startsWith('TKFK') || clean.toUpperCase().startsWith('GKC') || clean.toUpperCase().startsWith('ADMIN') || clean.includes('@') || clean.length === 10) {
        const p = await this.getParticipantById(clean);
        if (p) targetUuid = p.id;
      }

      const { data } = await supabaseAdmin!
        .from('quiz_sessions')
        .select('*')
        .eq('participant_id', targetUuid)
        .maybeSingle();

      return data || null;
    } else {
      let targetUuid = clean;
      const p = mockStore.participants.find(item => item.id === clean || item.participant_id === clean || item.phone === clean || item.email.toLowerCase() === clean.toLowerCase());
      if (p) targetUuid = p.id;
      return mockStore.quizSessions.find(s => s.participant_id === targetUuid || s.participant_id === clean) || null;
    }
  }

  static async getQuizSessionById(sessionId: string): Promise<QuizSession | null> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data } = await supabaseAdmin!
        .from('quiz_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      return data || null;
    } else {
      return mockStore.quizSessions.find(s => s.id === sessionId) || null;
    }
  }

  static async getFrozenSessionQuestions(sessionId: string): Promise<QuizSessionQuestion[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      try {
        const { data, error } = await supabaseAdmin!
          .from('quiz_session_questions')
          .select('*')
          .eq('session_id', sessionId)
          .order('question_order', { ascending: true });

        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (e) {
        // Table not present or query failed, fallback to deterministic question sequence
      }

      // Sequential question delivery matching 1-50 official order
      const allQuestions = await this.getAdminQuestions();
      const questionList = allQuestions.slice(0, EVENT_CONFIG.totalQuestions || 50);

      return questionList.map((q, idx) => ({
        id: `sq-${sessionId}-${idx}`,
        session_id: sessionId,
        question_id: q.id,
        question_order: idx + 1,
        question_text: q.question_text,
        question_text_ml: q.question_text_ml,
        option_a: q.option_a,
        option_a_ml: q.option_a_ml,
        option_b: q.option_b,
        option_b_ml: q.option_b_ml,
        option_c: q.option_c,
        option_c_ml: q.option_c_ml,
        option_d: q.option_d,
        option_d_ml: q.option_d_ml,
        correct_option: q.correct_option || 'A',
        category: q.category,
        created_at: new Date().toISOString()
      }));
    } else {
      return mockStore.quizSessionQuestions
        .filter(q => q.session_id === sessionId)
        .sort((a, b) => a.question_order - b.question_order);
    }
  }

  static async getFrozenSessionClientQuestions(sessionId: string): Promise<ClientQuestion[]> {
    const frozen = await this.getFrozenSessionQuestions(sessionId);
    return frozen.map(({ question_id, question_text, question_text_ml, option_a, option_a_ml, option_b, option_b_ml, option_c, option_c_ml, option_d, option_d_ml, category }) => ({
      id: question_id,
      question_text,
      question_text_ml,
      option_a,
      option_a_ml,
      option_b,
      option_b_ml,
      option_c,
      option_c_ml,
      option_d,
      option_d_ml,
      category
    }));
  }

  static async getOrCreateQuizSession(participantId: string, questionBank?: string): Promise<{ session: QuizSession; answers: Record<string, 'A'|'B'|'C'|'D'> }> {
    const durationMs = (EVENT_CONFIG.timeLimitMinutes || 25) * 60 * 1000;

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      
      // 1. Check for existing session
      const { data: existing } = await supabaseAdmin!
        .from('quiz_sessions')
        .select('*')
        .eq('participant_id', participantId)
        .maybeSingle();

      if (existing) {
        const now = Date.now();
        const exp = new Date(existing.expires_at).getTime();
        
        // Auto-finalize & score if past expiry and still IN_PROGRESS (Issue 14)
        if (now > exp && existing.status === 'IN_PROGRESS') {
          const expiredSession = await this.submitQuizSession(existing.id);
          const { data: ansList } = await supabaseAdmin!
            .from('quiz_answers')
            .select('question_id, selected_option')
            .eq('session_id', existing.id);
          const answersMap: Record<string, 'A'|'B'|'C'|'D'> = {};
          ansList?.forEach(a => { answersMap[a.question_id] = a.selected_option as any; });
          return { session: expiredSession, answers: answersMap };
        }

        const { data: ansList } = await supabaseAdmin!
          .from('quiz_answers')
          .select('question_id, selected_option')
          .eq('session_id', existing.id);

        const answersMap: Record<string, 'A'|'B'|'C'|'D'> = {};
        ansList?.forEach(a => { answersMap[a.question_id] = a.selected_option as any; });

        return { session: existing, answers: answersMap };
      }

      // 2. Create new session with unique constraint protection (Issue 13)
      const started_at = new Date().toISOString();
      const expires_at = new Date(Date.now() + durationMs).toISOString();

      let newSession: QuizSession;
      try {
        const { data: inserted, error: insertErr } = await supabaseAdmin!
          .from('quiz_sessions')
          .insert({
            participant_id: participantId,
            started_at,
            expires_at,
            status: 'IN_PROGRESS',
            total_questions: EVENT_CONFIG.totalQuestions || 50
          })
          .select()
          .single();

        if (insertErr) {
          if (insertErr.code === '23505' || insertErr.message?.toLowerCase().includes('unique') || insertErr.message?.toLowerCase().includes('duplicate')) {
            const { data: fetchDup } = await supabaseAdmin!
              .from('quiz_sessions')
              .select('*')
              .eq('participant_id', participantId)
              .single();
            if (fetchDup) return { session: fetchDup, answers: {} };
          }
          throw insertErr;
        }
        newSession = inserted;
      } catch (err: any) {
        const { data: fallbackExisting } = await supabaseAdmin!
          .from('quiz_sessions')
          .select('*')
          .eq('participant_id', participantId)
          .maybeSingle();
        if (fallbackExisting) return { session: fallbackExisting, answers: {} };
        throw err;
      }

      // 3. Freeze question bank for this session (Sequential 1-50 order)
      const allQuestions = await this.getAdminQuestions(questionBank);
      const questionList = allQuestions.slice(0, EVENT_CONFIG.totalQuestions || 50);

      const sessionQuestionsToInsert = questionList.map((q, idx) => ({
        session_id: newSession.id,
        question_id: q.id,
        question_order: idx + 1,
        question_text: q.question_text,
        question_text_ml: q.question_text_ml,
        option_a: q.option_a,
        option_a_ml: q.option_a_ml,
        option_b: q.option_b,
        option_b_ml: q.option_b_ml,
        option_c: q.option_c,
        option_c_ml: q.option_c_ml,
        option_d: q.option_d,
        option_d_ml: q.option_d_ml,
        correct_option: q.correct_option || 'A',
        category: q.category
      }));

      const { error: sqErr } = await supabaseAdmin!
        .from('quiz_session_questions')
        .insert(sessionQuestionsToInsert);

      if (sqErr) {
        console.error('[FREEZE QUESTIONS INSERT ERROR]', sqErr);
      }

      return { session: newSession, answers: {} };

    } else {
      // Mock mode
      let session = mockStore.quizSessions.find(s => s.participant_id === participantId);

      if (session) {
        const now = Date.now();
        const exp = new Date(session.expires_at).getTime();
        if (now > exp && session.status === 'IN_PROGRESS') {
          session = await this.submitQuizSession(session.id);
        }

        const ansList = mockStore.quizAnswers.filter(a => a.session_id === session!.id);
        const answersMap: Record<string, 'A'|'B'|'C'|'D'> = {};
        ansList.forEach(a => { answersMap[a.question_id] = a.selected_option; });
        return { session, answers: answersMap };
      }

      const started_at = new Date().toISOString();
      const expires_at = new Date(Date.now() + durationMs).toISOString();

      session = {
        id: `sess-${Date.now()}`,
        participant_id: participantId,
        started_at,
        expires_at,
        status: 'IN_PROGRESS',
        total_questions: EVENT_CONFIG.totalQuestions || 50
      };

      mockStore.quizSessions.push(session);

      // Freeze questions for mock store
      const allQuestions = await this.getAdminQuestions();
      const shuffled = shuffleWithSeed(allQuestions, participantId).slice(0, EVENT_CONFIG.totalQuestions || 50);
      shuffled.forEach((q, idx) => {
        mockStore.quizSessionQuestions.push({
          id: `sq-${Date.now()}-${idx}`,
          session_id: session!.id,
          question_id: q.id,
          question_order: idx + 1,
          question_text: q.question_text,
          question_text_ml: q.question_text_ml,
          option_a: q.option_a,
          option_a_ml: q.option_a_ml,
          option_b: q.option_b,
          option_b_ml: q.option_b_ml,
          option_c: q.option_c,
          option_c_ml: q.option_c_ml,
          option_d: q.option_d,
          option_d_ml: q.option_d_ml,
          correct_option: q.correct_option || 'A',
          category: q.category,
          created_at: new Date().toISOString()
        });
      });

      return { session, answers: {} };
    }
  }

  static async saveAnswer(
    sessionId: string, 
    questionId: string, 
    selectedOption: 'A'|'B'|'C'|'D',
    participantId?: string
  ): Promise<boolean> {
    if (!['A', 'B', 'C', 'D'].includes(selectedOption)) {
      throw new Error("Invalid option selected");
    }

    const session = await this.getQuizSessionById(sessionId);
    if (!session) {
      throw new Error("Quiz session not found");
    }

    // Verify session owner (Issue 11)
    if (participantId && session.participant_id !== participantId) {
      throw new Error("Unauthorized: Quiz session does not belong to participant");
    }

    // Verify session state is IN_PROGRESS (Issues 11, 14)
    if (session.status !== 'IN_PROGRESS') {
      throw new Error("Cannot save answer: Quiz session is already finalized or expired");
    }

    // Verify session not expired (Issue 11, 14)
    if (Date.now() > new Date(session.expires_at).getTime()) {
      throw new Error("Cannot save answer: Quiz session time has expired");
    }

    // Verify question is assigned to this session (Issue 11)
    const normalizedTargetQId = normalizeQuestionId(questionId);
    const frozenQuestions = await this.getFrozenSessionQuestions(sessionId);
    const isAssigned = frozenQuestions.some(q => normalizeQuestionId(q.question_id) === normalizedTargetQId || q.question_id === questionId);
    if (!isAssigned) {
      throw new Error("Unauthorized: Question is not assigned to this participant session");
    }

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { error } = await supabaseAdmin!
        .from('quiz_answers')
        .upsert({
          session_id: sessionId,
          question_id: normalizedTargetQId,
          selected_option: selectedOption,
          updated_at: new Date().toISOString()
        }, { onConflict: 'session_id,question_id' });

      if (error) throw error;
      return true;
    } else {
      const idx = mockStore.quizAnswers.findIndex(a => a.session_id === sessionId && (a.question_id === questionId || a.question_id === normalizedTargetQId));
      if (idx !== -1) {
        mockStore.quizAnswers[idx].selected_option = selectedOption;
        mockStore.quizAnswers[idx].updated_at = new Date().toISOString();
      } else {
        mockStore.quizAnswers.push({
          id: `ans-${Date.now()}-${Math.random()}`,
          session_id: sessionId,
          question_id: normalizedTargetQId,
          selected_option: selectedOption,
          updated_at: new Date().toISOString()
        });
      }
      return true;
    }
  }

  static async submitQuizSession(sessionId: string): Promise<QuizSession> {
    const session = await this.getQuizSessionById(sessionId);
    if (!session) throw new Error("Quiz session not found");

    // Submission Idempotency: If already terminal (SUBMITTED or EXPIRED), return existing final state (Issue 15)
    if (session.status === 'SUBMITTED' || session.status === 'EXPIRED') {
      return session;
    }

    // Score using frozen question set for this session (Issue 12)
    const frozenQuestions = await this.getFrozenSessionQuestions(sessionId);
    const frozenMap = new Map();
    frozenQuestions.forEach(q => {
      frozenMap.set(q.question_id, q.correct_option);
      frozenMap.set(normalizeQuestionId(q.question_id), q.correct_option);
    });

    const isExpired = Date.now() > new Date(session.expires_at).getTime();
    const finalStatus: SessionStatus = isExpired ? 'EXPIRED' : 'SUBMITTED';
    const submittedAt = isExpired ? session.expires_at : new Date().toISOString();

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data: answers } = await supabaseAdmin!
        .from('quiz_answers')
        .select('*')
        .eq('session_id', sessionId);

      let score = 0;
      answers?.forEach(a => {
        const correct = frozenMap.get(a.question_id) || frozenMap.get(normalizeQuestionId(a.question_id));
        if (correct && correct === a.selected_option) {
          score += 1;
        }
      });

      const { data: updated, error } = await supabaseAdmin!
        .from('quiz_sessions')
        .update({
          status: finalStatus,
          submitted_at: submittedAt,
          score
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return updated;

    } else {
      const answers = mockStore.quizAnswers.filter(a => a.session_id === sessionId);
      let score = 0;
      answers.forEach(a => {
        const correct = frozenMap.get(a.question_id);
        if (correct && correct === a.selected_option) {
          score += 1;
        }
      });

      session.status = finalStatus;
      session.submitted_at = submittedAt;
      session.score = score;
      return session;
    }
  }

  /**
   * Get or create a dedicated sandbox participant for Admin Quiz Testing
   */
  static async getOrCreateAdminTestParticipant(): Promise<Participant> {
    const adminEmail = 'admin-test@tkfk.in';
    const adminPhone = '9999999999';
    const adminPublicId = 'TKFK26-ADMIN99';

    if (isSupabaseMode()) {
      try {
        validateDatabaseConfig();
        const { data: existing } = await supabaseAdmin!
          .from('participants')
          .select('*')
          .or(`email.eq.${adminEmail},participant_id.eq.${adminPublicId}`)
          .maybeSingle();

        if (existing) {
          if (!existing.participant_id) {
            existing.participant_id = adminPublicId;
          }
          return existing;
        }

        const { data: created, error: insertErr } = await supabaseAdmin!
          .from('participants')
          .insert({
            name: 'TKFK Admin Tester',
            email: adminEmail,
            phone: adminPhone,
            normalized_phone: adminPhone,
            state: 'Kerala',
            city: 'Thiruvananthapuram',
            college: 'TKFK Admin Control Center',
            status: 'ACTIVE',
            participant_id: adminPublicId,
            created_at: new Date().toISOString()
          })
          .select()
          .single();

        if (!insertErr && created) {
          try {
            await supabaseAdmin!
              .from('registrations')
              .upsert({
                participant_id: created.id,
                registration_status: 'CONFIRMED',
                payment_status: 'SUCCESS',
                payment_reference: 'ADMIN-TEST-PASS',
                amount: 99,
                currency: 'INR',
                confirmed_at: new Date().toISOString(),
                created_at: new Date().toISOString()
              }, { onConflict: 'participant_id' });
          } catch {}

          return created;
        }
      } catch (err) {
        console.warn('[Supabase Admin Test Participant Fallback]', err);
      }
    }

    let existing = mockStore.participants.find(p => p.email === adminEmail || p.participant_id === adminPublicId);
    if (!existing) {
      existing = {
        id: 'admin-tester-uuid-001',
        name: 'TKFK Admin Tester',
        email: adminEmail,
        phone: adminPhone,
        state: 'Kerala',
        city: 'Thiruvananthapuram',
        college: 'TKFK Admin Control Center',
        status: 'ACTIVE',
        participant_id: adminPublicId,
        created_at: new Date().toISOString()
      };
      mockStore.participants.push(existing);
      mockStore.registrations.push({
        id: 'reg-admin-test-001',
        participant_id: existing.id,
        registration_status: 'CONFIRMED',
        payment_status: 'SUCCESS',
        payment_reference: 'ADMIN-TEST-PASS',
        amount: 99,
        currency: 'INR',
        confirmed_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });
    }
    return existing;
  }

  /**
   * Reset quiz session and answers for a participant (Admin Testing utility)
   */
  static async resetQuizSessionForParticipant(participantId: string): Promise<boolean> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data: sessions } = await supabaseAdmin!
        .from('quiz_sessions')
        .select('id')
        .eq('participant_id', participantId);

      if (sessions && sessions.length > 0) {
        const sessionIds = sessions.map(s => s.id);
        await supabaseAdmin!
          .from('quiz_answers')
          .delete()
          .in('session_id', sessionIds);

        try {
          await supabaseAdmin!
            .from('quiz_session_questions')
            .delete()
            .in('session_id', sessionIds);
        } catch {}

        await supabaseAdmin!
          .from('quiz_sessions')
          .delete()
          .in('id', sessionIds);
      }
      return true;
    } else {
      const sessions = mockStore.quizSessions.filter(s => s.participant_id === participantId);
      const sessionIds = sessions.map(s => s.id);
      mockStore.quizAnswers = mockStore.quizAnswers.filter(a => !sessionIds.includes(a.session_id));
      mockStore.quizSessionQuestions = mockStore.quizSessionQuestions.filter(q => !sessionIds.includes(q.session_id));
      mockStore.quizSessions = mockStore.quizSessions.filter(s => s.participant_id !== participantId);
      return true;
    }
  }

  /**
   * Get list of participant IDs/UUIDs permitted for a second quiz attempt
   */
  static async getRetryWhitelist(): Promise<string[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      try {
        const { data } = await supabaseAdmin!
          .from('system_config')
          .select('value')
          .eq('key', 'allowed_quiz_retries')
          .maybeSingle();
        return (data?.value?.allowedIds as string[]) || [];
      } catch {
        return [];
      }
    } else {
      return (mockStore as any).allowedQuizRetries || [];
    }
  }

  /**
   * Check if participant is explicitly allowed a second attempt, and if so, consume the allowance
   */
  static async checkAndConsumeParticipantRetry(idOrParticipantId: string): Promise<boolean> {
    if (!idOrParticipantId) return false;
    const clean = idOrParticipantId.trim();
    const p = await this.getParticipantById(clean);
    const pUuid = p?.id || clean;
    const pPublicId = p?.participant_id || clean;

    const currentList = await this.getRetryWhitelist();
    const isAllowed = currentList.some(id => 
      id.toLowerCase() === pUuid.toLowerCase() || 
      id.toLowerCase() === pPublicId.toLowerCase() ||
      (p?.phone && id === p.phone) ||
      (p?.email && id.toLowerCase() === p.email.toLowerCase())
    );

    if (!isAllowed) return false;

    // Consume the allowance so they cannot attend a 3rd time
    const updatedList = currentList.filter(id => 
      id.toLowerCase() !== pUuid.toLowerCase() && 
      id.toLowerCase() !== pPublicId.toLowerCase() &&
      (!p?.phone || id !== p.phone) &&
      (!p?.email || id.toLowerCase() !== p.email.toLowerCase())
    );

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      await supabaseAdmin!
        .from('system_config')
        .upsert({ 
          key: 'allowed_quiz_retries', 
          value: { allowedIds: updatedList } 
        }, { onConflict: 'key' });
    } else {
      (mockStore as any).allowedQuizRetries = updatedList;
    }

    return true;
  }

  /**
   * Admin grants a second attempt to a specific participant
   */
  static async grantParticipantRetry(idOrParticipantId: string, adminUserId: string = 'ADMIN'): Promise<{ success: boolean; message: string; participant: Participant | null }> {
    if (!idOrParticipantId) throw new Error('Participant identifier is required');
    const clean = idOrParticipantId.trim();
    const p = await this.getParticipantById(clean);
    if (!p) {
      throw new Error(`Participant "${clean}" not found.`);
    }

    const currentList = await this.getRetryWhitelist();
    if (!currentList.includes(p.id)) {
      currentList.push(p.id);
    }
    if (p.participant_id && !currentList.includes(p.participant_id)) {
      currentList.push(p.participant_id);
    }

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      await supabaseAdmin!
        .from('system_config')
        .upsert({ 
          key: 'allowed_quiz_retries', 
          value: { allowedIds: currentList } 
        }, { onConflict: 'key' });
    } else {
      (mockStore as any).allowedQuizRetries = currentList;
    }

    // Reset previous session so they can cleanly start their 2nd attempt
    await this.resetQuizSessionForParticipant(p.id);

    // Also clear any warning/termination flags in proctoring store
    const store = getGlobalProctoringStore();
    store.delete(p.id);

    await this.logAdminAction(adminUserId, 'GRANT_SECOND_QUIZ_ATTEMPT', 'PARTICIPANT', p.id, {
      participant_id: p.participant_id,
      name: p.name,
      phone: p.phone,
      email: p.email
    });

    return {
      success: true,
      message: `Successfully authorized a 2nd quiz attempt for ${p.name} (${p.participant_id || p.phone}). Previous attempt has been reset and they can now take the quiz once more.`,
      participant: p
    };
  }

  // -----------------------------------------------------------------------
  // CONTROLLED RESULTS RELEASE & CERTIFICATES & LEADERBOARD
  // -----------------------------------------------------------------------

  static async getLeaderboard(): Promise<any[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data: participants } = await supabaseAdmin!
        .from('participants')
        .select('id, participant_id, name, phone, email, state, status');

      const { data: sessions } = await supabaseAdmin!
        .from('quiz_sessions')
        .select('id, participant_id, score, total_questions, status, started_at, submitted_at, expires_at');

      const sessionMap = new Map();
      (sessions || []).forEach(s => {
        const existing = sessionMap.get(s.participant_id);
        if (!existing) {
          sessionMap.set(s.participant_id, s);
        } else {
          if (s.status === 'SUBMITTED' && existing.status !== 'SUBMITTED') {
            sessionMap.set(s.participant_id, s);
          } else if (s.status === 'SUBMITTED' && existing.status === 'SUBMITTED') {
            if ((s.score || 0) > (existing.score || 0)) {
              sessionMap.set(s.participant_id, s);
            } else if ((s.score || 0) === (existing.score || 0) && new Date(s.started_at) > new Date(existing.started_at)) {
              sessionMap.set(s.participant_id, s);
            }
          }
        }
      });

      const bestSessions = Array.from(sessionMap.values());
      const bestSessionIds = bestSessions.map(s => s.id);

      const q5Id = '00000000-0000-0000-0000-000000000005';
      const q17Id = '00000000-0000-0000-0000-000000000017';
      const q20Id = '00000000-0000-0000-0000-000000000020';

      const { data: targetAnswers } = await supabaseAdmin!
        .from('quiz_answers')
        .select('*')
        .in('session_id', bestSessionIds)
        .in('question_id', [q5Id, q17Id, q20Id]);

      const targetAnsMap = new Map();
      targetAnswers?.forEach(a => {
        if (!targetAnsMap.has(a.session_id)) {
          targetAnsMap.set(a.session_id, {});
        }
        targetAnsMap.get(a.session_id)[a.question_id] = a.selected_option;
      });

      const allRows: any[] = [];
      (participants || []).forEach(p => {
        if (p.participant_id === 'TKFK26-ADMIN99' || p.email?.includes('admin@tkfk.in') || p.name?.includes('Admin Tester')) {
          return;
        }

        const s = sessionMap.get(p.id);
        let timeTakenSeconds = 999999;
        let rawScore = -1;
        let score = -1;
        let percentage = 0;
        let validCorrect: number | null = null;
        let validTotal = 50;
        let version = 'Standard 50 Qs';
        let status = 'NOT_ATTEMPTED';
        let startedAt = null;
        let submittedAt = null;

        if (s) {
          status = s.status;
          rawScore = s.score !== null && s.score !== undefined ? s.score : 0;
          startedAt = s.started_at;
          submittedAt = s.submitted_at;

          if (s.started_at && s.submitted_at) {
            timeTakenSeconds = Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000));
          } else if (s.started_at && s.expires_at && s.status === 'EXPIRED') {
            timeTakenSeconds = Math.max(0, Math.round((new Date(s.expires_at).getTime() - new Date(s.started_at).getTime()) / 1000));
          }

          const isMalayalam4pmSession = s.started_at < '2026-10-04T13:00:00.000Z';

          if (isMalayalam4pmSession && (s.status === 'SUBMITTED' || s.status === 'EXPIRED')) {
            version = 'Malayalam (47 Qs Valid)';
            validTotal = 47;
            const answers = targetAnsMap.get(s.id) || {};
            const q5Sel = answers[q5Id] || 'None';
            const q17Sel = answers[q17Id] || 'None';
            const q20Sel = answers[q20Id] || 'None';

            const q5Correct = q5Sel === 'C';
            const q17Correct = q17Sel === 'A';
            const q20Correct = q20Sel === 'C';

            const excludedPoints = (q5Correct ? 1 : 0) + (q17Correct ? 1 : 0) + (q20Correct ? 1 : 0);
            validCorrect = Math.max(0, rawScore - excludedPoints);
            percentage = Number(((validCorrect / 47) * 100).toFixed(2));
            score = Number(((validCorrect / 47) * 50).toFixed(2));
          } else {
            version = 'Standard 50 Qs';
            validTotal = 50;
            validCorrect = rawScore >= 0 ? rawScore : null;
            percentage = rawScore >= 0 ? Number(((rawScore / 50) * 100).toFixed(2)) : 0;
            score = rawScore >= 0 ? rawScore : -1;
          }
        }

        allRows.push({
          participant_id: p.participant_id || 'N/A',
          name: p.name || 'Anonymous',
          phone: p.phone || 'N/A',
          email: p.email || 'N/A',
          state: p.state || 'Kerala',
          status,
          raw_score: rawScore,
          score,
          percentage,
          valid_correct: validCorrect,
          valid_total: validTotal,
          version,
          time_taken_seconds: timeTakenSeconds,
          started_at: startedAt,
          submitted_at: submittedAt
        });
      });

      const submitted = allRows.filter(e => e.status === 'SUBMITTED' || e.status === 'EXPIRED');
      const unsubmitted = allRows.filter(e => e.status !== 'SUBMITTED' && e.status !== 'EXPIRED');

      // Tie-breaker: 1) Score DESC -> 2) time_taken_seconds ASC -> 3) submitted_at ASC
      submitted.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.time_taken_seconds !== b.time_taken_seconds) return a.time_taken_seconds - b.time_taken_seconds;
        const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
        const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
        return aTime - bTime;
      });

      unsubmitted.sort((a, b) => {
        if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
        if (b.status === 'IN_PROGRESS' && a.status !== 'IN_PROGRESS') return 1;
        return a.name.localeCompare(b.name);
      });

      const finalRanked: any[] = [];
      let rank = 1;
      submitted.forEach(item => {
        finalRanked.push({ rank: rank++, ...item });
      });
      unsubmitted.forEach(item => {
        finalRanked.push({ rank: rank++, ...item });
      });

      return finalRanked;
    } else {
      const submitted = mockStore.quizSessions.filter(s => s.status === 'SUBMITTED');
      return submitted.map((s, idx) => {
        const p = mockStore.participants.find(item => item.id === s.participant_id);
        const timeTaken = s.started_at && s.submitted_at ? Math.max(0, Math.round((new Date(s.submitted_at).getTime() - new Date(s.started_at).getTime()) / 1000)) : 300;
        return {
          rank: idx + 1,
          name: p?.name || 'Participant',
          participant_id: p?.participant_id || 'TKFK26-000000',
          phone: p?.phone || 'N/A',
          email: p?.email || 'N/A',
          state: p?.state || 'Kerala',
          score: s.score || 0,
          time_taken_seconds: timeTaken,
          status: s.status,
          started_at: s.started_at,
          submitted_at: s.submitted_at
        };
      }).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.time_taken_seconds - b.time_taken_seconds;
      }).map((item, idx) => ({ ...item, rank: idx + 1 }));
    }
  }

  static async getStudyMaterialConfig() {
    return { enabled: true, totalModules: 10 };
  }

  static async updateStudyMaterialConfig(config: any) {
    return config;
  }

  static async getResultsReleaseConfig(): Promise<ResultsReleaseConfig> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('system_config')
        .select('value')
        .eq('key', 'results_release')
        .maybeSingle();

      if (error || !data) return { published: false, note: "Results verification in progress." };
      return data.value as ResultsReleaseConfig;
    } else {
      return mockStore.resultsReleaseConfig;
    }
  }

  static async setResultsReleaseConfig(published: boolean, note?: string): Promise<ResultsReleaseConfig> {
    const config: ResultsReleaseConfig = {
      published,
      published_at: published ? new Date().toISOString() : undefined,
      note: note || (published ? "Official Results Published by TKFK" : "Results verification in progress")
    };

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      await supabaseAdmin!
        .from('system_config')
        .upsert({ key: 'results_release', value: config }, { onConflict: 'key' });

      return config;
    } else {
      mockStore.resultsReleaseConfig = config;
      return config;
    }
  }

  static async getOrGenerateCertificate(participant: Participant, session: QuizSession): Promise<Certificate> {
    const scorePct = Math.round(((session.score || 0) / (session.total_questions || 50)) * 100);
    let grade = 'Participation';
    if (scorePct >= 90) grade = 'Distinction (Gold)';
    else if (scorePct >= 75) grade = 'Merit (Silver)';
    else if (scorePct >= 50) grade = 'Pass (Bronze)';

    const code = generateCertificateCode(participant.participant_id || undefined);
    const vHash = generateVerificationHash(participant.participant_id || participant.id, participant.name);

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data: existing } = await supabaseAdmin!
        .from('certificates')
        .select('*')
        .eq('participant_id', participant.id)
        .maybeSingle();

      if (existing) return existing;

      const { data: newCert, error } = await supabaseAdmin!
        .from('certificates')
        .insert({
          certificate_code: code,
          participant_id: participant.id,
          verification_hash: vHash,
          score_percentage: scorePct,
          grade
        })
        .select()
        .single();

      if (error) throw error;
      return { ...newCert, participant_name: participant.name };
    } else {
      let cert = mockStore.certificates.find(c => c.participant_id === participant.id);
      if (cert) return cert;

      cert = {
        id: `cert-${Date.now()}`,
        certificate_code: code,
        participant_id: participant.id,
        participant_name: participant.name,
        issued_at: new Date().toISOString(),
        verification_hash: vHash,
        score_percentage: scorePct,
        grade
      };
      mockStore.certificates.push(cert);
      return cert;
    }
  }

  static async verifyCertificate(query: string): Promise<{ valid: boolean; certificate?: Certificate; participant?: Participant } | null> {
    const clean = query.trim().toUpperCase();
    if (isSupabaseMode()) {
      validateDatabaseConfig();

      // 1. Try matching by certificate_code directly
      let { data: cert, error } = await supabaseAdmin!
        .from('certificates')
        .select('id, certificate_code, participant_name, issued_at, verification_hash, score_percentage, grade, participant_id, participants!inner(name, participant_id, college, state)')
        .eq('certificate_code', clean)
        .maybeSingle();

      if (error) throw error;

      // 2. If not found by certificate_code, try matching by public participant_id on joined participants table
      if (!cert) {
        const { data: certByPId, error: pIdErr } = await supabaseAdmin!
          .from('certificates')
          .select('id, certificate_code, participant_name, issued_at, verification_hash, score_percentage, grade, participant_id, participants!inner(name, participant_id, college, state)')
          .eq('participants.participant_id', clean)
          .maybeSingle();

        if (pIdErr) throw pIdErr;
        cert = certByPId;
      }

      if (!cert) return { valid: false };
      const p = (cert as any).participants;
      return {
        valid: true,
        certificate: cert as unknown as Certificate,
        participant: p
      };
    } else {
      const c = mockStore.certificates.find(item => item.certificate_code.toUpperCase() === clean);
      let p = c ? mockStore.participants.find(item => item.id === c.participant_id) : undefined;
      
      if (!c) {
        p = mockStore.participants.find(item => item.participant_id && item.participant_id.toUpperCase() === clean);
        if (p) {
          const matchingCert = mockStore.certificates.find(item => item.participant_id === p!.id);
          if (matchingCert) {
            return { valid: true, certificate: matchingCert, participant: p };
          }
        }
        return { valid: false };
      }

      if (!p) return { valid: false };
      return { valid: true, certificate: c, participant: p };
    }
  }

  // -----------------------------------------------------------------------
  // ADMIN DASHBOARD & ANALYTICS
  // -----------------------------------------------------------------------

  static async getAdminStats() {
    const admin = supabaseAdmin!;
    const { count: totalReg } = await admin.from('registrations').select('*', { count: 'exact', head: true });
    const { count: confirmedReg } = await admin.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'SUCCESS');
    const { count: pendingReg } = await admin.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'PENDING');
    const { count: failedReg } = await admin.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'FAILED');
    const { count: reviewReg } = await admin.from('registrations').select('*', { count: 'exact', head: true }).eq('payment_status', 'MANUAL_REVIEW');
    const { count: activeSessions } = await admin.from('quiz_sessions').select('*', { count: 'exact', head: true }).eq('status', 'IN_PROGRESS');

    // Aggregate actual payment transaction ledger
    const { data: transactions } = await admin
      .from('payment_transactions')
      .select('amount')
      .eq('payment_status', 'SUCCESS');

    let totalRevenue = (transactions || []).reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0);

    // Fallback to registrations ledger if payment_transactions has not yet recorded rows
    if (totalRevenue === 0 && (confirmedReg || 0) > 0) {
      const { data: regLedger } = await admin
        .from('registrations')
        .select('amount')
        .eq('payment_status', 'SUCCESS');
      totalRevenue = (regLedger || []).reduce((sum: number, r: any) => sum + (Number(r.amount) || 0), 0);
    }

    return {
      totalRegistrations: totalReg || 0,
      confirmed: confirmedReg || 0,
      pending: pendingReg || 0,
      failed: failedReg || 0,
      manualReview: reviewReg || 0,
      activeQuizSessions: activeSessions || 0,
      totalRevenue
    };
  }

  static async getAdminParticipants(): Promise<(Participant & { registration?: Registration })[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data: pList, error } = await supabaseAdmin!
        .from('participants')
        .select('*, registrations(*)');
      if (error) throw error;
      return pList.map(p => ({
        ...p,
        registration: Array.isArray(p.registrations) ? p.registrations[0] : p.registrations
      }));
    } else {
      return mockStore.participants.map(p => ({
        ...p,
        registration: mockStore.registrations.find(r => r.participant_id === p.id)
      }));
    }
  }

  static async getAdminReferrals(): Promise<ReferralCode[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('referral_codes')
        .select('*')
        .order('usage_count', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return mockStore.referralCodes.sort((a,b) => b.usage_count - a.usage_count);
    }
  }

  static async logAdminAction(adminUser: string, action: string, entityType: string, entityId: string, metadata?: any): Promise<void> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      // Omit custom non-UUID id so PostgreSQL auto-generates a valid UUID (Issue 18)
      const { error } = await supabaseAdmin!
        .from('audit_logs')
        .insert({
          admin_user_id: adminUser,
          action,
          entity_type: entityType,
          entity_id: entityId,
          metadata
        });

      if (error) {
        console.error('[DB AUDIT LOG ERROR]', error);
        throw new Error(`Audit logging failed: ${error.message}`);
      }
    } else {
      const entry: AuditLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        admin_user_id: adminUser,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata,
        created_at: new Date().toISOString()
      };
      mockStore.auditLogs.unshift(entry);
    }
  }

  static async getAuditLogs(): Promise<AuditLog[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } else {
      return mockStore.auditLogs;
    }
  }

  static async recordContactMessage(data: { name: string; email: string; phone?: string; subject?: string; message: string }): Promise<void> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { error } = await supabaseAdmin!
        .from('contact_messages')
        .insert({
          name: data.name.trim(),
          email: data.email.trim().toLowerCase(),
          phone: data.phone?.trim(),
          subject: data.subject?.trim(),
          message: data.message.trim()
        });
      if (error) throw error;
    }
  }

  /**
   * Record raw webhook event with UNIQUE provider_event_id constraint for real database idempotency.
   * Checks for duplicate provider_event_id. If duplicate exists, returns { isDuplicate: true, event }.
   */
  static async recordPaymentEvent(data: {
    provider: string;
    provider_event_id: string;
    registration_id?: string;
    event_type: string;
    payload: Record<string, any>;
  }): Promise<{ isDuplicate: boolean; event: PaymentEvent }> {
    const providerEventId = data.provider_event_id.trim();

    if (isSupabaseMode()) {
      validateDatabaseConfig();

      // 1. Check if event with provider_event_id already exists in payment_events table
      const { data: existing, error: findErr } = await supabaseAdmin!
        .from('payment_events')
        .select('*')
        .eq('provider_event_id', providerEventId)
        .maybeSingle();

      if (findErr) {
        console.error('[DB RECORD PAYMENT EVENT FIND ERROR]', findErr);
      }

      if (existing) {
        return {
          isDuplicate: true,
          event: existing as PaymentEvent
        };
      }

      // 2. Insert new payment event record
      try {
        const { data: inserted, error: insertErr } = await supabaseAdmin!
          .from('payment_events')
          .insert({
            provider: data.provider || 'razorpay',
            provider_event_id: providerEventId,
            registration_id: data.registration_id || null,
            event_type: data.event_type || 'payment.event',
            payload: data.payload || {},
            processed: false
          })
          .select()
          .single();

        if (insertErr) {
          // Handle unique constraint violation (Race condition: another worker inserted same event_id concurrently)
          if (insertErr.code === '23505' || insertErr.message?.toLowerCase().includes('unique') || insertErr.message?.toLowerCase().includes('duplicate')) {
            const { data: dupExisting } = await supabaseAdmin!
              .from('payment_events')
              .select('*')
              .eq('provider_event_id', providerEventId)
              .single();

            if (dupExisting) {
              return {
                isDuplicate: true,
                event: dupExisting as PaymentEvent
              };
            }
          }
          throw insertErr;
        }

        await this.logAdminAction("SYSTEM", "PAYMENT_EVENT_RECORDED", "PAYMENT_EVENT", inserted.id, {
          provider_event_id: providerEventId,
          event_type: data.event_type
        });

        return {
          isDuplicate: false,
          event: inserted as PaymentEvent
        };

      } catch (err: any) {
        const { data: fallbackExisting } = await supabaseAdmin!
          .from('payment_events')
          .select('*')
          .eq('provider_event_id', providerEventId)
          .maybeSingle();

        if (fallbackExisting) {
          return {
            isDuplicate: true,
            event: fallbackExisting as PaymentEvent
          };
        }
        throw err;
      }

    } else {
      // MOCK MODE
      const existing = mockStore.paymentEvents.find(e => e.provider_event_id === providerEventId);
      if (existing) {
        return {
          isDuplicate: true,
          event: existing
        };
      }

      const newEvt: PaymentEvent = {
        id: `pevt-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        transaction_id: null,
        registration_id: data.registration_id || null,
        provider: data.provider || 'development',
        provider_event_id: providerEventId,
        event_type: data.event_type || 'payment.event',
        payload: data.payload || {},
        processed: false,
        created_at: new Date().toISOString()
      };

      mockStore.paymentEvents.push(newEvt);
      await this.logAdminAction("SYSTEM", "PAYMENT_EVENT_RECORDED", "PAYMENT_EVENT", newEvt.id, {
        provider_event_id: providerEventId,
        event_type: data.event_type
      });

      return {
        isDuplicate: false,
        event: newEvt
      };
    }
  }

  /**
   * Mark a payment event as processed in the database.
   */
  static async markPaymentEventProcessed(eventId: string, success: boolean, note?: string): Promise<void> {
    const errorMsg = success ? null : (note || 'Processing failed');

    if (isSupabaseMode()) {
      validateDatabaseConfig();

      const { error } = await supabaseAdmin!
        .from('payment_events')
        .update({
          processed: true,
          processing_error: errorMsg
        })
        .or(`id.eq.${eventId},provider_event_id.eq.${eventId}`);

      if (error) {
        console.error('[DB MARK PAYMENT EVENT PROCESSED ERROR]', error);
      }

      await this.logAdminAction("SYSTEM", "PAYMENT_EVENT_PROCESSED", "PAYMENT_EVENT", eventId, { success, note });
    } else {
      const evt = mockStore.paymentEvents.find(e => e.id === eventId || e.provider_event_id === eventId);
      if (evt) {
        evt.processed = true;
        evt.processing_error = errorMsg || undefined;
      }
      await this.logAdminAction("SYSTEM", "PAYMENT_EVENT_PROCESSED", "PAYMENT_EVENT", eventId, { success, note });
    }
  }

  /**
   * Create an initial PENDING payment transaction record in payment_transactions table.
   */
  static async createPaymentTransaction(data: {
    registration_id: string;
    provider: string;
    provider_order_id?: string;
    amount: number;
    currency?: string;
    payment_status?: PaymentStatus;
    provider_status?: string;
  }): Promise<PaymentTransaction> {
    const orderId = data.provider_order_id ? data.provider_order_id.trim() : null;
    const now = new Date().toISOString();

    if (isSupabaseMode()) {
      validateDatabaseConfig();

      if (orderId) {
        const { data: existing } = await supabaseAdmin!
          .from('payment_transactions')
          .select('*')
          .eq('provider_order_id', orderId)
          .maybeSingle();

        if (existing) {
          return existing as PaymentTransaction;
        }
      }

      const { data: inserted, error } = await supabaseAdmin!
        .from('payment_transactions')
        .insert({
          registration_id: data.registration_id,
          provider: data.provider || 'razorpay',
          provider_order_id: orderId,
          amount: data.amount || 99,
          currency: (data.currency || 'INR').toUpperCase(),
          payment_status: data.payment_status || 'PENDING',
          provider_status: data.provider_status || 'created',
          created_at: now,
          updated_at: now
        })
        .select()
        .single();

      if (error) {
        if (orderId && (error.code === '23505' || error.message?.toLowerCase().includes('unique') || error.message?.toLowerCase().includes('duplicate'))) {
          const { data: dupExisting } = await supabaseAdmin!
            .from('payment_transactions')
            .select('*')
            .eq('provider_order_id', orderId)
            .single();

          if (dupExisting) return dupExisting as PaymentTransaction;
        }
        throw error;
      }

      await this.logAdminAction("SYSTEM", "PAYMENT_TXN_CREATED", "PAYMENT_TRANSACTION", inserted.id, {
        provider_order_id: orderId,
        amount: data.amount
      });

      return inserted as PaymentTransaction;

    } else {
      if (orderId) {
        const existing = mockStore.paymentTransactions.find(t => t.provider_order_id === orderId);
        if (existing) return existing;
      }

      const newTxn: PaymentTransaction = {
        id: `ptxn-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        registration_id: data.registration_id,
        provider: data.provider || 'development',
        provider_order_id: orderId,
        provider_payment_id: null,
        provider_event_id: null,
        amount: data.amount || 99,
        currency: (data.currency || 'INR').toUpperCase(),
        payment_status: data.payment_status || 'PENDING',
        provider_status: data.provider_status || 'created',
        created_at: now,
        updated_at: now
      };

      mockStore.paymentTransactions.push(newTxn);
      await this.logAdminAction("SYSTEM", "PAYMENT_TXN_CREATED", "PAYMENT_TRANSACTION", newTxn.id, {
        provider_order_id: orderId,
        amount: data.amount
      });

      return newTxn;
    }
  }

  /**
   * Update payment transaction status upon verified provider event in payment_transactions table.
   * Links provider_event_id and transaction_id in payment_events.
   */
  static async updatePaymentTransactionStatus(data: {
    registration_id: string;
    provider?: string;
    provider_order_id?: string;
    provider_payment_id?: string;
    provider_event_id?: string;
    amount?: number;
    currency?: string;
    payment_status: PaymentStatus;
    provider_status?: string;
    paid_at?: string;
    refunded_at?: string;
    last_webhook_at?: string;
  }): Promise<PaymentTransaction> {
    const now = new Date().toISOString();
    const orderId = data.provider_order_id?.trim();
    const paymentId = data.provider_payment_id?.trim();
    const eventId = data.provider_event_id?.trim();

    if (isSupabaseMode()) {
      validateDatabaseConfig();

      let targetTxn: PaymentTransaction | null = null;

      if (orderId) {
        const { data: t } = await supabaseAdmin!
          .from('payment_transactions')
          .select('*')
          .eq('provider_order_id', orderId)
          .maybeSingle();
        if (t) targetTxn = t as PaymentTransaction;
      }

      if (!targetTxn && paymentId) {
        const { data: t } = await supabaseAdmin!
          .from('payment_transactions')
          .select('*')
          .eq('provider_payment_id', paymentId)
          .maybeSingle();
        if (t) targetTxn = t as PaymentTransaction;
      }

      if (!targetTxn) {
        const { data: t } = await supabaseAdmin!
          .from('payment_transactions')
          .select('*')
          .eq('registration_id', data.registration_id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (t) targetTxn = t as PaymentTransaction;
      }

      let updatedTxn: PaymentTransaction;

      if (targetTxn) {
        const updates: any = {
          payment_status: data.payment_status,
          updated_at: now,
          last_webhook_at: data.last_webhook_at || now
        };
        if (paymentId) updates.provider_payment_id = paymentId;
        if (orderId) updates.provider_order_id = orderId;
        if (eventId) updates.provider_event_id = eventId;
        if (data.provider_status) updates.provider_status = data.provider_status;
        if (data.paid_at || data.payment_status === 'SUCCESS') updates.paid_at = data.paid_at || now;
        if (data.refunded_at || data.payment_status === 'REFUNDED') updates.refunded_at = data.refunded_at || now;

        const { data: res, error } = await supabaseAdmin!
          .from('payment_transactions')
          .update(updates)
          .eq('id', targetTxn.id)
          .select()
          .single();

        if (error) throw error;
        updatedTxn = res as PaymentTransaction;

      } else {
        const { data: inserted, error } = await supabaseAdmin!
          .from('payment_transactions')
          .insert({
            registration_id: data.registration_id,
            provider: data.provider || 'razorpay',
            provider_order_id: orderId || null,
            provider_payment_id: paymentId || null,
            provider_event_id: eventId || null,
            amount: data.amount || 99,
            currency: (data.currency || 'INR').toUpperCase(),
            payment_status: data.payment_status,
            provider_status: data.provider_status || 'webhook_updated',
            created_at: now,
            updated_at: now,
            paid_at: data.payment_status === 'SUCCESS' ? (data.paid_at || now) : null,
            refunded_at: data.payment_status === 'REFUNDED' ? (data.refunded_at || now) : null,
            last_webhook_at: data.last_webhook_at || now
          })
          .select()
          .single();

        if (error) throw error;
        updatedTxn = inserted as PaymentTransaction;
      }

      if (eventId) {
        await supabaseAdmin!
          .from('payment_events')
          .update({ transaction_id: updatedTxn.id })
          .eq('provider_event_id', eventId);
      }

      await this.logAdminAction("SYSTEM", "PAYMENT_TXN_UPDATED", "PAYMENT_TRANSACTION", updatedTxn.id, {
        payment_status: data.payment_status,
        provider_payment_id: paymentId
      });

      return updatedTxn;

    } else {
      let targetTxn = mockStore.paymentTransactions.find(t => 
        (orderId && t.provider_order_id === orderId) ||
        (paymentId && t.provider_payment_id === paymentId) ||
        t.registration_id === data.registration_id
      );

      if (targetTxn) {
        targetTxn.payment_status = data.payment_status;
        if (paymentId) targetTxn.provider_payment_id = paymentId;
        if (orderId) targetTxn.provider_order_id = orderId;
        if (eventId) targetTxn.provider_event_id = eventId;
        if (data.provider_status) targetTxn.provider_status = data.provider_status;
        targetTxn.updated_at = now;
        targetTxn.last_webhook_at = data.last_webhook_at || now;
        if (data.paid_at || data.payment_status === 'SUCCESS') targetTxn.paid_at = data.paid_at || now;
        if (data.refunded_at || data.payment_status === 'REFUNDED') targetTxn.refunded_at = data.refunded_at || now;
      } else {
        targetTxn = {
          id: `ptxn-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          registration_id: data.registration_id,
          provider: data.provider || 'development',
          provider_order_id: orderId || null,
          provider_payment_id: paymentId || null,
          provider_event_id: eventId || null,
          amount: data.amount || 99,
          currency: (data.currency || 'INR').toUpperCase(),
          payment_status: data.payment_status,
          provider_status: data.provider_status || 'webhook_updated',
          created_at: now,
          updated_at: now,
          paid_at: data.payment_status === 'SUCCESS' ? (data.paid_at || now) : null,
          refunded_at: data.payment_status === 'REFUNDED' ? (data.refunded_at || now) : null,
          last_webhook_at: data.last_webhook_at || now
        };
        mockStore.paymentTransactions.push(targetTxn);
      }

      if (eventId) {
        const evt = mockStore.paymentEvents.find(e => e.provider_event_id === eventId);
        if (evt) evt.transaction_id = targetTxn.id;
      }

      await this.logAdminAction("SYSTEM", "PAYMENT_TXN_UPDATED", "PAYMENT_TRANSACTION", targetTxn.id, {
        payment_status: data.payment_status,
        provider_payment_id: paymentId
      });

      return targetTxn;
    }
  }

  /**
   * Get payment transactions for a given registration ID
   */
  static async getPaymentTransactionsByRegistrationId(registrationId: string): Promise<PaymentTransaction[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('payment_transactions')
        .select('*')
        .eq('registration_id', registrationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return mockStore.paymentTransactions.filter(t => t.registration_id === registrationId);
    }
  }

  /**
   * Get payment events for a given registration ID
   */
  static async getPaymentEventsByRegistrationId(registrationId: string): Promise<PaymentEvent[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('payment_events')
        .select('*')
        .eq('registration_id', registrationId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    } else {
      return mockStore.paymentEvents.filter(e => e.registration_id === registrationId);
    }
  }

  // -----------------------------------------------------------------------
  // LIVE PROCTORING CCTV MONITORING & TELEMETRY
  // -----------------------------------------------------------------------

  /**
   * Save incoming live camera frame & telemetry from participant
   */
  static async recordProctoringFrame(data: {
    participantId: string;
    sessionId: string;
    imageData?: string | null;
    currentIndex?: number;
    answeredCount?: number;
    timeLeftSeconds?: number;
    warningsCount?: number;
    warningMessage?: string | null;
    dismissWarning?: boolean;
    dismissedWarning?: string | null;
    isFullscreen?: boolean;
    isTerminated?: boolean;
    terminationReason?: string | null;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<{
    adminWarning?: string | null;
    warningsCount?: number;
    forceTerminated?: boolean;
    terminationReason?: string | null;
  }> {
    const store = getGlobalProctoringStore();
    const existing = store.get(data.participantId);

    let activeAdminWarning = existing?.admin_warning || null;
    if (data.dismissWarning || (data.dismissedWarning && data.dismissedWarning === activeAdminWarning)) {
      activeAdminWarning = null;
    }

    const updatedEntry = {
      participant_id: data.participantId,
      session_id: data.sessionId,
      image_data: data.imageData !== undefined ? data.imageData : (existing?.image_data || null),
      current_question_index: data.currentIndex ?? existing?.current_question_index ?? 0,
      total_answered: data.answeredCount ?? existing?.total_answered ?? 0,
      master_time_left_seconds: data.timeLeftSeconds ?? existing?.master_time_left_seconds ?? 1500,
      warnings_count: data.warningsCount ?? existing?.warnings_count ?? 0,
      last_warning_message: data.warningMessage !== undefined ? data.warningMessage : (existing?.last_warning_message || null),
      is_fullscreen: data.isFullscreen ?? existing?.is_fullscreen ?? true,
      is_terminated: Boolean(data.isTerminated || existing?.is_terminated || existing?.force_terminated),
      termination_reason: data.terminationReason || existing?.termination_reason || null,
      last_heartbeat: new Date().toISOString(),
      admin_warning: activeAdminWarning,
      force_terminated: Boolean(existing?.force_terminated),
      user_agent: data.userAgent || existing?.user_agent,
      ip_address: data.ipAddress || existing?.ip_address
    };

    store.set(data.participantId, updatedEntry);

    // If participant is reporting terminated, ensure database session reflects it
    if (data.isTerminated && data.sessionId) {
      this.submitQuizSession(data.sessionId).catch(() => {});
    }

    return {
      adminWarning: activeAdminWarning,
      warningsCount: existing?.warnings_count ?? data.warningsCount ?? 0,
      forceTerminated: existing?.force_terminated || false,
      terminationReason: existing?.termination_reason || null
    };
  }

  /**
   * Get list of all participant proctoring streams for CCTV grid
   */
  static async getProctoringStreams(): Promise<ProctoringStreamItem[]> {
    const store = getGlobalProctoringStore();
    const now = Date.now();

    let participantsList: Participant[] = [];
    let sessionsList: QuizSession[] = [];

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      try {
        const { data: pData } = await supabaseAdmin!
          .from('participants')
          .select('id, participant_id, name, email, phone, college, state, city, status')
          .order('created_at', { ascending: false });
        if (pData) participantsList = pData as any[];

        const { data: sData } = await supabaseAdmin!
          .from('quiz_sessions')
          .select('*')
          .order('started_at', { ascending: false });
        if (sData) sessionsList = sData as any[];
      } catch (err) {
        console.warn('[Get Proctoring Streams Error]', err);
      }
    } else {
      participantsList = mockStore.participants;
      sessionsList = mockStore.quizSessions;
    }

    const sessionMap = new Map(sessionsList.map(s => [s.participant_id, s]));

    const resultList: ProctoringStreamItem[] = [];

    // 1. Map registered participants who have sessions or proctoring frames
    for (const p of participantsList) {
      const sess = sessionMap.get(p.id);
      const stream = store.get(p.id);

      // Only include participants with an active, recent, or recorded quiz session or proctoring stream
      if (!sess && !stream && p.status !== 'ACTIVE') {
        continue;
      }

      const lastHeartbeat = stream?.last_heartbeat || sess?.started_at || new Date().toISOString();
      const heartbeatAgeMs = now - new Date(lastHeartbeat).getTime();
      const isLive = Boolean(stream && heartbeatAgeMs < 15000 && !stream.is_terminated && sess?.status !== 'SUBMITTED' && sess?.status !== 'EXPIRED');

      resultList.push({
        id: `proc-${p.id}`,
        participant_id: p.id,
        participant_public_id: p.participant_id || 'TKFK26-PENDING',
        participant_name: p.name || 'Participant',
        email: p.email,
        phone: p.phone,
        college: p.college || 'General Category',
        state: p.state || 'Kerala',
        city: p.city || '',
        session_id: sess?.id || stream?.session_id || `sess-${p.id}`,
        image_data: stream?.image_data || null,
        current_question_index: stream?.current_question_index ?? 0,
        total_answered: stream?.total_answered ?? 0,
        total_questions: sess?.total_questions || EVENT_CONFIG.totalQuestions || 50,
        master_time_left_seconds: stream?.master_time_left_seconds ?? (sess?.expires_at ? Math.max(0, Math.floor((new Date(sess.expires_at).getTime() - now) / 1000)) : 1500),
        warnings_count: stream?.warnings_count ?? 0,
        last_warning_message: stream?.last_warning_message || null,
        is_fullscreen: stream?.is_fullscreen ?? true,
        is_terminated: Boolean(stream?.is_terminated || stream?.force_terminated),
        termination_reason: stream?.termination_reason || null,
        session_status: sess?.status || (stream?.is_terminated ? 'EXPIRED' : 'IN_PROGRESS'),
        last_heartbeat: lastHeartbeat,
        is_live: isLive,
        admin_warning: stream?.admin_warning || null,
        force_terminated: stream?.force_terminated || false
      });
    }

    // 2. Include any active proctoring streams from participants not yet in the list (e.g. admin tester or guest sandbox)
    for (const [pId, stream] of store.entries()) {
      if (!resultList.some(r => r.participant_id === pId)) {
        const lastHeartbeat = stream.last_heartbeat || new Date().toISOString();
        const heartbeatAgeMs = now - new Date(lastHeartbeat).getTime();
        const isLive = Boolean(heartbeatAgeMs < 15000 && !stream.is_terminated);

        resultList.push({
          id: `proc-${pId}`,
          participant_id: pId,
          participant_public_id: pId.startsWith('admin') ? 'ADMIN-SANDBOX' : 'TKFK26-GUEST',
          participant_name: pId.startsWith('admin') ? 'Admin Sandbox Tester' : 'Live Participant',
          session_id: stream.session_id,
          image_data: stream.image_data || null,
          current_question_index: stream.current_question_index,
          total_answered: stream.total_answered,
          total_questions: EVENT_CONFIG.totalQuestions || 50,
          master_time_left_seconds: stream.master_time_left_seconds,
          warnings_count: stream.warnings_count,
          last_warning_message: stream.last_warning_message || null,
          is_fullscreen: stream.is_fullscreen,
          is_terminated: stream.is_terminated,
          termination_reason: stream.termination_reason || null,
          session_status: stream.is_terminated ? 'EXPIRED' : 'IN_PROGRESS',
          last_heartbeat: lastHeartbeat,
          is_live: isLive,
          admin_warning: stream.admin_warning || null,
          force_terminated: stream.force_terminated || false
        });
      }
    }

    // Sort order:
    // 1. Live active now with camera first
    // 2. Flagged with warnings second
    // 3. In progress third
    // 4. Submitted / Terminated last
    return resultList.sort((a, b) => {
      if (a.is_live && !b.is_live) return -1;
      if (!a.is_live && b.is_live) return 1;
      if (a.warnings_count > 0 && b.warnings_count === 0) return -1;
      if (a.warnings_count === 0 && b.warnings_count > 0) return 1;
      if (a.session_status === 'IN_PROGRESS' && b.session_status !== 'IN_PROGRESS') return -1;
      if (a.session_status !== 'IN_PROGRESS' && b.session_status === 'IN_PROGRESS') return 1;
      return new Date(b.last_heartbeat).getTime() - new Date(a.last_heartbeat).getTime();
    });
  }

  /**
   * Execute proctoring administrative action (Issue direct warning or force terminate)
   */
  static async executeProctoringAction(
    actionReq: ProctoringActionRequest, 
    adminUserId: string = 'ADMIN'
  ): Promise<{ success: boolean; message: string }> {
    const store = getGlobalProctoringStore();
    const entry = store.get(actionReq.participantId) || {
      participant_id: actionReq.participantId,
      session_id: actionReq.sessionId || '',
      current_question_index: 0,
      total_answered: 0,
      master_time_left_seconds: 0,
      warnings_count: 0,
      is_fullscreen: true,
      is_terminated: false,
      last_heartbeat: new Date().toISOString()
    };

    if (actionReq.action === 'warning') {
      const msg = actionReq.message || 'Proctor Notice: Maintain single participant visibility within camera frame.';
      entry.admin_warning = msg;
      entry.warnings_count = (entry.warnings_count || 0) + 1;
      store.set(actionReq.participantId, entry);

      await this.logAdminAction(adminUserId, 'PROCTOR_WARNING_ISSUED', 'PARTICIPANT', actionReq.participantId, {
        warning_message: msg,
        sessionId: actionReq.sessionId
      });

      return { success: true, message: `Warning sent directly to participant screen: "${msg}"` };
    }

    if (actionReq.action === 'clear_warning') {
      entry.admin_warning = null;
      store.set(actionReq.participantId, entry);
      return { success: true, message: 'Warning cleared from participant screen.' };
    }

    if (actionReq.action === 'terminate') {
      const reason = actionReq.reason || 'Attempt terminated by proctor administrator due to competition rule violation.';
      entry.force_terminated = true;
      entry.is_terminated = true;
      entry.termination_reason = reason;
      store.set(actionReq.participantId, entry);

      if (actionReq.sessionId) {
        await this.submitQuizSession(actionReq.sessionId);
      }

      await this.logAdminAction(adminUserId, 'PROCTOR_TERMINATE_ATTEMPT', 'PARTICIPANT', actionReq.participantId, {
        termination_reason: reason,
        sessionId: actionReq.sessionId
      });

      return { success: true, message: `Attempt force-terminated successfully: "${reason}"` };
    }

    if (actionReq.action === 'grant_retry') {
      const res = await this.grantParticipantRetry(actionReq.participantId, adminUserId);
      return { success: res.success, message: res.message };
    }

    return { success: false, message: 'Unknown proctoring action.' };
  }
}

// Global In-Memory Proctoring Store Helper (Preserved across Node.js runtime hot-reloads)
function getGlobalProctoringStore(): Map<string, any> {
  const g = globalThis as any;
  if (!g.__tkfk_live_proctoring_store) {
    g.__tkfk_live_proctoring_store = new Map<string, any>();
  }
  return g.__tkfk_live_proctoring_store;
}
