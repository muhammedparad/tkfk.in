import { 
  PaymentOrderInit, 
  PaymentOrderResult, 
  WebhookVerificationResult, 
  NormalizedPaymentState, 
  PaymentStatus 
} from '@/types';

/**
 * Clean Server-Only Payment Adapter Interface
 */
export interface IPaymentAdapter {
  readonly providerName: string;
  
  createOrder(init: PaymentOrderInit): Promise<PaymentOrderResult>;
  verifyWebhook(rawPayload: string, signature: string, headerEventId?: string): Promise<WebhookVerificationResult>;
  fetchPaymentStatus(providerOrderIdOrPaymentId: string): Promise<NormalizedPaymentState>;
  processRefund(providerPaymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string }>;
  normalizePaymentState(providerStatus: string): PaymentStatus;
}
