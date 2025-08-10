'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
  Loader,
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
import { getUrl } from 'aws-amplify/storage';
import { uploadImageWithMetadata } from '@/lib/utils/image-helpers';
import S3Cleanup from '@/lib/utils/s3-cleanup';
import type { Schema } from '../../../../../../amplify/data/resource';
import { useAuth } from '@/context/auth-context';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';

type Skill = Schema["Skills"]["type"];

interface EditSkillClientProps {
  locale: SupportedLocale;
  skillId: string;
}

const EditSkillClient: React.FC<EditSkillClientProps> = ({ locale, skillId }) => {
  const [skill, setSkill] = useState<Skill | null>(null);
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
    isCore: false,
    lastUsed: '',
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [currentIconUrl, setCurrentIconUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  // Load skill data
  useEffect(() => {
    const fetchSkill = async () => {
      try {
        const client = generateClient<Schema>();
        const response = await client.models.Skills.get({ id: skillId });
        
        if (response.data) {
          const skillData = response.data;
          setSkill(skillData);
          
          // Populate form data
          setFormData({
            name: skillData.name || '',
            description: skillData.description || '',
            category: skillData.category || '',
            type: skillData.type || '',
            proficiency: skillData.proficiency || '',
            yearsOfExperience: skillData.yearsOfExperience?.toString() || '',
            certifications: (skillData.certifications || []).filter(cert => cert !== null) as string[],
            projects: (skillData.projects || []).filter(project => project !== null) as string[],
            examples: (skillData.examples || []).filter(example => example !== null) as string[],
            achievements: (skillData.achievements || []).filter(achievement => achievement !== null) as string[],
            priority: skillData.priority?.toString() || '',
            isActive: skillData.isActive ?? true,
            isCore: skillData.isCore ?? false,
            lastUsed: skillData.lastUsed || '',
          });

          // Load current icon
          if (skillData.iconKey) {
            const imageUrl = await getImageUrl(skillData.iconKey);
            setCurrentIconUrl(imageUrl);
          }
        } else {
          setError(t('skills.skill_not_found'));
        }
      } catch (err) {
        console.error('Error fetching skill:', err);
        setError(t('skills.error_loading_skill'));
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [skillId, t]);

  // Get image URL from Storage
  const getImageUrl = async (key: string | null | undefined) => {
    if (!key) return null;
    
    try {
      const normalizedPath = key.startsWith('public/') ? key.slice(7) : key;
      const url = await getUrl({ path: normalizedPath });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL:', err);
      return null;
    }
  };

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

  // Handle submit with optimized upload and cleanup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type || !formData.category) {
      setError(t('skills.basic_info_required'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Check if user is admin before proceeding
      if (!isUserAdmin()) {
        setError(t('common.admin_access_required'));
        return;
      }

      const client = generateClient<Schema>();
      
      let iconKey = skill?.iconKey || undefined;
      
      // Handle icon upload
      if (iconFile) {
        // Remove old icon if exists (original + webp)
        if (skill?.iconKey) {
          try { await S3Cleanup.deleteSingleFile(skill.iconKey); } catch {}
        }
        iconKey = await uploadImageWithMetadata(iconFile, skillId, 'Skills', 'iconKey');
      }

      // Update skill
      const skillData = {
        id: skillId,
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
        isCore: formData.isCore,
        lastUsed: formData.lastUsed ? new Date(formData.lastUsed).toISOString().split('T')[0] : null,
      };

      // Map category labels to schema
      const categoryMapping: Record<string, string> = {
        'Cloud Platforms': 'CLOUD_PLATFORMS',
        'Programming Languages': 'PROGRAMMING_LANGUAGES',
        'Frameworks & Libraries': 'FRAMEWORKS_LIBRARIES',
        'DevOps & Tools': 'DEVOPS_TOOLS',
        'Databases': 'DATABASES',
        'Architecture & Design': 'ARCHITECTURE_DESIGN',
        'Soft Skills': 'SOFT_SKILLS'
      };

      const mappedSkillData = { ...skillData, category: categoryMapping[skillData.category as string] as any };

      const result = await client.models.Skills.update(mappedSkillData);
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      setSuccess(t('skills.skill_updated_success'));
      setTimeout(() => { router.push(getLocalizedPath('/admin/skills')); }, 2000);
      
    } catch (err) {
      console.error('Error updating skill:', err);
      setError(t('skills.error_updating_skill'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View padding="large" textAlign="center">
        <Loader size="large" />
        <Text fontSize="medium" color="font.tertiary" marginTop="medium">
          {t('skills.loading')}
        </Text>
      </View>
    );
  }

  if (!skill) {
    return (
      <View padding="large" textAlign="center">
        <Alert variation="error">
          {t('skills.skill_not_found')}
        </Alert>
      </View>
    );
  }

  const isDark = mode === 'dark';
  
  // Definir variables CSS para el tema con mejor contraste
  const cssVariables = {
    '--form-label-color': isDark ? '#F8FAFC' : '#0F172A',
    '--form-input-bg': isDark ? '#1E293B' : '#FFFFFF',
    '--form-input-border': isDark ? '#64748B' : '#D1D5DB',
    '--form-input-text': isDark ? '#F8FAFC' : '#111827',
    '--form-placeholder-color': isDark ? '#94A3B8' : '#6B7280',
    '--form-focus-border': isDark ? '#3B82F6' : '#2563EB',
    '--form-focus-shadow': isDark ? 'rgba(59, 130, 246, 0.35)' : 'rgba(37, 99, 235, 0.25)',
    '--form-description-color': isDark ? '#D1D5DB' : '#6B7280'
  } as React.CSSProperties;

  const editSkillStyles = `
    .edit-skill-form .amplify-field {
      margin-bottom: 1rem;
    }
    
    .edit-skill-form .amplify-field > label {
      color: var(--form-label-color) !important;
      font-weight: 600 !important;
      margin-bottom: 0.5rem !important;
      display: block !important;
      font-size: 0.95rem !important;
    }
    
    .edit-skill-form .amplify-input,
    .edit-skill-form .amplify-textarea,
    .edit-skill-form .amplify-select select {
      background-color: var(--form-input-bg) !important;
      border: 1px solid var(--form-input-border) !important;
      color: var(--form-input-text) !important;
      border-radius: 6px !important;
      padding: 0.75rem !important;
      font-size: 0.9rem !important;
    }
    
    .edit-skill-form .amplify-input::placeholder,
    .edit-skill-form .amplify-textarea::placeholder {
      color: var(--form-placeholder-color) !important;
      opacity: 0.8 !important;
      font-weight: 400 !important;
    }
    
    .edit-skill-form .amplify-input:focus,
    .edit-skill-form .amplify-textarea:focus,
    .edit-skill-form .amplify-select select:focus {
      border-color: var(--form-focus-border) !important;
      box-shadow: 0 0 0 2px var(--form-focus-shadow) !important;
      outline: none !important;
    }
    
    .edit-skill-form .amplify-field-group__control .amplify-field__description {
      color: var(--form-description-color) !important;
      font-size: 0.8rem !important;
      margin-top: 0.25rem !important;
      font-weight: 500 !important;
    }

    .edit-skill-form .amplify-select select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%23666' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 0.65rem;
      padding-right: 2.5rem !important;
    }

    .edit-skill-form .input-with-button-container {
      display: flex;
      gap: 0.75rem;
      align-items: end;
      margin-bottom: 1rem;
    }

    .edit-skill-form .input-wrapper {
      flex: 1;
    }

    .edit-skill-form .add-button {
      flex-shrink: 0;
      min-width: 120px;
    }

    .edit-skill-form .badges-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    /* Responsive design improvements */
    @media (max-width: 768px) {
      .edit-skill-form .input-with-button-container {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 0.5rem !important;
      }
      
      .edit-skill-form .add-button {
        width: 100% !important;
        min-width: auto !important;
      }
      
      .edit-skill-form .amplify-flex {
        flex-direction: column !important;
      }
      
      .edit-skill-form .amplify-button {
        width: 100% !important;
        margin-top: 0.5rem !important;
      }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: editSkillStyles }} />
      <View 
        style={{
          padding: '1.5rem',
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          minHeight: '100vh',
          ...cssVariables
        }}
        className="edit-skill-form"
      >
        <Card
          style={{
            padding: '2rem',
            backgroundColor: isDark ? 'rgba(51, 65, 85, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            border: isDark ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            maxWidth: '800px',
            margin: '0 auto'
          }}
        >

          <form onSubmit={handleSubmit} className="edit-skill-form">
            <Flex direction="column" gap="large">
              {/* Header */}
              <Flex justifyContent="space-between" alignItems="center">
                <Flex alignItems="center" gap="medium">
                  <Button
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: isDark ? '#CBD5E1' : '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                    onClick={() => router.push(getLocalizedPath('/admin/skills'))}
                  >
                    <ArrowLeft size={20} />
                  </Button>
                  <Heading 
                    level={2} 
                    style={{
                      color: isDark ? '#F1F5F9' : '#1E293B',
                      margin: 0
                    }}
                  >
                    {t('skills.edit')}
                  </Heading>
                </Flex>
              </Flex>

              {error && (
                <Alert variation="error" hasIcon={true}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variation="success" hasIcon={true}>
                  {success}
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
              {(iconPreview || currentIconUrl) && (
                <Flex alignItems="center" gap="medium" marginBottom="medium">
                  <Text fontSize="medium" fontWeight="semibold">
                    {t('skills.current_icon')}
                  </Text>
                  <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                    <img 
                      src={iconPreview || currentIconUrl || ''} 
                      alt="Icon" 
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
                <div className="input-with-button-container">
                  <div className="input-wrapper">
                    <TextField
                      label=""
                      placeholder={t('skills.certifications_placeholder')}
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addItem('certifications', newCertification)}
                    className="add-button"
                    style={{
                      backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {formData.certifications.length > 0 && (
                  <div className="badges-container">
                    {formData.certifications.map((cert, index) => (
                      <Badge key={index} variation="info" style={{ cursor: 'pointer' }} onClick={() => removeItem('certifications', index)}>
                        {cert} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </View>

              {/* Projects */}
              <View>
                <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                  {t('skills.projects_label')}
                </Text>
                <div className="input-with-button-container">
                  <div className="input-wrapper">
                    <TextField
                      label=""
                      placeholder={t('skills.projects_placeholder')}
                      value={newProject}
                      onChange={(e) => setNewProject(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addItem('projects', newProject)}
                    className="add-button"
                    style={{
                      backgroundColor: isDark ? '#10B981' : '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {formData.projects.length > 0 && (
                  <div className="badges-container">
                    {formData.projects.map((project, index) => (
                      <Badge key={index} variation="info" style={{ cursor: 'pointer' }} onClick={() => removeItem('projects', index)}>
                        {project} ×
                      </Badge>
                    ))}
                  </div>
                )}
              </View>

              {/* Examples (for Soft Skills) */}
              {formData.type === 'Soft' && (
                <View>
                  <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                    {t('skills.examples_label')}
                  </Text>
                  <div className="input-with-button-container">
                    <div className="input-wrapper">
                      <TextField
                        label=""
                        placeholder={t('skills.examples_placeholder')}
                        value={newExample}
                        onChange={(e) => setNewExample(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={() => addItem('examples', newExample)}
                      className="add-button"
                      style={{
                        backgroundColor: isDark ? '#10B981' : '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={16} />
                    </Button>
                  </div>
                  {formData.examples.length > 0 && (
                    <div className="badges-container">
                      {formData.examples.map((example, index) => (
                        <Badge key={index} variation="success" style={{ cursor: 'pointer' }} onClick={() => removeItem('examples', index)}>
                          {example} ×
                        </Badge>
                      ))}
                    </div>
                  )}
                </View>
              )}

              {/* Achievements */}
              <View>
                <Text fontSize="medium" fontWeight="semibold" marginBottom="small">
                  {t('skills.achievements_label')}
                </Text>
                <div className="input-with-button-container">
                  <div className="input-wrapper">
                    <TextField
                      label=""
                      placeholder={t('skills.achievements_placeholder')}
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => addItem('achievements', newAchievement)}
                    className="add-button"
                    style={{
                      backgroundColor: isDark ? '#F59E0B' : '#D97706',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                {formData.achievements.length > 0 && (
                  <div className="badges-container">
                    {formData.achievements.map((achievement, index) => (
                      <Badge key={index} variation="warning" style={{ cursor: 'pointer' }} onClick={() => removeItem('achievements', index)}>
                        {achievement} ×
                      </Badge>
                    ))}
                  </div>
                )}
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
              
              <SwitchField
                label={t('skills.is_core_label') || "Show on Home Page (Core Skill)"}
                isChecked={formData.isCore}
                onChange={(e) => handleInputChange('isCore', e.target.checked)}
                labelPosition="end"
              />
            </Flex>
          </Card>

              <Divider />

              {/* Botones de acción */}
              <Flex 
                direction={{ base: 'column', medium: 'row' }}
                justifyContent="space-between" 
                gap="medium"
              >
                <Button
                  onClick={() => router.push(getLocalizedPath('/admin/skills'))}
                  disabled={saving}
                  style={{
                    backgroundColor: 'transparent',
                    color: isDark ? '#CBD5E1' : '#64748B',
                    border: isDark ? '1px solid #475569' : '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}
                >
                  {t('skills.cancel')}
                </Button>

                <Button
                  type="submit"
                  disabled={saving || !formData.name || !formData.type || !formData.category}
                  style={{
                    backgroundColor: isDark ? '#3B82F6' : '#2563EB',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.75rem 1.5rem',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: (saving || !formData.name || !formData.type || !formData.category) ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    minWidth: '160px'
                  }}
                >
                  <Save size={16} />
                  {saving ? t('skills.saving') : t('skills.save_changes')}
                </Button>
              </Flex>
            </Flex>
          </form>
        </Card>
      </View>
    </>
  );
};

export default EditSkillClient;
