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
 * Server-Only Razorpay Payment Adapter
 * Communicates directly with Razorpay REST APIs (https://api.razorpay.com/v1/)
 */
export class RazorpayPaymentAdapter implements IPaymentAdapter {
  readonly providerName = 'razorpay';

  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    const rawKeyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TgbVrJ2ippFn2V';
    const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || 'RNcF2YPJTXsSDQCeWtrSmFlm';
    const rawWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || 'gkc26_secret_webhook_signature_key';

    this.keyId = rawKeyId.trim().replace(/^["']|["']$/g, '');
    this.keySecret = rawKeySecret.trim().replace(/^["']|["']$/g, '');
    this.webhookSecret = rawWebhookSecret.trim().replace(/^["']|["']$/g, '');
  }

  private getAuthHeader(): string {
    const creds = `${this.keyId}:${this.keySecret}`;
    return `Basic ${Buffer.from(creds).toString('base64')}`;
  }

  /**
   * Create Razorpay Order via REST API (POST https://api.razorpay.com/v1/orders)
   */
  async createOrder(init: PaymentOrderInit): Promise<PaymentOrderResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('[RAZORPAY CONFIG ERROR] Razorpay credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing in server environment.');
    }

    const amountInPaise = Math.round(init.amount * 100);
    const currency = (init.currency || 'INR').toUpperCase();

    if (currency !== 'INR') {
      throw new Error(`[RAZORPAY CURRENCY ERROR] Only INR currency is supported for Gandhi Knowledge Challenge registration.`);
    }

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: init.registrationId,
        notes: {
          registrationId: init.registrationId,
          participantName: init.participantName || '',
          participantEmail: init.participantEmail || ''
        }
      })
    });

    const data = await res.json();

    if (!res.ok || !data.id) {
      throw new Error(`[RAZORPAY API ERROR] Order creation failed: ${data.error?.description || JSON.stringify(data)}`);
    }

    return {
      orderId: data.id,
      provider: this.providerName,
      amount: init.amount,
      currency: 'INR',
      keyId: this.keyId,
      status: 'PENDING',
      rawOrder: data
    };
  }

  /**
   * Verify Razorpay Webhook Signature & Payload
   */
  async verifyWebhook(rawPayload: string, signature: string, headerEventId?: string): Promise<WebhookVerificationResult> {
    if (!this.webhookSecret) {
      throw new Error('[RAZORPAY SECURITY ERROR] RAZORPAY_WEBHOOK_SECRET is not configured in server environment!');
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(rawPayload)
      .digest('hex');

    const signatureBuf = Buffer.from(signature || '');
    const expectedBuf = Buffer.from(expectedSignature);

    const isValidSignature = Boolean(
      signature && 
      signatureBuf.length === expectedBuf.length && 
      crypto.timingSafeEqual(signatureBuf, expectedBuf)
    );

    if (!isValidSignature) {
      return {
        valid: false,
        reason: 'Razorpay webhook HMAC-SHA256 signature mismatch verification failed'
      };
    }

    try {
      const payloadObj = JSON.parse(rawPayload);
      
      const eventType = payloadObj.event;
      if (!eventType) {
        return {
          valid: false,
          reason: 'Webhook payload is missing required event type'
        };
      }

      const providerEventId = (headerEventId && headerEventId.trim()) || payloadObj.event_id || payloadObj.id;
      if (!providerEventId) {
        return {
          valid: false,
          reason: 'Webhook payload is missing required provider event_id'
        };
      }

      const paymentEntity = payloadObj.payload?.payment?.entity || payloadObj.entity || {};
      const providerPaymentId = paymentEntity.id || payloadObj.payment_id;
      const providerOrderId = paymentEntity.order_id || payloadObj.order_id;
      const registrationId = paymentEntity.notes?.registrationId || payloadObj.registrationId;

      // Currency check: USD and other non-INR currencies MUST be rejected
      const currency = (paymentEntity.currency || payloadObj.currency || '').toUpperCase();
      if (!currency || currency !== 'INR') {
        return {
          valid: false,
          reason: `Non-INR or missing payment currency '${currency}' rejected. Only INR payments are accepted.`
        };
      }

      const rawAmount = paymentEntity.amount !== undefined ? paymentEntity.amount / 100 : payloadObj.amount;
      if (rawAmount === undefined || rawAmount === null || isNaN(Number(rawAmount))) {
        return {
          valid: false,
          reason: 'Webhook payload is missing required payment amount'
        };
      }
      const amount = Number(rawAmount);

      const providerStatus = paymentEntity.status || payloadObj.status;
      if (!providerStatus) {
        return {
          valid: false,
          reason: 'Webhook payload is missing required payment status'
        };
      }

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
        reason: `Malformed JSON Razorpay webhook body: ${err.message}`
      };
    }
  }

  /**
   * Query Razorpay Payment Status via REST API
   */
  async fetchPaymentStatus(providerOrderIdOrPaymentId: string): Promise<NormalizedPaymentState> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('[RAZORPAY CONFIG ERROR] Razorpay credentials missing for status query.');
    }

    const endpoint = providerOrderIdOrPaymentId.startsWith('order_')
      ? `https://api.razorpay.com/v1/orders/${providerOrderIdOrPaymentId}`
      : `https://api.razorpay.com/v1/payments/${providerOrderIdOrPaymentId}`;

    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Authorization': this.getAuthHeader() }
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(`[RAZORPAY API ERROR] Status fetch failed: ${data.error?.description || JSON.stringify(data)}`);
    }

    const providerStatus = data.status;
    if (!providerStatus) {
      throw new Error('[RAZORPAY API ERROR] Payment status response missing status field');
    }

    const status = this.normalizePaymentState(providerStatus);
    const amount = data.amount !== undefined ? data.amount / 100 : undefined;

    return {
      providerOrderId: data.order_id || (data.id?.startsWith('order_') ? data.id : undefined),
      providerPaymentId: data.id?.startsWith('pay_') ? data.id : undefined,
      status,
      providerStatus,
      amount,
      currency: data.currency || 'INR'
    };
  }

  /**
   * Process Refund via REST API (POST https://api.razorpay.com/v1/payments/:id/refund)
   */
  async processRefund(providerPaymentId: string, amount?: number): Promise<{ success: boolean; refundId?: string }> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('[RAZORPAY CONFIG ERROR] Razorpay credentials missing for refund processing.');
    }

    const res = await fetch(`https://api.razorpay.com/v1/payments/${providerPaymentId}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': this.getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(amount ? { amount: Math.round(amount * 100) } : {})
      })
    });

    const data = await res.json();
    if (!res.ok || !data.id) {
      throw new Error(`[RAZORPAY REFUND ERROR] Refund failed: ${data.error?.description || JSON.stringify(data)}`);
    }

    return {
      success: true,
      refundId: data.id
    };
  }

  /**
   * Normalize Razorpay status to system PaymentStatus enum
   * IMPORTANT: 'authorized' does NOT count as SUCCESS until captured!
   * Unknown/unrecognized statuses return MANUAL_REVIEW.
   */
  normalizePaymentState(providerStatus: string): PaymentStatus {
    if (!providerStatus) return 'MANUAL_REVIEW';
    switch (providerStatus.toLowerCase()) {
      case 'captured':
      case 'paid':
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
