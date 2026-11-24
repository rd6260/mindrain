/** Ways an admin can record a payment that was collected outside the online checkout. */
export const MANUAL_PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'card', label: 'Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'razorpay_link', label: 'Razorpay payment link' },
  { value: 'other', label: 'Other' },
] as const;
