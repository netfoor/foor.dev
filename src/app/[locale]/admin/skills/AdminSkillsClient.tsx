'use client';

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Flex, 
  Text, 
  Button, 
  Card, 
  Badge, 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody,
  Loader,
  Alert,
  Menu,
  MenuItem,
  Divider,
  Heading,
  TextField,
  SelectField,
  Tabs
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  MoreVertical, 
  Code,
  Brain,
  Star,
  Calendar,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useAuthorization } from '@/hooks/useAuthorization';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3Cleanup from '@/lib/utils/s3-cleanup';

// Tipos para Skills
type Skill = Schema["Skills"]["type"];

interface AdminSkillsClientProps {
  locale: SupportedLocale;
}

const AdminSkillsClient: React.FC<AdminSkillsClientProps> = ({ locale }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [skillImageUrls, setSkillImageUrls] = useState<Record<string, string>>({});

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();
  const { isUserAdmin } = useAuthorization();

  // Categories for filtering
  const categories = [
    'Cloud Platforms',
    'Programming Languages', 
    'Frameworks & Libraries',
    'DevOps & Tools',
    'Databases',
    'Architecture & Design',
    'Soft Skills'
  ];

  // Fetch skills from Amplify Data API
  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const client = generateClient<Schema>();
      
      const response = await client.models.Skills.list({
        authMode: 'userPool',
      });
      
      if (response.data) {
        // Sort by priority and name
        const sortedSkills = [...response.data].sort((a, b) => {
          if (a.priority && b.priority) return a.priority - b.priority;
          if (a.priority) return -1;
          if (b.priority) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });
        
        setSkills(sortedSkills);
        
        // Fetch skill icons
        const imageUrls: Record<string, string> = {};
        for (const skill of sortedSkills) {
          if (skill.iconKey) {
            const imageUrl = await getImageUrl(skill.iconKey);
            if (imageUrl) {
              imageUrls[skill.id] = imageUrl;
            }
          }
        }
        setSkillImageUrls(imageUrls);
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(t('skills.error_loading_skills'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  // Delete skill
  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm(t('skills.confirm_delete'))) {
      return;
    }

    try {
      setDeleteLoading(skillId);
      
      // Check if user is admin before proceeding
      if (!isUserAdmin()) {
        setError(t('common.admin_access_required'));
        return;
      }
      
      const client = generateClient<Schema>();
      
      // Get skill data to clean up icons if any
      const skillResponse = await client.models.Skills.get({ id: skillId });
      const skillData = skillResponse.data;
      
      if (!skillData) {
        throw new Error(t('skills.skill_not_found'));
      }

      // Clean up icon from S3 if exists
      if (skillData.iconKey) {
        await S3Cleanup.deleteSingleFile(skillData.iconKey);
      }

      // Delete from DynamoDB
      await client.models.Skills.delete({
        id: skillId
      });
      
      console.log(`✅ Skill ${skillId} deleted from DynamoDB`);
      
      // Update local state
      setSkills(prev => prev.filter(skill => skill.id !== skillId));
      
      // Remove image URL from state
      setSkillImageUrls(prev => {
        const newUrls = { ...prev };
        delete newUrls[skillId];
        return newUrls;
      });
      
      console.log(`🎉 Skill deleted successfully`);
      
    } catch (err) {
      console.error('Error deleting skill:', err);
      setError(`${t('skills.error_deleting')}: ${err instanceof Error ? err.message : t('skills.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Get image URL from Storage
  const getImageUrl = async (key: string | null | undefined) => {
    if (!key) return null;
    
    try {
      const normalizedPath = key.startsWith('public/') ? key.slice(7) : key;
      
      const url = await getUrl({
        path: normalizedPath
      });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL:', err);
      return null;
    }
  };

  // Filter skills based on search and filters
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         skill.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesType = selectedType === 'all' || skill.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Group skills by type for tab display
  const technicalSkills = filteredSkills.filter(skill => skill.type === 'Technical');
  const softSkills = filteredSkills.filter(skill => skill.type === 'Soft');

  // Get proficiency badge color
  const getProficiencyColor = (proficiency: string | null | undefined) => {
    switch (proficiency) {
      case 'Expert': return 'success';
      case 'Advanced': return 'info';
      case 'Intermediate': return 'warning';
      case 'Beginner': return 'error';
      default: return 'neutral';
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

  return (
    <View padding="large">
      <Flex direction="column" gap="large">
        {/* Header */}
        <Flex justifyContent="space-between" alignItems="center">
          <View>
            <Heading level={1} fontSize="xl" fontWeight="bold" color="font.primary">
              {t('skills.title')}
            </Heading>
            <Text fontSize="medium" color="font.secondary">
              {t('skills.description')}
            </Text>
          </View>
          <Link href={getLocalizedPath('/admin/skills/new')}>
            <Button variation="primary" size="small">
              <Flex alignItems="center" gap="xs">
                <Plus size={16} />
                {t('skills.create')}
              </Flex>
            </Button>
          </Link>
        </Flex>

        {/* Error Alert */}
        {error && (
          <Alert
            variation="error"
            isDismissible={true}
            onDismiss={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card padding="medium">
          <Flex direction={{ base: 'column', medium: 'row' }} gap="medium" alignItems="flex-end">
            <TextField
              label={t('skills.search')}
              placeholder={t('skills.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              outerStartComponent={<Search size={16} />}
              flex="1"
            />
            <SelectField
              label={t('skills.filter_by_category')}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">{t('skills.all_categories')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </SelectField>
            <SelectField
              label={t('skills.filter_by_type')}
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">{t('skills.all_types')}</option>
              <option value="Technical">{t('skills.technical')}</option>
              <option value="Soft">{t('skills.soft')}</option>
            </SelectField>
          </Flex>
        </Card>

        {/* Skills Content */}
        <View>
          {filteredSkills.length > 0 ? (
            <Tabs defaultValue="technical" spacing="equal">
              <Tabs.List>
                <Tabs.Item value="technical">
                  {t('skills.technical')} ({technicalSkills.length})
                </Tabs.Item>
                <Tabs.Item value="soft">
                  {t('skills.soft')} ({softSkills.length})
                </Tabs.Item>
              </Tabs.List>
              
              <Tabs.Panel value="technical">
                <SkillsTable 
                  skills={technicalSkills}
                  skillImageUrls={skillImageUrls}
                  deleteLoading={deleteLoading}
                  onDelete={handleDeleteSkill}
                  getProficiencyColor={getProficiencyColor}
                  t={t}
                  getLocalizedPath={getLocalizedPath}
                />
              </Tabs.Panel>
              
              <Tabs.Panel value="soft">
                <SkillsTable 
                  skills={softSkills}
                  skillImageUrls={skillImageUrls}
                  deleteLoading={deleteLoading}
                  onDelete={handleDeleteSkill}
                  getProficiencyColor={getProficiencyColor}
                  t={t}
                  getLocalizedPath={getLocalizedPath}
                />
              </Tabs.Panel>
            </Tabs>
          ) : (
            <Card padding="large" textAlign="center">
              <Code size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
              <Text fontSize="medium" color="font.secondary" marginBottom="medium">
                {searchTerm || selectedCategory !== 'all' || selectedType !== 'all' 
                  ? t('skills.no_skills_found') 
                  : t('skills.no_skills')}
              </Text>
              <Link href={getLocalizedPath('/admin/skills/new')}>
                <Button variation="primary">
                  <Flex alignItems="center" gap="xs">
                    <Plus size={16} />
                    {t('skills.create')}
                  </Flex>
                </Button>
              </Link>
            </Card>
          )}
        </View>
      </Flex>
    </View>
  );
};

// Skills Table Component
interface SkillsTableProps {
  skills: Skill[];
  skillImageUrls: Record<string, string>;
  deleteLoading: string | null;
  onDelete: (id: string) => void;
  getProficiencyColor: (proficiency: string | null | undefined) => string;
  t: any;
  getLocalizedPath: (path: string) => string;
}

const SkillsTable: React.FC<SkillsTableProps> = ({
  skills,
  skillImageUrls,
  deleteLoading,
  onDelete,
  getProficiencyColor,
  t,
  getLocalizedPath
}) => {
  if (skills.length === 0) {
    return (
      <View padding="large" textAlign="center">
        <Text fontSize="medium" color="font.secondary">
          {t('skills.no_skills_in_category')}
        </Text>
      </View>
    );
  }

  return (
    <Table highlightOnHover>
      <TableHead>
        <TableRow>
          <TableCell>{t('skills.skill_name')}</TableCell>
          <TableCell>{t('skills.category')}</TableCell>
          <TableCell>{t('skills.proficiency')}</TableCell>
          <TableCell>{t('skills.experience')}</TableCell>
          <TableCell>{t('skills.actions')}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {skills.map((skill) => (
          <TableRow key={skill.id}>
            <TableCell>
              <Flex alignItems="center" gap="small">
                {skill.iconKey && skillImageUrls[skill.id] && (
                  <div style={{ width: '32px', height: '32px' }}>
                    <img 
                      src={skillImageUrls[skill.id]} 
                      alt="Skill Icon" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'contain', 
                        borderRadius: '4px' 
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-skill.png';
                      }}
                    />
                  </div>
                )}
                <View>
                  <Text fontWeight="semibold">{skill.name}</Text>
                  {skill.description && (
                    <Text fontSize="small" color="font.tertiary">
                      {skill.description}
                    </Text>
                  )}
                </View>
              </Flex>
            </TableCell>
            <TableCell>
              <Badge variation="info">{skill.category}</Badge>
            </TableCell>
            <TableCell>
              <Badge variation={getProficiencyColor(skill.proficiency) as any}>
                {skill.proficiency}
              </Badge>
            </TableCell>
            <TableCell>
              <Text fontSize="small">
                {skill.yearsOfExperience ? `${skill.yearsOfExperience} years` : t('skills.not_specified')}
              </Text>
            </TableCell>
            <TableCell>
              <Menu
                trigger={
                  <Button variation="link" size="small">
                    <MoreVertical size={16} />
                  </Button>
                }
                menuAlign="end"
              >
                <Link href={getLocalizedPath(`/admin/skills/${skill.id}`)}>
                  <MenuItem>
                    <Edit3 size={16} />
                    {t('skills.edit')}
                  </MenuItem>
                </Link>
                <Divider />
                <MenuItem 
                  onClick={() => onDelete(skill.id)}
                  isDisabled={deleteLoading === skill.id}
                >
                  <Trash2 size={16} />
                  {deleteLoading === skill.id ? t('skills.deleting') : t('skills.delete')}
                </MenuItem>
              </Menu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default AdminSkillsClient;
