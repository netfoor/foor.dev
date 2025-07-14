'use client';

import React, { useState, useCallback } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Heading,
  TextField,
  TextAreaField,
  SelectField,
  SwitchField,
  Badge,
  Alert,
  Divider
} from '@aws-amplify/ui-react';
import '../../admin.css';
import { 
  ArrowLeft, 
  Save, 
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { generateClient } from 'aws-amplify/data';
import { uploadData } from 'aws-amplify/storage';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useAuth } from '@/context/auth-context';
import { useAuthorization } from '@/hooks/useAuthorization';
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
    lastUsed: '',
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newCertification, setNewCertification] = useState('');
  const [newProject, setNewProject] = useState('');
  const [newExample, setNewExample] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { isUserAdmin } = useAuthorization();

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

  const handleIconChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError(t('projects.image_size_error'));
        return;
      }
      
      setIconFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [t]);

  const removeIcon = useCallback(() => {
    setIconFile(null);
    setIconPreview(null);
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
    setSuccess(null);

    try {
      // Check if user is admin before proceeding
      if (!isUserAdmin()) {
        setError(t('common.admin_access_required'));
        return;
      }

      const client = generateClient<Schema>();
      
      let iconKey = null;        // Upload icon if provided
      if (iconFile) {
        const iconExtension = iconFile.name.split('.').pop();
        const iconFileName = `skills/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${iconExtension}`;
        
        const uploadResult = await uploadData({
          path: iconFileName,
          data: iconFile,
          options: {
            contentType: iconFile.type
          }
        }).result;
        
        iconKey = uploadResult.path;
      }

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
        iconKey,
        priority: formData.priority ? parseInt(formData.priority) : null,
        isActive: formData.isActive,
        lastUsed: formData.lastUsed ? new Date(formData.lastUsed).toISOString().split('T')[0] : null,
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
      setSuccess(t('skills.skill_created_success'));

      // Redirect to skills list after a short delay
      setTimeout(() => {
        router.push(getLocalizedPath('/admin/skills'));
      }, 2000);
      
    } catch (err) {
      console.error('Error creating skill:', err);
      setError(t('skills.error_creating_skill'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="create-project-form">
      <style dangerouslySetInnerHTML={{ __html: `
        .create-project-form .amplify-field > label {
          color: var(--form-label-color) !important;
          font-weight: 600 !important;
          margin-bottom: 0.5rem !important;
          display: block !important;
          font-size: 0.95rem !important;
        }
        .create-project-form .amplify-input,
        .create-project-form .amplify-textarea,
        .create-project-form .amplify-select select {
          background-color: var(--form-input-bg) !important;
          border: 1px solid var(--form-input-border) !important;
          color: var(--form-input-text) !important;
          border-radius: 6px !important;
          padding: 0.75rem !important;
          font-size: 0.9rem !important;
        }
        .create-project-form .amplify-input::placeholder,
        .create-project-form .amplify-textarea::placeholder {
          color: var(--form-placeholder-color) !important;
          opacity: 0.8 !important;
        }
        .create-project-form .amplify-input:focus,
        .create-project-form .amplify-textarea:focus,
        .create-project-form .amplify-select select:focus {
          border-color: var(--form-focus-border) !important;
          box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
          outline: none !important;
        }
      ` }} />

      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="large">
          {/* Header */}
          <Flex justifyContent="space-between" alignItems="center">
            <View>
              <Heading level={1} fontSize="xl" fontWeight="bold" color="font.primary">
                {t('skills.create')}
              </Heading>
              <Text fontSize="medium" color="font.secondary">
                {t('skills.create_description')}
              </Text>
            </View>
            <Button
              variation="link"
              onClick={() => router.push(getLocalizedPath('/admin/skills'))}
            >
              <Flex alignItems="center" gap="xs">
                <ArrowLeft size={16} />
                {t('skills.back_to_skills')}
              </Flex>
            </Button>
          </Flex>

          {/* Alerts */}
          {(error || success) && (
            <Alert
              variation={error ? "error" : "success"}
              isDismissible={true}
              onDismiss={() => { setError(null); setSuccess(null); }}
            >
              {error || success}
            </Alert>
          )}

          {/* Basic Information */}
          <Card padding="large">
            <Heading level={3} fontSize="large" fontWeight="semibold" marginBottom="medium">
              {t('skills.basic_info')}
            </Heading>
            
            <Flex direction="column" gap="medium">
              <TextField
                label={t('skills.name_label')}
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
                rows={3}
              />

              <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                <SelectField
                  label={t('skills.category_label')}
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
                  label={t('skills.type_label')}
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  required
                >
                  <option value="">{t('skills.select_type')}</option>
                  <option value="Technical">{t('skills.technical')}</option>
                  <option value="Soft">{t('skills.soft')}</option>
                </SelectField>
              </Flex>

              <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
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
          </Card>

          {/* Skill Icon */}
          <Card padding="large">
            <Heading level={3} fontSize="large" fontWeight="semibold" marginBottom="medium">
              {t('skills.skill_icon')}
            </Heading>
            
            <View>
              {iconPreview && (
                <Flex alignItems="center" gap="medium" marginBottom="medium">
                  <Text fontSize="medium" fontWeight="semibold">
                    {t('skills.current_icon')}
                  </Text>
                  <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                    <img 
                      src={iconPreview} 
                      alt="Icon Preview" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain', 
                        borderRadius: '8px',
                        border: '1px solid var(--amplify-colors-border-primary)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeIcon}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                </Flex>
              )}
              
              <input
                type="file"
                accept="image/*"
                onChange={handleIconChange}
                style={{ display: 'none' }}
                id="icon-upload"
              />
              <label htmlFor="icon-upload">
                <Button as="span" variation="link" size="small">
                  <Flex alignItems="center" gap="xs">
                    <ImageIcon size={16} />
                    {t('skills.add_new_icon')}
                  </Flex>
                </Button>
              </label>
            </View>
          </Card>

          {/* Additional Information */}
          <Card padding="large">
            <Heading level={3} fontSize="large" fontWeight="semibold" marginBottom="medium">
              {t('skills.additional_info')}
            </Heading>
            
            <Flex direction="column" gap="medium">
              {/* Certifications */}
              <View>
                <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                  {t('skills.certifications_label')}
                </Text>
                <Flex direction="column" gap="small">
                  <Flex gap="small">
                    <TextField
                      label=""
                      placeholder={t('skills.certifications_placeholder')}
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      flex="1"
                    />
                    <Button
                      variation="link"
                      size="small"
                      onClick={() => addItem('certifications', newCertification)}
                    >
                      <Plus size={16} />
                    </Button>
                  </Flex>
                  {formData.certifications.length > 0 && (
                    <Flex wrap="wrap" gap="small">
                      {formData.certifications.map((cert, index) => (
                        <Badge key={index} variation="info">
                          {cert}
                          <button
                            type="button"
                            onClick={() => removeItem('certifications', index)}
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

              <Flex direction={{ base: 'column', medium: 'row' }} gap="medium">
                <TextField
                  label={t('skills.priority_label')}
                  placeholder={t('skills.priority_placeholder')}
                  type="number"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  min="1"
                  max="100"
                />

                <TextField
                  label={t('skills.last_used_label')}
                  type="date"
                  value={formData.lastUsed}
                  onChange={(e) => handleInputChange('lastUsed', e.target.value)}
                />
              </Flex>

              <SwitchField
                label={t('skills.is_active_label')}
                isChecked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
              />
            </Flex>
          </Card>

          {/* Submit Button */}
          <Card padding="large">
            <Flex justifyContent="space-between" alignItems="center">
              <Button
                variation="link"
                onClick={() => router.push(getLocalizedPath('/admin/skills'))}
              >
                {t('skills.cancel')}
              </Button>
              <Button
                type="submit"
                variation="primary"
                isLoading={loading}
                loadingText={t('skills.saving')}
              >
                <Flex alignItems="center" gap="xs">
                  <Save size={16} />
                  {t('skills.save_changes')}
                </Flex>
              </Button>
            </Flex>
          </Card>
        </Flex>
      </form>
    </View>
  );
};

export default CreateSkillClient;
