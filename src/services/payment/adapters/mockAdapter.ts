import 'server-only';
import { IPaymentAdapter } from '../types';
import { 
  PaymentOrderInit, 
  PaymentOrderResult, 
  WebhookVerificationResult, 
  NormalizedPaymentState, 
  PaymentStatus 
} from '@/types';
import crypto from 'crypto';

/**
 * Server-Only Mock Payment Adapter
 * Dedicated mock adapter for local testing and offline development.
 * ALL fake order creation and test webhook behaviors are strictly isolated here.
 */
export class MockPaymentAdapter implements IPaymentAdapter {
  readonly providerName = 'mock';

  /**
   * Create Mock Order for testing environment
   */
  async createOrder(init: PaymentOrderInit): Promise<PaymentOrderResult> {
    const mockOrderId = `order_mock_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const amountInPaise = Math.round(init.amount * 100);

    return {
      orderId: mockOrderId,
      provider: this.providerName,
      amount: init.amount,
      currency: 'INR',
      keyId: 'mock_key_id',
      status: 'PENDING',
      rawOrder: { 
        id: mockOrderId, 
        status: 'created', 
        amount: amountInPaise, 
        currency: 'INR',
        notes: {
          registrationId: init.registrationId
        }
      }
    };
  }

  /**
   * Verify Mock Webhook Signature & Payload
   */
  async verifyWebhook(rawPayload: string, signature: string, headerEventId?: string): Promise<WebhookVerificationResult> {
    try {
      const payloadObj = JSON.parse(rawPayload);
      const eventType = payloadObj.event || 'payment.captured';
      const providerEventId = (headerEventId && headerEventId.trim()) || payloadObj.event_id || payloadObj.id || `mock_evt_${Date.now()}`;
      
      const paymentEntity = payloadObj.payload?.payment?.entity || payloadObj.entity || payloadObj;
      const providerPaymentId = paymentEntity.id || payloadObj.payment_id || `pay_mock_${Date.now()}`;
      const providerOrderId = paymentEntity.order_id || payloadObj.order_id || `order_mock_${Date.now()}`;
      const registrationId = paymentEntity.notes?.registrationId || payloadObj.registrationId;

      const currency = (paymentEntity.currency || payloadObj.currency || 'INR').toUpperCase();
      if (currency !== 'INR') {
        return {
          valid: false,
          reason: `Non-INR payment currency '${currency}' rejected.`
        };
      }

      const rawAmount = paymentEntity.amount !== undefined ? paymentEntity.amount / 100 : (payloadObj.amount || 99);
      const amount = Number(rawAmount);

      const providerStatus = paymentEntity.status || payloadObj.status || 'captured';
      const status = this.normalizePaymentState(providerStatus);

      return {
        valid: true,
        providerEventId,
        providerOrderId,
        providerPaymentId,
        registrationId,
        status,
        providerStatus,
        eventType,
        amount,
        currency,
        rawPayloadObj: payloadObj
      };
    } catch (err: any) {
      return {
        valid: false,
        reason: `Malformed JSON mock webhook body: ${err.message}`
      };
    }
  }

  /**
   * Query Mock Payment Status
   */
  async fetchPaymentStatus(providerOrderIdOrPaymentId: string): Promise<NormalizedPaymentState> {
    return {
      providerOrderId: providerOrderIdOrPaymentId.startsWith('order_') ? providerOrderIdOrPaymentId : undefined,
      providerPaymentId: providerOrderIdOrPaymentId.startsWith('pay_') ? providerOrderIdOrPaymentId : undefined,
      status: 'PENDING',
      providerStatus: 'created',
      amount: 99,
      currency: 'INR'
    };
  }

  /**
   * Process Mock Refund
   */
  async processRefund(providerPaymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string }> {
    return {
      success: true,
      refundId: `rfnd_mock_${Date.now()}`
    };
  }

  /**
   * Normalize status to PaymentStatus
   */
  normalizePaymentState(providerStatus: string): PaymentStatus {
    if (!providerStatus) return 'MANUAL_REVIEW';
    switch (providerStatus.toLowerCase()) {
      case 'captured':
      case 'paid':
      case 'success':
        return 'SUCCESS';
      case 'failed':
        return 'FAILED';
      case 'refunded':
        return 'REFUNDED';
      case 'manual_review':
        return 'MANUAL_REVIEW';
      case 'authorized':
      case 'created':
      case 'pending':
        return 'PENDING';
      default:
        return 'MANUAL_REVIEW';
    }
  }
}
