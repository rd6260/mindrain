/**
 * Passing the Razorpay charges on to the payer.
 * Razorpay deducts `GATEWAY_FEE_PERCENT` of the amount charged, plus GST on that fee, so to receive
 * `net` we charge `total` such that total − fee − gst = net.
 * Note: Razorpay's real rate varies by method (e.g. international cards / Amex cost more); this uses the
 * standard domestic rate.
 */
export const GATEWAY_FEE_PERCENT = 2;
export const GST_PERCENT = 18;

export interface GatewayCharges {
  totalMinor: number;
  gatewayMinor: number;
  gstMinor: number;
}

export function withGatewayFee(netMinor: number): GatewayCharges {
  const rate = (GATEWAY_FEE_PERCENT / 100) * (1 + GST_PERCENT / 100);
  const totalMinor = Math.ceil(netMinor / (1 - rate));
  const gatewayMinor = Math.round((totalMinor * GATEWAY_FEE_PERCENT) / 100);
  // Whatever is left (GST plus a paisa of rounding) so the rows always add up to the total.
  const gstMinor = totalMinor - netMinor - gatewayMinor;
  return { totalMinor, gatewayMinor, gstMinor };
}
