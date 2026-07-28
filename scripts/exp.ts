//
// const getRegistrationType = (): 'Early Bird' | 'Regular' | 'Last Minute' => {
//   const now = new Date();
//   if (now >= new Date('2026-02-19T00:00:00') && now <= new Date('2026-03-22T23:59:59')) return 'Early Bird';
//   if (now >= new Date('2026-03-23T00:00:00') && now <= new Date('2026-05-31T23:59:59')) return 'Regular';
//   if (now >= new Date('2026-06-01T00:00:00') && now <= new Date('2026-06-25T23:59:59')) return 'Last Minute';
//   return 'Regular';
// };
//
export const REGISTRATION_DEADLINE = new Date('2026-07-28T23:22:59+05:30');
const now: Date = new Date();


console.log(now > REGISTRATION_DEADLINE)

