import 'server-only';
import { IPaymentAdapter } from './types';
import { RazorpayPaymentAdapter } from './adapters/razorpayAdapter';
import { MockPaymentAdapter } from './adapters/mockAdapter';
import { DBService } from '@/services/db';
import { Registration, PaymentStatus, PaymentOrderInit, PaymentOrderResult } from '@/types';

const VALID_SYSTEM_STATUSES: PaymentStatus[] = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'MANUAL_REVIEW'];

/**
 * Server Payment Service Factory & Webhook Processing Engine
 */
export class PaymentService {
  private static instance: IPaymentAdapter | null = null;

  /**
   * Get configured payment adapter instance.
   * If PAYMENT_PROVIDER='mock' or DATA_MODE='mock', returns MockPaymentAdapter.
   * Otherwise returns RazorpayPaymentAdapter with strict credential enforcement.
   */
  static getAdapter(): IPaymentAdapter {
    if (this.instance) {
      return this.instance;
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const isPlaceholderKey = !keyId || keyId.includes('rzp_test_key_12345');
    const provider = process.env.PAYMENT_PROVIDER?.toLowerCase() || 
      (process.env.DATA_MODE === 'mock' || isPlaceholderKey ? 'mock' : 'razorpay');

    if (provider === 'mock') {
      this.instance = new MockPaymentAdapter();
      return this.instance;
    }

    const missingConfigs: string[] = [];
    if (!keyId) missingConfigs.push('RAZORPAY_KEY_ID (or NEXT_PUBLIC_RAZORPAY_KEY_ID)');
    if (!keySecret) missingConfigs.push('RAZORPAY_KEY_SECRET');
    if (!webhookSecret) missingConfigs.push('RAZORPAY_WEBHOOK_SECRET');

    if (missingConfigs.length > 0) {
      throw new Error(
        `[PAYMENT CONFIGURATION ERROR] Missing required Razorpay environment configuration: ${missingConfigs.join(', ')}. Set PAYMENT_PROVIDER=mock for local test mock adapter.`
      );
    }

    this.instance = new RazorpayPaymentAdapter();
    return this.instance;
  }

  /**
   * Create Payment Order & Record Transaction
   */
  static async createOrder(init: PaymentOrderInit): Promise<PaymentOrderResult> {
    const adapter = this.getAdapter();
    const orderResult = await adapter.createOrder(init);

    // Record initial PENDING transaction in DB
    await DBService.createPaymentTransaction({
      registration_id: init.registrationId,
      provider: adapter.providerName,
      provider_order_id: orderResult.orderId,
      amount: init.amount,
      currency: init.currency || 'INR',
      payment_status: 'PENDING',
      provider_status: 'created'
    });

    return orderResult;
  }

  /**
   * Trusted Server Webhook Handler
   * 
   * STRICT SAFETY RULES:
   * 1. Missing provider event ID -> REJECT immediately.
   * 2. Missing status -> REJECT / MANUAL_REVIEW.
   * 3. Unknown status -> REJECT / MANUAL_REVIEW.
   * 4. Missing provider transaction reference on SUCCESS -> REJECT / MANUAL_REVIEW.
   * 5. Never manufacture provider evidence or invent fake IDs / fallbacks.
   */
  static async handleWebhook(
    rawPayload: string, 
    signature: string,
    headerEventId?: string
  ): Promise<{ success: boolean; message: string; registration?: Registration; paymentStatus?: PaymentStatus }> {
    const adapter = this.getAdapter();

    // Check 1: Provider Signature & Payload Verification
    const verified = await adapter.verifyWebhook(rawPayload, signature, headerEventId);
    if (!verified.valid) {
      return { 
        success: false, 
        message: verified.reason || "Invalid webhook signature or payload verification failed." 
      };
    }

    // Required Behavior 1: Missing provider event ID -> Reject immediately
    const providerEventId = verified.providerEventId?.trim();
    if (!providerEventId) {
      return {
        success: false,
        message: "Server Check Failed: Webhook payload is missing required provider_event_id."
      };
    }

    // Required Behavior 2 & 3: Missing or Unknown status -> Reject / MANUAL_REVIEW
    const targetStatus = verified.status;
    if (!targetStatus) {
      return {
        success: false,
        paymentStatus: 'MANUAL_REVIEW',
        message: "Server Check Failed: Webhook payload is missing payment status. Flagged for MANUAL_REVIEW."
      };
    }

    if (!VALID_SYSTEM_STATUSES.includes(targetStatus)) {
      return {
        success: false,
        paymentStatus: 'MANUAL_REVIEW',
        message: `Server Check Failed: Webhook payload contains unknown payment status '${targetStatus}'. Flagged for MANUAL_REVIEW.`
      };
    }

    const providerOrderId = verified.providerOrderId?.trim() || '';
    const providerPaymentId = verified.providerPaymentId?.trim() || '';
    const registrationId = verified.registrationId?.trim() || '';

    // Check 2: Idempotency Check (Has provider_event_id already been processed or recorded?)
    const eventRecord = await DBService.recordPaymentEvent({
      provider: adapter.providerName,
      provider_event_id: providerEventId,
      registration_id: registrationId || undefined,
      event_type: verified.eventType || 'payment.event',
      payload: verified.rawPayloadObj || {}
    });

    if (eventRecord.isDuplicate) {
      const existingReg = registrationId ? await DBService.getRegistrationById(registrationId) : null;
      return {
        success: true,
        message: `Idempotent execution: Provider event '${providerEventId}' was previously processed or recorded.`,
        registration: existingReg || undefined,
        paymentStatus: existingReg?.payment_status
      };
    }

    // Check 3: Check Registration Existence
    if (!registrationId) {
      await DBService.markPaymentEventProcessed(eventRecord.event.id, false, "Missing registrationId in webhook payload");
      return { success: false, message: "Server Check Failed: Webhook payload is missing registrationId." };
    }

    const registration = await DBService.getRegistrationById(registrationId);
    if (!registration) {
      await DBService.markPaymentEventProcessed(eventRecord.event.id, false, `Registration ID '${registrationId}' does not exist.`);
      return { success: false, message: `Server Check Failed: Registration ID '${registrationId}' does not exist in database.` };
    }

    // Check 4: Validate Amount & Currency Match
    if (verified.amount !== undefined && verified.amount !== registration.amount) {
      await DBService.updatePaymentStatus(registration.id, 'MANUAL_REVIEW', providerPaymentId || undefined);
      await DBService.updatePaymentTransactionStatus({
        registration_id: registration.id,
        provider: adapter.providerName,
        provider_order_id: providerOrderId || undefined,
        provider_payment_id: providerPaymentId || undefined,
        provider_event_id: providerEventId,
        amount: registration.amount,
        currency: registration.currency,
        payment_status: 'MANUAL_REVIEW',
        provider_status: verified.providerStatus || 'amount_mismatch',
        last_webhook_at: new Date().toISOString()
      });
      await DBService.markPaymentEventProcessed(eventRecord.event.id, true, `MANUAL_REVIEW: Amount mismatch (Expected: ₹${registration.amount}, Received: ₹${verified.amount})`);
      
      return {
        success: false,
        paymentStatus: 'MANUAL_REVIEW',
        message: `Server Check Failed: Payment amount mismatch! Expected ₹${registration.amount}, received ₹${verified.amount}. Flagged for MANUAL_REVIEW.`
      };
    }

    // LATE FAILED EVENT PROTECTION: If registration is already SUCCESS / CONFIRMED, ignore late payment.failed for an earlier attempt!
    if (registration.payment_status === 'SUCCESS' && targetStatus === 'FAILED') {
      await DBService.markPaymentEventProcessed(
        eventRecord.event.id, 
        true, 
        `Ignored late ${verified.eventType} event for already confirmed registration '${registration.id}'`
      );

      return {
        success: true,
        message: `Ignored late payment failure event for already confirmed registration. Registration remains SUCCESS.`,
        registration,
        paymentStatus: 'SUCCESS'
      };
    }

    // Check 5: Target Status State Transition
    if (targetStatus === 'SUCCESS') {
      const paymentReference = providerPaymentId || providerOrderId;
      if (!paymentReference) {
        await DBService.updatePaymentStatus(registration.id, 'MANUAL_REVIEW');
        await DBService.markPaymentEventProcessed(eventRecord.event.id, true, 'MANUAL_REVIEW: Missing provider payment reference on SUCCESS event');
        return {
          success: false,
          paymentStatus: 'MANUAL_REVIEW',
          message: "Server Check Failed: Successful payment event is missing provider transaction reference. Flagged for MANUAL_REVIEW."
        };
      }

      const updatedReg = await DBService.activateConfirmedRegistration(
        registration.id,
        paymentReference
      );

      await DBService.updatePaymentTransactionStatus({
        registration_id: registration.id,
        provider: adapter.providerName,
        provider_order_id: providerOrderId || undefined,
        provider_payment_id: providerPaymentId || undefined,
        provider_event_id: providerEventId,
        amount: registration.amount,
        currency: registration.currency,
        payment_status: 'SUCCESS',
        provider_status: verified.providerStatus || 'captured',
        paid_at: new Date().toISOString(),
        last_webhook_at: new Date().toISOString()
      });

      await DBService.markPaymentEventProcessed(eventRecord.event.id, true);

      return {
        success: true,
        message: "Server Verification Passed: Payment verified, transaction recorded, registration activated.",
        registration: updatedReg,
        paymentStatus: 'SUCCESS'
      };

    } else if (targetStatus === 'REFUNDED') {
      const updatedReg = await DBService.updatePaymentStatus(registration.id, 'REFUNDED', providerPaymentId || undefined);
      await DBService.updatePaymentTransactionStatus({
        registration_id: registration.id,
        provider: adapter.providerName,
        provider_order_id: providerOrderId || undefined,
        provider_payment_id: providerPaymentId || undefined,
        provider_event_id: providerEventId,
        amount: registration.amount,
        currency: registration.currency,
        payment_status: 'REFUNDED',
        provider_status: verified.providerStatus || 'refunded',
        refunded_at: new Date().toISOString(),
        last_webhook_at: new Date().toISOString()
      });
      await DBService.markPaymentEventProcessed(eventRecord.event.id, true);

      return {
        success: true,
        message: "Payment marked as REFUNDED.",
        registration: updatedReg,
        paymentStatus: 'REFUNDED'
      };

    } else {
      const updatedReg = await DBService.updatePaymentStatus(registration.id, targetStatus, providerPaymentId || undefined);
      await DBService.updatePaymentTransactionStatus({
        registration_id: registration.id,
        provider: adapter.providerName,
        provider_order_id: providerOrderId || undefined,
        provider_payment_id: providerPaymentId || undefined,
        provider_event_id: providerEventId,
        amount: registration.amount,
        currency: registration.currency,
        payment_status: targetStatus,
        provider_status: verified.providerStatus || targetStatus.toLowerCase(),
        last_webhook_at: new Date().toISOString()
      });
      await DBService.markPaymentEventProcessed(eventRecord.event.id, true);

      return {
        success: false,
        message: `Payment status updated to ${targetStatus}`,
        registration: updatedReg,
        paymentStatus: targetStatus
      };
    }
  }
}
