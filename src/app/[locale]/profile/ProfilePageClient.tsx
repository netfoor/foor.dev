'use client';

import React, { useState } from 'react';
import { useTranslation, useLocale, useDateFormatter, useNumberFormatter } from '@/lib/i18n/client';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useAuth } from '@/context/auth-context';

interface ProfilePageClientProps {
  initialTranslations: any;
}

/**
 * Client Component que demuestra el uso completo del sistema de i18n
 */
export default function ProfilePageClient({ initialTranslations }: ProfilePageClientProps) {
  const { t } = useTranslation('profile');
  const { locale } = useLocale();
  const formatDate = useDateFormatter();
  const formatNumber = useNumberFormatter();
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.signInDetails?.loginId?.split('@')[0] || '',
    lastName: '',
    email: user?.signInDetails?.loginId || '',
    phone: '',
    bio: ''
  });

  const handleSave = () => {
    // Simular guardado
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    // En una aplicación real, aquí harías la llamada a la API
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Resetear form data
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('personal_information')}
          </p>
        </div>
        
        <LanguageSelector 
          variant="dropdown" 
          size="md"
          showNativeNames={true}
          showFlags={true}
        />
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {t('personal_information')}
          </h2>
          
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('edit_profile')}
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                {t('save_changes')}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-400 transition-colors"
              >
                {t('cancel', { defaultValue: 'Cancel' })}
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.first_name')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.firstName || '-'}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.last_name')}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.lastName || '-'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.email')}
              </label>
              <p className="text-gray-900">{formData.email}</p>
              <p className="text-xs text-gray-500 mt-1">
                {t('fields.email')} {t('cannot_be_changed', { defaultValue: 'cannot be changed' })}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.phone')}
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.phone || '-'}</p>
              )}
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('fields.bio')}
              </label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{formData.bio || '-'}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información del Sistema (Demostración de funcionalidades) */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('system_info', { defaultValue: 'System Information' })}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('current_language', { defaultValue: 'Current Language' })}
            </h4>
            <p className="text-lg font-semibold text-gray-900">
              {locale.toUpperCase()}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('current_date', { defaultValue: 'Current Date' })}
            </h4>
            <p className="text-lg font-semibold text-gray-900">
              {formatDate(new Date(), { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t('formatted_number', { defaultValue: 'Formatted Number' })}
            </h4>
            <p className="text-lg font-semibold text-gray-900">
              {formatNumber(12345.67, { 
                style: 'currency', 
                currency: locale === 'es' ? 'EUR' : 'USD' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Demostración de interpolación */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          {t('interpolation_demo', { defaultValue: 'Interpolation Demo' })}
        </h3>
        <p className="text-blue-700">
          {t('welcome_message', { 
            name: formData.firstName || 'User',
            defaultValue: 'Welcome, {{name}}! Your profile is in {{locale}} language.',
            locale: locale.toUpperCase()
          })}
        </p>
      </div>

      {/* Debug Information (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">
            Debug Information
          </h3>
          <pre className="text-sm text-yellow-700 overflow-auto">
            {JSON.stringify({ locale, formData, user: user?.signInDetails }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
