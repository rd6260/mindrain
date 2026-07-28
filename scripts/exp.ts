export const CERTIFICATES_AVAILABLE_AFTER = new Date('2026-07-29T23:59:59+05:30');

export function isCertificatesAvailable(): boolean {
  return new Date() > CERTIFICATES_AVAILABLE_AFTER;
}

console.log(isCertificatesAvailable())

