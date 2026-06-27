import { makeApiCall } from './runtimeApiBase.ts';

export type PaymentOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  razorpayOrderId?: string;
  createdAt: string;
};

export type PaymentVerification = {
  success: boolean;
  message: string;
  paymentId?: string;
  orderId?: string;
};

export type PaymentReceipt = {
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string;
  studentName?: string;
  email?: string;
  paymentMethod?: string;
};

const PAYMENTS_STORAGE_KEY = 'astar_payments';

const USE_LOCAL_MODE = String(import.meta.env.VITE_USE_LOCAL_PAYMENT_API || '').toLowerCase() === 'true';

function getLocalPayments(): PaymentReceipt[] {
  try {
    return JSON.parse(localStorage.getItem(PAYMENTS_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalPayment(receipt: PaymentReceipt): void {
  const existing = getLocalPayments();
  existing.unshift(receipt);
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(existing));
}

async function createOrder(amount: number, currency: string = 'INR', receipt?: string): Promise<PaymentOrder> {
  const receiptId = receipt || `rcpt_${Date.now()}`;

  if (USE_LOCAL_MODE) {
    return {
      id: `order_${Date.now()}`,
      amount,
      currency,
      receipt: receiptId,
      status: 'created',
      razorpayOrderId: `rzp_order_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
  }

  try {
    return await makeApiCall<PaymentOrder>('POST', '/api/payments/create-order', {
      amount,
      currency,
      receipt: receiptId,
    });
  } catch (error) {
    console.error('Failed to create payment order:', error);
    throw error;
  }
}

async function verifyPayment(
  razorpayPaymentId: string,
  razorpayOrderId: string,
  razorpaySignature: string
): Promise<PaymentVerification> {
  if (USE_LOCAL_MODE) {
    return {
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
    };
  }

  try {
    return await makeApiCall<PaymentVerification>('POST', '/api/payments/verify', {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });
  } catch (error) {
    console.error('Failed to verify payment:', error);
    throw error;
  }
}

function getPaymentHistory(): PaymentReceipt[] {
  return getLocalPayments();
}

export const paymentApi = {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  saveLocalPayment,
};
