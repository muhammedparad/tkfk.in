export type ParticipantStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED' | 'CANCELLED';

export type RegistrationStatus = 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'CANCELLED';

export type PaymentStatus = 
  | 'PENDING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'MANUAL_REVIEW';

export type SessionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';

export interface Participant {
  id: string;
  participant_id?: string | null; // TKFK26-XXXXXX (generated only upon successful payment)
  auth_user_id?: string;
  name: string;
  email: string;
  phone: string;
  college?: string;
  state: string;
  city?: string;
  referral_code?: string;
  status: ParticipantStatus;
  created_at: string;
  updated_at?: string;
}

export interface Registration {
  id: string;
  participant_id: string;
  registration_status: RegistrationStatus;
  payment_status: PaymentStatus;
  payment_reference?: string;
  amount: number;
  currency: string;
  confirmed_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id: string;
  registration_id: string;
  provider: string;
  provider_order_id?: string | null;
  provider_payment_id?: string | null;
  provider_event_id?: string | null;
  amount: number;
  currency: string;
  payment_status: PaymentStatus;
  provider_status?: string | null;
  created_at: string;
  updated_at: string;
  paid_at?: string | null;
  refunded_at?: string | null;
  last_webhook_at?: string | null;
}

export interface PaymentEvent {
  id: string;
  transaction_id?: string | null;
  registration_id?: string | null;
  provider: string;
  provider_event_id: string;
  event_type: string;
  payload: Record<string, any>;
  processed: boolean;
  processing_error?: string | null;
  created_at: string;
}

export interface ReferralCode {
  id: string;
  code: string;
  active: boolean;
  usage_count: number;
  created_at: string;
}

export interface Question {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: 'A' | 'B' | 'C' | 'D'; // SECRET - omitted in participant payload during active quiz
  category?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  explanation?: string;
}

export interface ClientQuestion {
  id: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category?: string;
}

export interface QuizSession {
  id: string;
  participant_id: string;
  started_at: string;
  expires_at: string;
  submitted_at?: string;
  status: SessionStatus;
  score?: number;
  total_questions: number;
}

export interface QuizSessionQuestion {
  id: string;
  session_id: string;
  question_id: string;
  question_order: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  category?: string;
  created_at?: string;
}

export interface QuizAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D';
  updated_at: string;
}

export interface Certificate {
  id: string;
  certificate_code: string; // e.g. TKFK26-CERT-88492
  participant_id: string;
  participant_name: string;
  issued_at: string;
  verification_hash: string;
  score_percentage: number;
  grade: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface StudyModule {
  id: string;
  slug: string;
  title: string;
  description: string;
  read_time: string;
  content: string;
  key_points: string[];
}

export interface ResultsReleaseConfig {
  published: boolean;
  published_at?: string;
  note?: string;
}

export interface PaymentOrderInit {
  registrationId: string;
  amount: number;
  currency?: string;
  participantEmail?: string;
  participantPhone?: string;
  participantName?: string;
  notes?: Record<string, string>;
}

export interface PaymentOrderResult {
  orderId: string;
  amount: number;
  currency: string;
  keyId?: string;
  provider?: string;
  providerOrderId?: string;
  status?: PaymentStatus | string;
  rawOrder?: any;
}

export interface WebhookVerificationResult {
  valid: boolean;
  registrationId?: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  providerEventId?: string;
  eventType?: string;
  status?: PaymentStatus;
  providerStatus?: string;
  amount?: number;
  currency?: string;
  reason?: string;
  rawPayloadObj?: any;
}

export interface NormalizedPaymentState {
  status: PaymentStatus;
  providerStatus: string;
  providerOrderId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
}
