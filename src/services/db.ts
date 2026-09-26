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
  PaymentEvent
} from '@/types';
import crypto from 'crypto';
import { isSupabaseMode, validateDatabaseConfig, supabaseAdmin } from '@/lib/supabase';
import { generateParticipantId, generateVerificationHash, generateCertificateCode, normalizePhoneNumber } from '@/lib/utils';
import { EVENT_CONFIG } from '@/lib/config';

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

// =========================================================================
// [DEVELOPMENT ONLY] MOCK IN-MEMORY TEST DATABASE STORE (Used ONLY when DATA_MODE=mock)
// =========================================================================

const INITIAL_QUESTIONS: Question[] = [
  {
    id: "q-1",
    question_text: "In which year was Mahatma Gandhi born in Porbandar, Gujarat?",
    option_a: "1857",
    option_b: "1869",
    option_c: "1875",
    option_d: "1893",
    correct_option: "B",
    category: "Early Life",
    difficulty: "EASY",
    explanation: "Mahatma Gandhi was born on October 2, 1869, in Porbandar."
  },
  {
    id: "q-2",
    question_text: "What key incident in South Africa in 1893 transformed Gandhi's life to fight racial injustice?",
    option_a: "He was denied entry into a courtroom",
    option_b: "He was thrown off a first-class train compartment at Pietermaritzburg",
    option_c: "He was arrested at Tolstoy Farm",
    option_d: "His law office was set on fire",
    correct_option: "B",
    category: "South Africa",
    difficulty: "EASY",
    explanation: "He was thrown off the train at Pietermaritzburg for riding in first class despite holding a valid ticket."
  },
  {
    id: "q-3",
    question_text: "Which political leader in India did Gandhi regard as his political mentor upon returning in 1915?",
    option_a: "Bal Gangadhar Tilak",
    option_b: "Gopal Krishna Gokhale",
    option_c: "Lala Lajpat Rai",
    option_d: "Dadabhai Naoroji",
    correct_option: "B",
    category: "Return to India",
    difficulty: "MEDIUM",
    explanation: "Gokhale advised Gandhi to spend a year traveling across India to understand the people."
  },
  {
    id: "q-4",
    question_text: "What was Mahatma Gandhi's first successful local Satyagraha campaign in India in 1917?",
    option_a: "Kheda Satyagraha",
    option_b: "Champaran Satyagraha",
    option_c: "Ahmedabad Mill Strike",
    option_d: "Rowlatt Satyagraha",
    correct_option: "B",
    category: "Early Campaigns",
    difficulty: "EASY",
    explanation: "Champaran Satyagraha in Bihar supported indigo farmers against oppressive British planters."
  },
  {
    id: "q-5",
    question_text: "From which ashram did Mahatma Gandhi commence the historic 240-mile Dandi Salt March in March 1930?",
    option_a: "Kochrab Ashram",
    option_b: "Phoenix Settlement",
    option_c: "Sabarmati Ashram",
    option_d: "Wardha Ashram",
    correct_option: "C",
    category: "Salt March",
    difficulty: "EASY",
    explanation: "Gandhi set off from Sabarmati Ashram on 12 March 1930 with 78 followers."
  },
  {
    id: "q-6",
    question_text: "What famous mantra did Gandhi give to the nation during the Quit India Movement in August 1942?",
    option_a: "Jai Hind",
    option_b: "Satyameva Jayate",
    option_c: "Do or Die",
    option_d: "Inquilab Zindabad",
    correct_option: "C",
    category: "Quit India Movement",
    difficulty: "EASY",
    explanation: "During his speech at Gowalia Tank Maidan, Bombay, Gandhi declared 'Do or Die' (Karo ya Maro)."
  },
  {
    id: "q-7",
    question_text: "Who among the following historic personalities gave Mohandas Gandhi the title 'Mahatma'?",
    option_a: "Swami Vivekananda",
    option_b: "Rabindranath Tagore",
    option_c: "Subhash Chandra Bose",
    option_d: "Sarojini Naidu",
    correct_option: "B",
    category: "Contemporaries",
    difficulty: "MEDIUM",
    explanation: "Rabindranath Tagore conferred the title 'Mahatma', while Gandhi called Tagore 'Gurudev'."
  },
  {
    id: "q-8",
    question_text: "In 2007, the United Nations General Assembly declared 2 October as which international observation?",
    option_a: "World Peace Day",
    option_b: "International Day of Non-Violence",
    option_c: "Global Human Rights Day",
    option_d: "International Truth Day",
    correct_option: "B",
    category: "Legacy",
    difficulty: "EASY",
    explanation: "UN unanimously resolved to observe October 2 as the International Day of Non-Violence."
  },
  {
    id: "q-9",
    question_text: "What is the title of Mahatma Gandhi's famous autobiography written originally in Gujarati?",
    option_a: "Hind Swaraj",
    option_b: "The Story of My Experiments with Truth",
    option_c: "India of My Dreams",
    option_d: "Key to Health",
    correct_option: "B",
    category: "Philosophy & Works",
    difficulty: "EASY",
    explanation: "The autobiography covers his life from early childhood to 1921."
  },
  {
    id: "q-10",
    question_text: "Why did Gandhi suspend the Non-Cooperation Movement in February 1922?",
    option_a: "He was arrested in London",
    option_b: "The Rowlatt Act was repealed",
    option_c: "Violent incident at Chauri Chaura where a police station was burned",
    option_d: "British government agreed to grant Dominion Status",
    correct_option: "C",
    category: "Non-Cooperation Movement",
    difficulty: "MEDIUM",
    explanation: "Gandhi immediately halted the movement because violence violated the principle of non-violence."
  }
];

// Additional questions generated to fulfill 50 question pool for quiz engine
for (let i = 11; i <= 50; i++) {
  INITIAL_QUESTIONS.push({
    id: `q-${i}`,
    question_text: `Sample Quiz Question ${i}: Which publication was launched by Mahatma Gandhi in South Africa in 1903?`,
    option_a: "Young India",
    option_b: "Indian Opinion",
    option_c: "Harijan",
    option_d: "Navajivan",
    correct_option: i % 2 === 0 ? "B" : "A",
    category: "Publications & Journalism",
    difficulty: "MEDIUM",
    explanation: "Gandhi founded Indian Opinion in 1903 to advocate for civil rights in South Africa."
  });
}

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
        p.participant_id.toUpperCase() === cleanId &&
        (p.email.toLowerCase() === cleanIdent || normalizePhoneNumber(p.phone) === cleanPhone || p.phone.trim() === cleanIdent)
      );
      return found || null;
    }
  }

  /**
   * Get Participant by ID or Participant_Id
   */
  static async getParticipantById(idOrParticipantId: string): Promise<Participant | null> {
    const clean = idOrParticipantId.trim();
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      
      let { data, error } = await supabaseAdmin!
        .from('participants')
        .select('*')
        .eq('participant_id', clean.toUpperCase())
        .maybeSingle();

      if (error) throw error;

      if (!data && /^[0-9a-fA-F-]{36}$/.test(clean)) {
        const { data: byUuid, error: uuidErr } = await supabaseAdmin!
          .from('participants')
          .select('*')
          .eq('id', clean)
          .maybeSingle();
        
        if (uuidErr) throw uuidErr;
        data = byUuid;
      }

      return data;
    } else {
      return mockStore.participants.find(p => p.id === clean || p.participant_id.toUpperCase() === clean.toUpperCase()) || null;
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

      // Generate participant ID with retry in case of collision (Issue 33)
      let participant_id = generateParticipantId();
      let rpcRes: any = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        const res = await supabaseAdmin!.rpc('create_participant_with_registration', {
          p_participant_id: participant_id,
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
          break;
        }

        if (res.error && res.error.message?.includes('duplicate key')) {
          participant_id = generateParticipantId();
          continue;
        }

        break;
      }

      if (rpcRes) {
        return rpcRes as { participant: Participant; registration: Registration; status: 'NEW' | 'PENDING' | 'ALREADY_REGISTERED' };
      }

      // Fallback if RPC is unavailable: JS level atomic insert (with rollback on error)
      const { data: participant, error: pErr } = await supabaseAdmin!
        .from('participants')
        .insert({
          participant_id,
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

      const participant_id = generateParticipantId();
      const mockUniqueId = crypto.randomUUID();

      const newParticipant: Participant = {
        id: `p-mock-${mockUniqueId}`,
        participant_id,
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
      
      await supabaseAdmin!
        .from('participants')
        .update({ status: 'ACTIVE' })
        .or(`id.eq.${pIdToUpdate},participant_id.eq.${cleanId.toUpperCase()}`);

      const { data: participant } = await supabaseAdmin!
        .from('participants')
        .select('participant_id')
        .or(`id.eq.${pIdToUpdate},participant_id.eq.${cleanId.toUpperCase()}`)
        .maybeSingle();

      return {
        id: reg?.id || cleanId,
        participant_id: participant?.participant_id || reg?.participant_id || cleanId,
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
      let participant = mockStore.participants.find(p => p.id === cleanId || p.participant_id.toUpperCase() === cleanId.toUpperCase());
      
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
    const isConfirmed = status === 'SUCCESS';
    const confirmedAt = isConfirmed ? new Date().toISOString() : undefined;
    const regStatus: RegistrationStatus = isConfirmed 
      ? 'CONFIRMED' 
      : (status === 'FAILED' || status === 'REFUNDED' ? 'CANCELLED' : 'PENDING');

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('registrations')
        .update({
          payment_status: status,
          registration_status: regStatus,
          payment_reference: paymentReference,
          confirmed_at: confirmedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await supabaseAdmin!
          .from('participants')
          .update({ status: isConfirmed ? 'ACTIVE' : 'PENDING' })
          .eq('id', data.participant_id);
      }

      return data;
    } else {
      const reg = mockStore.registrations.find(r => r.id === registrationId);
      if (!reg) throw new Error("Registration record not found");
      reg.payment_status = status;
      reg.registration_status = regStatus;
      if (paymentReference) reg.payment_reference = paymentReference;
      if (confirmedAt) reg.confirmed_at = confirmedAt;
      reg.updated_at = new Date().toISOString();

      const participant = mockStore.participants.find(p => p.id === reg.participant_id);
      if (participant) {
        participant.status = isConfirmed ? 'ACTIVE' : 'PENDING';
      }

      return reg;
    }
  }

  // -----------------------------------------------------------------------
  // QUESTIONS & QUIZ ENGINE (Zero secret answer leak to client)
  // -----------------------------------------------------------------------

  static async getClientQuestions(): Promise<ClientQuestion[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('questions')
        .select('id, question_text, option_a, option_b, option_c, option_d, category')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } else {
      return mockStore.questions.map(({ correct_option, difficulty, explanation, ...rest }) => rest);
    }
  }

  static async getAdminQuestions(): Promise<Question[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data, error } = await supabaseAdmin!
        .from('questions')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } else {
      return mockStore.questions;
    }
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

  static async getQuizSessionByParticipantId(participantId: string): Promise<QuizSession | null> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data } = await supabaseAdmin!
        .from('quiz_sessions')
        .select('*')
        .eq('participant_id', participantId)
        .maybeSingle();

      return data || null;
    } else {
      return mockStore.quizSessions.find(s => s.participant_id === participantId) || null;
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
      const { data, error } = await supabaseAdmin!
        .from('quiz_session_questions')
        .select('*')
        .eq('session_id', sessionId)
        .order('question_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } else {
      return mockStore.quizSessionQuestions
        .filter(q => q.session_id === sessionId)
        .sort((a, b) => a.question_order - b.question_order);
    }
  }

  static async getFrozenSessionClientQuestions(sessionId: string): Promise<ClientQuestion[]> {
    const frozen = await this.getFrozenSessionQuestions(sessionId);
    return frozen.map(({ question_id, question_text, option_a, option_b, option_c, option_d, category }) => ({
      id: question_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      category
    }));
  }

  static async getOrCreateQuizSession(participantId: string): Promise<{ session: QuizSession; answers: Record<string, 'A'|'B'|'C'|'D'> }> {
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

      // 3. Freeze question bank for this session (Issue 12)
      const allQuestions = await this.getAdminQuestions();
      const shuffled = shuffleWithSeed(allQuestions, participantId).slice(0, EVENT_CONFIG.totalQuestions || 50);

      const sessionQuestionsToInsert = shuffled.map((q, idx) => ({
        session_id: newSession.id,
        question_id: q.id,
        question_order: idx + 1,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
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
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          option_d: q.option_d,
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
    const frozenQuestions = await this.getFrozenSessionQuestions(sessionId);
    const isAssigned = frozenQuestions.some(q => q.question_id === questionId);
    if (!isAssigned) {
      throw new Error("Unauthorized: Question is not assigned to this participant session");
    }

    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { error } = await supabaseAdmin!
        .from('quiz_answers')
        .upsert({
          session_id: sessionId,
          question_id: questionId,
          selected_option: selectedOption,
          updated_at: new Date().toISOString()
        }, { onConflict: 'session_id,question_id' });

      if (error) throw error;
      return true;
    } else {
      const idx = mockStore.quizAnswers.findIndex(a => a.session_id === sessionId && a.question_id === questionId);
      if (idx !== -1) {
        mockStore.quizAnswers[idx].selected_option = selectedOption;
        mockStore.quizAnswers[idx].updated_at = new Date().toISOString();
      } else {
        mockStore.quizAnswers.push({
          id: `ans-${Date.now()}-${Math.random()}`,
          session_id: sessionId,
          question_id: questionId,
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
    const frozenMap = new Map(frozenQuestions.map(q => [q.question_id, q.correct_option]));

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
        const correct = frozenMap.get(a.question_id);
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

  // -----------------------------------------------------------------------
  // CONTROLLED RESULTS RELEASE & CERTIFICATES & LEADERBOARD
  // -----------------------------------------------------------------------

  static async getLeaderboard(): Promise<any[]> {
    if (isSupabaseMode()) {
      validateDatabaseConfig();
      const { data } = await supabaseAdmin!
        .from('quiz_sessions')
        .select('score, total_questions, submitted_at, participants(name, state, participant_id)')
        .eq('status', 'SUBMITTED')
        .order('score', { ascending: false })
        .limit(10);

      return data || [];
    } else {
      const submitted = mockStore.quizSessions.filter(s => s.status === 'SUBMITTED');
      return submitted.map(s => {
        const p = mockStore.participants.find(item => item.id === s.participant_id);
        return {
          score: s.score,
          total_questions: s.total_questions,
          submitted_at: s.submitted_at,
          participants: {
            name: p?.name || 'Participant',
            state: p?.state || 'India',
            participant_id: p?.participant_id || 'TKFK26-000000'
          }
        };
      }).sort((a, b) => (b.score || 0) - (a.score || 0));
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

    const code = generateCertificateCode(participant.participant_id);
    const vHash = generateVerificationHash(participant.participant_id, participant.name);

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
        p = mockStore.participants.find(item => item.participant_id.toUpperCase() === clean);
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
}
