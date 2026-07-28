/**
 * Registration deadline: 30 July 2026 at 23:59:59 (IST / Asia/Kolkata)
 *
 * Returns `true`  while the current time is at or before the deadline.
 * Returns `false` once the deadline has passed.
 */
export const REGISTRATION_DEADLINE = new Date('2026-07-30T23:59:59+05:30');
// export const REGISTRATION_DEADLINE = new Date('2026-07-28T23:33:50+05:30');

export function isRegistrationOpen(): boolean {
  return new Date() <= REGISTRATION_DEADLINE;
}
