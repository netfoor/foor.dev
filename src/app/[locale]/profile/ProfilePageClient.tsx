'use client';

import React, { useState } from 'react';
import { Heading, Text, Flex, View, Button, Card, TextField, TextAreaField } from '@aws-amplify/ui-react';
import { useTranslation, useLocale, useDateFormatter, useNumberFormatter } from '@/lib/i18n/client';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { useAuth } from '@/context/auth-context';
import { useTheme } from '@/hooks/useTheme';

interface ProfilePageClientProps {
  initialTranslations: any;
}

/**
 * Client Component que demuestra el uso completo del sistema de i18n
 * Diseño moderno con AWS Amplify UI y temas integrados
 */
export default function ProfilePageClient({ initialTranslations }: ProfilePageClientProps) {
  const { t } = useTranslation('profile');
  const { locale } = useLocale();
  const formatDate = useDateFormatter();
  const formatNumber = useNumberFormatter();
  const { user } = useAuth();
  const { mode } = useTheme();
  
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
    <View 
      padding={{ base: "1rem", medium: "2rem" }}
      style={{
        minHeight: '100vh',
        background: mode === 'dark' 
          ? 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)'
      }}
    >
      <View maxWidth="1200px" margin="0 auto">
        <Flex direction="column" gap="2rem">
          {/* Header */}
          <Flex
            direction={{ base: 'column', medium: 'row' }}
            justifyContent="space-between"
            alignItems={{ base: 'flex-start', medium: 'center' }}
            gap="1rem"
          >
            <View>
              <Heading
                level={1}
                fontSize={{ base: "2rem", medium: "2.5rem" }}
                fontWeight="700"
                marginBottom="0.5rem"
                style={{
                  color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                  background: mode === 'dark'
                    ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)'
                    : 'linear-gradient(135deg, #1E293B 0%, #3B82F6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundImage: mode === 'dark'
                    ? 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)'
                    : 'linear-gradient(135deg, #1E293B 0%, #3B82F6 100%)'
                }}
              >
                {t('title')}
              </Heading>
              <Text
                fontSize={{ base: "1rem", medium: "1.125rem" }}
                color={mode === 'dark' ? '#CBD5E1' : '#475569'}
              >
                {t('personal_information')}
              </Text>
            </View>
            
            <LanguageSelector 
              variant="dropdown" 
              size="md"
              showNativeNames={true}
              showFlags={true}
            />
          </Flex>

          {/* Profile Card */}
          <Card
            style={{
              background: mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: mode === 'dark' 
                ? '1px solid rgba(71, 85, 105, 0.3)' 
                : '1px solid rgba(226, 232, 240, 0.5)',
              boxShadow: mode === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            padding="2rem"
          >
            {/* Card Header */}
            <Flex
              justifyContent="space-between"
              alignItems="center"
              marginBottom="2rem"
              paddingBottom="1rem"
              style={{
                borderBottom: mode === 'dark' 
                  ? '1px solid rgba(71, 85, 105, 0.3)' 
                  : '1px solid rgba(226, 232, 240, 0.5)'
              }}
            >
              <Heading
                level={2}
                fontSize={{ base: "1.25rem", medium: "1.5rem" }}
                fontWeight="600"
                color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
              >
                {t('personal_information')}
              </Heading>
              
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  size="large"
                  style={{
                    background: mode === 'dark'
                      ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
                      : 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    color: '#FFFFFF'
                  }}
                >
                  {t('edit_profile')}
                </Button>
              ) : (
                <Flex gap="0.5rem">
                  <Button
                    onClick={handleSave}
                    size="large"
                    style={{
                      background: mode === 'dark'
                        ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      color: '#FFFFFF'
                    }}
                  >
                    {t('save_changes')}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variation="link"
                    size="large"
                    style={{
                      color: mode === 'dark' ? '#94A3B8' : '#64748B',
                      background: mode === 'dark' 
                        ? 'rgba(71, 85, 105, 0.1)' 
                        : 'rgba(226, 232, 240, 0.3)',
                      border: mode === 'dark'
                        ? '1px solid rgba(71, 85, 105, 0.3)'
                        : '1px solid rgba(226, 232, 240, 0.5)',
                      borderRadius: '8px',
                      fontWeight: '500'
                    }}
                  >
                    {t('cancel', { defaultValue: 'Cancel' })}
                  </Button>
                </Flex>
              )}
            </Flex>

            {/* Form Fields */}
            <Flex direction="column" gap="2rem">
              <Flex
                direction={{ base: 'column', medium: 'row' }}
                gap="1.5rem"
              >
                {/* First Name */}
                <View flex="1">
                  <Text
                    fontSize="0.875rem"
                    fontWeight="600"
                    color={mode === 'dark' ? '#E2E8F0' : '#374151'}
                    marginBottom="0.5rem"
                  >
                    {t('fields.first_name')}
                  </Text>
                  {isEditing ? (
                    <TextField
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      style={{
                        background: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF',
                        border: mode === 'dark' 
                          ? '1px solid rgba(71, 85, 105, 0.3)' 
                          : '1px solid rgba(209, 213, 219, 0.8)',
                        borderRadius: '8px',
                        color: mode === 'dark' ? '#F1F5F9' : '#1F2937'
                      }}
                    />
                  ) : (
                    <Text
                      color={mode === 'dark' ? '#CBD5E1' : '#1F2937'}
                      fontSize="1rem"
                    >
                      {formData.firstName || '-'}
                    </Text>
                  )}
                </View>

                {/* Last Name */}
                <View flex="1">
                  <Text
                    fontSize="0.875rem"
                    fontWeight="600"
                    color={mode === 'dark' ? '#E2E8F0' : '#374151'}
                    marginBottom="0.5rem"
                  >
                    {t('fields.last_name')}
                  </Text>
                  {isEditing ? (
                    <TextField
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      style={{
                        background: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF',
                        border: mode === 'dark' 
                          ? '1px solid rgba(71, 85, 105, 0.3)' 
                          : '1px solid rgba(209, 213, 219, 0.8)',
                        borderRadius: '8px',
                        color: mode === 'dark' ? '#F1F5F9' : '#1F2937'
                      }}
                    />
                  ) : (
                    <Text
                      color={mode === 'dark' ? '#CBD5E1' : '#1F2937'}
                      fontSize="1rem"
                    >
                      {formData.lastName || '-'}
                    </Text>
                  )}
                </View>
              </Flex>

              <Flex
                direction={{ base: 'column', medium: 'row' }}
                gap="1.5rem"
              >
                {/* Email */}
                <View flex="1">
                  <Text
                    fontSize="0.875rem"
                    fontWeight="600"
                    color={mode === 'dark' ? '#E2E8F0' : '#374151'}
                    marginBottom="0.5rem"
                  >
                    {t('fields.email')}
                  </Text>
                  <Text
                    color={mode === 'dark' ? '#CBD5E1' : '#1F2937'}
                    fontSize="1rem"
                    marginBottom="0.25rem"
                  >
                    {formData.email}
                  </Text>
                  <Text
                    fontSize="0.75rem"
                    color={mode === 'dark' ? '#94A3B8' : '#6B7280'}
                  >
                    {t('fields.email')} {t('cannot_be_changed', { defaultValue: 'cannot be changed' })}
                  </Text>
                </View>

                {/* Phone */}
                <View flex="1">
                  <Text
                    fontSize="0.875rem"
                    fontWeight="600"
                    color={mode === 'dark' ? '#E2E8F0' : '#374151'}
                    marginBottom="0.5rem"
                  >
                    {t('fields.phone')}
                  </Text>
                  {isEditing ? (
                    <TextField
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      style={{
                        background: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF',
                        border: mode === 'dark' 
                          ? '1px solid rgba(71, 85, 105, 0.3)' 
                          : '1px solid rgba(209, 213, 219, 0.8)',
                        borderRadius: '8px',
                        color: mode === 'dark' ? '#F1F5F9' : '#1F2937'
                      }}
                    />
                  ) : (
                    <Text
                      color={mode === 'dark' ? '#CBD5E1' : '#1F2937'}
                      fontSize="1rem"
                    >
                      {formData.phone || '-'}
                    </Text>
                  )}
                </View>
              </Flex>

              {/* Bio */}
              <View>
                <Text
                  fontSize="0.875rem"
                  fontWeight="600"
                  color={mode === 'dark' ? '#E2E8F0' : '#374151'}
                  marginBottom="0.5rem"
                >
                  {t('fields.bio')}
                </Text>
                {isEditing ? (
                  <TextAreaField
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={4}
                    style={{
                      background: mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#FFFFFF',
                      border: mode === 'dark' 
                        ? '1px solid rgba(71, 85, 105, 0.3)' 
                        : '1px solid rgba(209, 213, 219, 0.8)',
                      borderRadius: '8px',
                      color: mode === 'dark' ? '#F1F5F9' : '#1F2937'
                    }}
                  />
                ) : (
                  <Text
                    color={mode === 'dark' ? '#CBD5E1' : '#1F2937'}
                    fontSize="1rem"
                  >
                    {formData.bio || '-'}
                  </Text>
                )}
              </View>
            </Flex>
          </Card>

          {/* System Information */}
          <Card
            style={{
              background: mode === 'dark' 
                ? 'rgba(30, 41, 59, 0.8)' 
                : 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: mode === 'dark' 
                ? '1px solid rgba(71, 85, 105, 0.3)' 
                : '1px solid rgba(226, 232, 240, 0.5)',
              boxShadow: mode === 'dark'
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            padding="2rem"
          >
            <Heading
              level={3}
              fontSize={{ base: "1.25rem", medium: "1.5rem" }}
              fontWeight="600"
              color={mode === 'dark' ? '#F1F5F9' : '#1E293B'}
              marginBottom="1.5rem"
            >
              {t('system_info', { defaultValue: 'System Information' })}
            </Heading>
            
            <Flex
              direction={{ base: 'column', medium: 'row' }}
              gap="1.5rem"
            >
              {/* Current Language */}
              <View
                flex="1"
                padding="1.5rem"
                style={{
                  background: mode === 'dark' 
                    ? 'rgba(71, 85, 105, 0.1)' 
                    : 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '12px',
                  border: mode === 'dark'
                    ? '1px solid rgba(71, 85, 105, 0.2)'
                    : '1px solid rgba(226, 232, 240, 0.5)'
                }}
              >
                <Text
                  fontSize="0.875rem"
                  fontWeight="600"
                  color={mode === 'dark' ? '#94A3B8' : '#6B7280'}
                  marginBottom="0.5rem"
                >
                  {t('current_language', { defaultValue: 'Current Language' })}
                </Text>
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  color={mode === 'dark' ? '#F1F5F9' : '#1F2937'}
                >
                  {locale.toUpperCase()}
                </Text>
              </View>

              {/* Current Date */}
              <View
                flex="1"
                padding="1.5rem"
                style={{
                  background: mode === 'dark' 
                    ? 'rgba(71, 85, 105, 0.1)' 
                    : 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '12px',
                  border: mode === 'dark'
                    ? '1px solid rgba(71, 85, 105, 0.2)'
                    : '1px solid rgba(226, 232, 240, 0.5)'
                }}
              >
                <Text
                  fontSize="0.875rem"
                  fontWeight="600"
                  color={mode === 'dark' ? '#94A3B8' : '#6B7280'}
                  marginBottom="0.5rem"
                >
                  {t('current_date', { defaultValue: 'Current Date' })}
                </Text>
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  color={mode === 'dark' ? '#F1F5F9' : '#1F2937'}
                >
                  {formatDate(new Date(), { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>

              {/* Formatted Number */}
              <View
                flex="1"
                padding="1.5rem"
                style={{
                  background: mode === 'dark' 
                    ? 'rgba(71, 85, 105, 0.1)' 
                    : 'rgba(248, 250, 252, 0.8)',
                  borderRadius: '12px',
                  border: mode === 'dark'
                    ? '1px solid rgba(71, 85, 105, 0.2)'
                    : '1px solid rgba(226, 232, 240, 0.5)'
                }}
              >
                <Text
                  fontSize="0.875rem"
                  fontWeight="600"
                  color={mode === 'dark' ? '#94A3B8' : '#6B7280'}
                  marginBottom="0.5rem"
                >
                  {t('formatted_number', { defaultValue: 'Formatted Number' })}
                </Text>
                <Text
                  fontSize="1.25rem"
                  fontWeight="700"
                  color={mode === 'dark' ? '#F1F5F9' : '#1F2937'}
                >
                  {formatNumber(12345.67, { 
                    style: 'currency', 
                    currency: locale === 'es' ? 'EUR' : 'USD' 
                  })}
                </Text>
              </View>
            </Flex>
          </Card>

          {/* Interpolation Demo */}
          <Card
            style={{
              background: mode === 'dark'
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%)',
              border: mode === 'dark'
                ? '1px solid rgba(59, 130, 246, 0.3)'
                : '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px'
            }}
            padding="2rem"
          >
            <Heading
              level={3}
              fontSize={{ base: "1.25rem", medium: "1.5rem" }}
              fontWeight="600"
              color={mode === 'dark' ? '#60A5FA' : '#2563EB'}
              marginBottom="1rem"
            >
              {t('interpolation_demo', { defaultValue: 'Interpolation Demo' })}
            </Heading>
            <Text
              fontSize="1rem"
              color={mode === 'dark' ? '#93C5FD' : '#1E40AF'}
              lineHeight="1.6"
            >
              {t('welcome_message', { 
                name: formData.firstName || 'User',
                defaultValue: 'Welcome, {{name}}! Your profile is in {{locale}} language.',
                locale: locale.toUpperCase()
              })}
            </Text>
          </Card>

          {/* Debug Information (solo en desarrollo) */}
          {process.env.NODE_ENV === 'development' && (
            <Card
              style={{
                background: mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(217, 119, 6, 0.02) 100%)',
                border: mode === 'dark'
                  ? '1px solid rgba(245, 158, 11, 0.3)'
                  : '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '16px'
              }}
              padding="2rem"
            >
              <Heading
                level={3}
                fontSize={{ base: "1.25rem", medium: "1.5rem" }}
                fontWeight="600"
                color={mode === 'dark' ? '#FBBF24' : '#D97706'}
                marginBottom="1rem"
              >
                Debug Information
              </Heading>
              <Text
                as="pre"
                fontSize="0.875rem"
                color={mode === 'dark' ? '#FCD34D' : '#92400E'}
                style={{
                  overflow: 'auto',
                  whiteSpace: 'pre-wrap',
                  background: mode === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}
              >
                {JSON.stringify({ locale, formData, user: user?.signInDetails }, null, 2)}
              </Text>
            </Card>
          )}
        </Flex>
      </View>
    </View>
  );
}
