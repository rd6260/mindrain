/**
 * Contract between the generic registration page and a project's form.
 *
 * The page owns: auth/onboarding gate, loading the event + any existing
 * registration, calling /api/v3/register, redirecting to payment.
 * The form owns: its fields, validation, file uploads, and its submit button.
 */
export interface RegistrationFormProps {
  eventId: string;
  /** Previously saved `form_data` when editing an unpaid registration. */
  initialData: Record<string, any> | null;
  isEditMode: boolean;
  /** When set, only these form keys may be changed (other fields are shown read-only). */
  editableKeys?: readonly string[];
  /**
   * Hand the finished `form_data` to the page. Resolves after the registration
   * is saved (the page then redirects). Rejects with an Error whose message
   * should be shown to the user.
   */
  onSubmit: (formData: Record<string, any>) => Promise<void>;
}
