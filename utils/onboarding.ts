/**
 * Utility to determine whether a user_info row represents a fully completed onboarding.
 *
 * Constraints (mirror the onboarding page validation):
 *  - name must be non-empty
 *  - role must be non-empty
 *  - if role is Student or Educator → institute must be non-empty
 *  - if role is Student → academic_level must be non-empty
 *  - if role is Student → academic_year must be a positive integer
 */

const ROLES_WITH_INSTITUTE = ['Student', 'Educator'];

export interface UserInfo {
  name?: string | null;
  role?: string | null;
  institute?: string | null;
  academic_year?: number | null;
  academic_level?: string | null;
}

export function isOnboardingComplete(userInfo: UserInfo | null | undefined): boolean {
  if (!userInfo) return false;

  const { name, role, institute, academic_year, academic_level } = userInfo;

  if (!name || !name.trim()) return false;
  if (!role || !role.trim()) return false;

  if (ROLES_WITH_INSTITUTE.includes(role)) {
    if (!institute || !institute.trim()) return false;
  }

  if (role === 'Student') {
    if (!academic_level || !academic_level.trim()) return false;
    if (!academic_year || academic_year < 1) return false;
  }

  return true;
}
