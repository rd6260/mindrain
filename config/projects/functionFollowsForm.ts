import { registrationPath, type ProjectBaseConfig } from './types';

const eventId = '6159b71a-f973-453a-a383-6b2bbfca707a';

export const FUNCTION_FOLLOWS_FORM = {
  eventId,
  slug: 'function-follows-form',
  title: 'Function Follows Form',
  kind: 'workshop',
  pagePath: '/workshops/function-follows-form',
  registrationPath: registrationPath(eventId),
} as const satisfies ProjectBaseConfig;
