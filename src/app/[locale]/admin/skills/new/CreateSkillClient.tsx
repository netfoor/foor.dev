'use client';

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  TextField,
  TextAreaField,
  SelectField,
  Badge,
  Alert,
  Heading
} from '@aws-amplify/ui-react';
import '../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  Zap,
  X,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

interface CreateSkillClientProps {
  locale: SupportedLocale;
}

const CreateSkillClient: React.FC<CreateSkillClientProps> = ({ locale }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: '',
    proficiency: '',
    yearsOfExperience: '',
    certifications: [] as string[],
    projects: [] as string[],
    examples: [] as string[],
    achievements: [] as string[],
    priority: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newCertification, setNewCertification] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();

  const categories = [
    'Cloud Platforms',
    'Programming Languages', 
    'Frameworks & Libraries',
    'DevOps & Tools',
    'Databases',
    'Architecture & Design',
    'Soft Skills'
  ];

  const handleInputChange = useCallback((field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);



  const addItem = useCallback((field: 'certifications' | 'projects' | 'examples' | 'achievements', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      // Clear the input
      if (field === 'certifications') setNewCertification('');
      if (field === 'projects') setNewProject('');
      if (field === 'examples') setNewExample('');
      if (field === 'achievements') setNewAchievement('');
    }
  }, []);

  const removeItem = useCallback((field: 'certifications' | 'projects' | 'examples' | 'achievements', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.category) {
      setError(t('skills.basic_info_required'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = generateClient<Schema>();

      // Create skill
      const skillData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category as any,
        type: formData.type as any,
        proficiency: formData.proficiency as any || null,
        yearsOfExperience: formData.yearsOfExperience ? parseInt(formData.yearsOfExperience) : null,
        certifications: formData.certifications.length > 0 ? formData.certifications : null,
        projects: formData.projects.length > 0 ? formData.projects : null,
        examples: formData.examples.length > 0 ? formData.examples : null,
        achievements: formData.achievements.length > 0 ? formData.achievements : null,
        priority: formData.priority ? parseInt(formData.priority) : null,
        isActive: formData.isActive,
      };

      // Map the category from UI-friendly format to schema format
      const categoryMapping: Record<string, string> = {
        'Cloud Platforms': 'CLOUD_PLATFORMS',
        'Programming Languages': 'PROGRAMMING_LANGUAGES',
        'Frameworks & Libraries': 'FRAMEWORKS_LIBRARIES',
        'DevOps & Tools': 'DEVOPS_TOOLS',
        'Databases': 'DATABASES',
        'Architecture & Design': 'ARCHITECTURE_DESIGN',
        'Soft Skills': 'SOFT_SKILLS'
      };

      // Update the skillData with the correct category format
      const mappedSkillData = {
        ...skillData,
        category: categoryMapping[skillData.category as string] as any
      };

      console.log('Creating skill with data:', mappedSkillData);
      const result = await client.models.Skills.create(mappedSkillData);
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      console.log('Skill created successfully:', result);
      
      // Redirect to skills list
      router.push(getLocalizedPath('/admin/skills'));
      
    } catch (err) {
      console.error('Error creating skill:', err);
      setError(`${t('skills.error_creating_skill')}: ${err instanceof Error ? err.message : t('skills.unknown_error')}`);
    } finally {
      setLoading(false);
    }
  };

  // CSS variables for styling
  const cssVariables = {
    '--form-label-color': mode === 'dark' ? '#F1F5F9' : '#1E293B',
    '--form-input-bg': mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
    '--form-input-border': mode === 'dark' ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.4)',
    '--form-input-text': mode === 'dark' ? '#F1F5F9' : '#1E293B',
    '--form-placeholder-color': mode === 'dark' ? '#9CA3AF' : '#6B7280',
    '--form-focus-border': mode === 'dark' ? '#3B82F6' : '#2563EB',
    '--form-focus-shadow': mode === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.2)',
    '--form-description-color': mode === 'dark' ? '#CBD5E1' : '#64748B',
  } as React.CSSProperties;

  return (
    <View style={cssVariables}>
      <style dangerouslySetInnerHTML={{ __html: `
        .create-skill-form .amplify-field {
          margin-bottom: 1rem;
        }
        
        .create-skill-form .amplify-field > label {
          color: var(--form-label-color) !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
          font-size: 0.95rem !important;
        }
        
        .create-skill-form .amplify-input,
        .create-skill-form .amplify-textarea,
        .create-skill-form .amplify-select select {
          background-color: var(--form-input-bg) !important;
          border: 1px solid var(--form-input-border) !important;
          color: var(--form-input-text) !important;
          border-radius: 6px !important;
          padding: 0.75rem !important;
          font-size: 0.9rem !important;
        }
        
        .create-skill-form .amplify-input::placeholder,
        .create-skill-form .amplify-textarea::placeholder {
          color: var(--form-placeholder-color) !important;
          opacity: 0.8 !important;
          font-weight: 400 !important;
        }
        
        .create-skill-form .amplify-input:focus,
        .create-skill-form .amplify-textarea:focus,
        .create-skill-form .amplify-select select:focus {
          border-color: var(--form-focus-border) !important;
          box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
          outline: none !important;
        }
        
        .create-skill-form .amplify-field-group__control .amplify-field__description {
          color: var(--form-description-color) !important;
          font-size: 0.8rem !important;
          margin-top: 0.25rem !important;
          font-weight: 500 !important;
        }
        
        .create-skill-form .amplify-select select {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 0.65rem;
          padding-right: 2.5rem !important;
        }
      ` }} />

      {/* Header */}
      <Flex direction="column" gap="1rem" marginBottom="2rem">
        <Flex alignItems="center" gap="1rem">
          <Button
            variation="link"
            onClick={() => router.push(getLocalizedPath('/admin/skills'))}
            style={{
              color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
              padding: '0.5rem',
            }}
          >
            <ArrowLeft size={20} />
          </Button>
          
          <Heading level={1} style={{
            color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            fontSize: '1.875rem',
            fontWeight: '700'
          }}>
            {t('skills.create')}
          </Heading>
        </Flex>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="create-skill-form">
        <Flex direction="column" gap="2rem">

          {/* Basic Information */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('skills.basic_info')}
              </Heading>

              <Flex direction="column" gap="1rem">
                <TextField
                  label={`${t('skills.name_label')} *`}
                  placeholder={t('skills.name_placeholder')}
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />

                <TextAreaField
                  label={t('skills.description_label')}
                  placeholder={t('skills.description_placeholder')}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                />

                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <SelectField
                    label={`${t('skills.category_label')} *`}
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                  >
                    <option value="">{t('skills.select_category')}</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </SelectField>

                  <SelectField
                    label={`${t('skills.type_label')} *`}
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    required
                  >
                    <option value="">{t('skills.select_type')}</option>
                    <option value="Technical">{t('skills.technical')}</option>
                    <option value="Soft">{t('skills.soft')}</option>
                  </SelectField>
                </Flex>

                <Flex direction={{ base: 'column', medium: 'row' }} gap="1rem">
                  <SelectField
                    label={t('skills.proficiency_label')}
                    value={formData.proficiency}
                    onChange={(e) => handleInputChange('proficiency', e.target.value)}
                  >
                    <option value="">{t('skills.select_proficiency')}</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </SelectField>

                  <TextField
                    label={t('skills.years_experience_label')}
                    placeholder={t('skills.years_experience_placeholder')}
                    type="number"
                    value={formData.yearsOfExperience}
                    onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                    min="0"
                    max="50"
                  />
                </Flex>
              </Flex>
            </View>
          </Card>



          {/* Additional Information */}
          <Card style={{
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px'
          }}>
            <View padding="1.5rem">
              <Heading level={3} marginBottom="1rem" style={{
                color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
                fontSize: '1.125rem'
              }}>
                {t('skills.additional_info')}
              </Heading>
              <Flex direction="column" gap="1rem">
                {/* Certifications */}
                <View>
                  <Flex gap="0.5rem">
                    <TextField
                      label={t('skills.certifications_label')}
                      placeholder={t('skills.certifications_placeholder')}
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addItem('certifications', newCertification);
                        }
                      }}
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="button"
                      onClick={() => addItem('certifications', newCertification)}
                      variation="primary"
                      style={{
                        backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                        alignSelf: 'flex-end'
                      }}
                    >
                      <Plus size={16} />
                      {t('skills.add_certification')}
                    </Button>
                  </Flex>

                  {formData.certifications.length > 0 && (
                    <Flex wrap="wrap" gap="0.5rem" marginTop="0.5rem">
                      {formData.certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          style={{
                            backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)',
                            color: mode === 'dark' ? '#93C5FD' : '#2563EB',
                            border: mode === 'dark' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(37, 99, 235, 0.2)',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}
                        >
                          {cert}
                          <Button
                            type="button"
                            onClick={() => removeItem('certifications', index)}
                            style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: 'inherit',
                              padding: '0',
                              width: '16px',
                              height: '16px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <X size={12} />
                          </Button>
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </View>

              {/* Projects */}
              <View>
                <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                  {t('skills.projects_label')}
                </Text>
                <Flex direction="column" gap="small">
                  <Flex gap="small">
                    <TextField
                      label=""
                      placeholder={t('skills.projects_placeholder')}
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      flex="1"
                    />
                    <Button
                      variation="link"
                      size="small"
                      onClick={() => addItem('projects', newProject)}
                    >
                      <Plus size={16} />
                    </Button>
                  </Flex>
                  {formData.projects.length > 0 && (
                    <Flex wrap="wrap" gap="small">
                      {formData.projects.map((project, index) => (
                        <Badge key={index} variation="info">
                          {project}
                          <button
                            type="button"
                            onClick={() => removeItem('projects', index)}
                            style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'inherit' }}
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </View>

              {/* Examples (for Soft Skills) */}
              {formData.type === 'Soft' && (
                <View>
                  <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                    {t('skills.examples_label')}
                  </Text>
                  <Flex direction="column" gap="small">
                    <Flex gap="small">
                      <TextField
                        label=""
                        placeholder={t('skills.examples_placeholder')}
                        value={newExample}
                        onChange={(e) => setNewExample(e.target.value)}
                        flex="1"
                      />
                      <Button
                        variation="link"
                        size="small"
                        onClick={() => addItem('examples', newExample)}
                      >
                        <Plus size={16} />
                      </Button>
                    </Flex>
                    {formData.examples.length > 0 && (
                      <Flex wrap="wrap" gap="small">
                        {formData.examples.map((example, index) => (
                          <Badge key={index} variation="success">
                            {example}
                            <button
                              type="button"
                              onClick={() => removeItem('examples', index)}
                              style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'inherit' }}
                            >
                              <X size={14} />
                            </button>
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Flex>
                </View>
              )}

              {/* Achievements */}
              <View>
                <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                  {t('skills.achievements_label')}
                </Text>
                <Flex direction="column" gap="small">
                  <Flex gap="small">
                    <TextField
                      label=""
                      placeholder={t('skills.achievements_placeholder')}
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      flex="1"
                    />
                    <Button
                      variation="link"
                      size="small"
                      onClick={() => addItem('achievements', newAchievement)}
                    >
                      <Plus size={16} />
                    </Button>
                  </Flex>
                  {formData.achievements.length > 0 && (
                    <Flex wrap="wrap" gap="small">
                      {formData.achievements.map((achievement, index) => (
                        <Badge key={index} variation="warning">
                          {achievement}
                          <button
                            type="button"
                            onClick={() => removeItem('achievements', index)}
                            style={{ marginLeft: '8px', background: 'none', border: 'none', color: 'inherit' }}
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </View>

                <TextField
                  label={t('skills.priority_label')}
                  placeholder={t('skills.priority_placeholder')}
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  min="1"
                  max="100"
                />
              </Flex>
            </View>
          </Card>

        </Flex>

        {/* Action Buttons */}
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          marginTop="2rem"
          gap="1rem"
          direction={{ base: 'column', medium: 'row' }}
        >
          <Button
            type="button"
            variation="link"
            onClick={() => router.push(getLocalizedPath('/admin/skills'))}
            style={{
              color: mode === 'dark' ? '#9CA3AF' : '#6B7280'
            }}
          >
            {t('skills.cancel')}
          </Button>

          <Button
            type="submit"
            variation="primary"
            isLoading={loading}
            loadingText={t('skills.saving')}
            style={{
              backgroundColor: mode === 'dark' ? '#22C55E' : '#16A34A',
              minWidth: '150px'
            }}
          >
            <Save size={16} style={{ marginRight: '0.5rem' }} />
            {t('skills.save_changes')}
          </Button>
        </Flex>
      </form>
    </View>
  );
};

export default CreateSkillClient;
