'use client';

import { useState } from 'react';
import { colors } from '@/utils/colors';
import { RegistrationFormData } from '@/types';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    institution: '',
    category: 'solo',
    nationality: 'indian',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submission
    alert('Registration submitted! (This is a mock form)');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: colors.white }}
        onClick={(e) => e.stopPropagation()}
        data-testid="registration-modal"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 
            className="text-2xl font-bold"
            style={{ color: colors.textPrimary }}
          >
            Registration Form
          </h2>
          <button
            onClick={onClose}
            className="text-2xl"
            style={{ color: colors.textSecondary }}
            data-testid="close-modal-button"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: colors.textPrimary }}
            >
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: colors.border }}
              data-testid="registration-name-input"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: colors.textPrimary }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: colors.border }}
              data-testid="registration-email-input"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: colors.textPrimary }}
            >
              Phone
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: colors.border }}
              data-testid="registration-phone-input"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: colors.textPrimary }}
            >
              Institution
            </label>
            <input
              type="text"
              required
              value={formData.institution}
              onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: colors.border }}
              data-testid="registration-institution-input"
            />
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: colors.textPrimary }}
            >
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as 'solo' | 'group' })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: colors.border }}
              data-testid="registration-category-select"
            >
              <option value="solo">Solo</option>
              <option value="group">Group</option>
            </select>
          </div>

          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: colors.textPrimary }}
            >
              Nationality
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value as 'indian' | 'international' })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: colors.border }}
              data-testid="registration-nationality-select"
            >
              <option value="indian">Indian</option>
              <option value="international">International</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-6 py-3 rounded-full text-white font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent }}
            data-testid="registration-submit-button"
          >
            Submit Registration
          </button>
        </form>
      </div>
    </div>
  );
}
