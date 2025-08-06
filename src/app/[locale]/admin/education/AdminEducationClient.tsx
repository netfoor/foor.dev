'use client';

import React, { useState, useEffect } from 'react';
import { View, Flex, Text, Button, Card, Badge, Loader, Alert, TextField } from '@aws-amplify/ui-react';
import { 
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  GraduationCap,
  Calendar,
  MapPin,
  Award,
  ExternalLink
} from 'lucide-react';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import { useRouter } from 'next/navigation';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3Cleanup from '@/lib/utils/s3-cleanup';

// Tipos para la educación
type Education = Schema["Education"]["type"];

interface AdminEducationClientProps {
  locale: SupportedLocale;
}

const AdminEducationClient: React.FC<AdminEducationClientProps> = ({ locale }) => {
  const [education, setEducation] = useState<Education[]>([]);
  const [educationImages, setEducationImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const router = useRouter();
  const getLocalizedPath = useLocalizedPath();

  // Client initialization
  const client = generateClient<Schema>();

  // Función para obtener URL de imagen desde S3
  const getImageUrl = async (photoKey: string | null | undefined): Promise<string | null> => {
    if (!photoKey) return null;
    
    try {
      const cleanKey = photoKey.startsWith('public/') ? photoKey.substring(7) : photoKey;
      const { url } = await getUrl({
        path: `public/${cleanKey}`,
        options: {
          validateObjectExistence: false,
          expiresIn: 3600
        }
      });
      return url.toString();
    } catch (err) {
      console.warn(`No se pudo obtener la imagen para la clave: ${photoKey}`, err);
      return null;
    }
  };

  // Función para cargar educación
  const loadEducation = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: educationData } = await client.models.Education.list({
        authMode: 'userPool'
      });

      if (!educationData) {
        setEducation([]);
        return;
      }

      // Ordenar por fecha de inicio (más reciente primero)
      const sortedEducation = [...educationData].sort((a, b) => {
        if (!a.startDate || !b.startDate) return 0;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      });

      setEducation(sortedEducation);

      // Cargar imágenes
      const imagePromises = sortedEducation.map(async (edu) => {
        if (edu.photoKey) {
          const imageUrl = await getImageUrl(edu.photoKey);
          if (imageUrl) {
            setEducationImages(prev => ({
              ...prev,
              [edu.id]: imageUrl
            }));
          }
        }
      });

      await Promise.all(imagePromises);
    } catch (err) {
      console.error('Error cargando educación:', err);
      setError('Error al cargar la información educativa. Por favor, intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar educación
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta entrada educativa?')) {
      return;
    }

    try {
      setDeleteLoading(id);
      
      // 1. Get education data to access S3 keys before deleting
      const { data: educationData } = await client.models.Education.get({ id }, { authMode: 'userPool' });
      
      if (!educationData) {
        throw new Error('Education record not found');
      }

      // 2. Delete S3 files if they exist
      const filesToDelete: string[] = [];
      
      // Main photo
      if (educationData.photoKey) {
        filesToDelete.push(educationData.photoKey);
      }
      
      // Additional photos array
      if (educationData.Photos && educationData.Photos.length > 0) {
        // Filter out null/undefined values
        const validPhotos = educationData.Photos.filter((photo): photo is string => Boolean(photo));
        filesToDelete.push(...validPhotos);
      }

      // Delete all S3 files
      if (filesToDelete.length > 0) {
        await S3Cleanup.deleteMultipleFiles(filesToDelete, id, 'Education');
      }

      // 3. Delete DynamoDB record
      await client.models.Education.delete({ id }, { authMode: 'userPool' });
      
      console.log(`✅ Education ${id} deleted completely`);
      
      // 4. Update local state
      setEducation(prev => prev.filter(edu => edu.id !== id));
      setEducationImages(prev => {
        const newImages = { ...prev };
        delete newImages[id];
        return newImages;
      });
    } catch (err) {
      console.error('Error eliminando educación:', err);
      setError(`Error al eliminar la entrada educativa: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Effect para cargar datos
  useEffect(() => {
    loadEducation();
  }, []);

  // Filtrar educación por término de búsqueda
  const filteredEducation = education.filter(edu =>
    edu.degree.toLowerCase().includes(searchTerm.toLowerCase()) ||
    edu.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (edu.fieldOfStudy && edu.fieldOfStudy.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale === 'es' ? 'es-ES' : locale === 'ja' ? 'ja-JP' : 'en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    } catch {
      return dateString;
    }
  };

  // Función para obtener período educativo
  const getEducationPeriod = (startDate: string | null | undefined, endDate: string | null | undefined) => {
    if (!startDate) return 'Fecha no especificada';
    const start = formatDate(startDate);
    const end = endDate ? formatDate(endDate) : 'Presente';
    return `${start} - ${end}`;
  };

  // Estilos dinámicos basados en el tema
  const containerStyles = {
    padding: '2rem',
    minHeight: '100vh',
    background: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)'
      : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.85) 100%)',
  };

  const cardStyles = {
    background: mode === 'dark'
      ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8) 0%, rgba(71, 85, 105, 0.6) 100%)'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.7) 100%)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: mode === 'dark'
      ? '1px solid rgba(148, 163, 184, 0.2)'
      : '1px solid rgba(203, 213, 225, 0.3)',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: mode === 'dark'
      ? '0 10px 40px rgba(0, 0, 0, 0.3)'
      : '0 10px 40px rgba(0, 0, 0, 0.1)',
  };

  if (loading) {
    return (
      <View style={containerStyles}>
        <Flex direction="column" alignItems="center" gap="1rem">
          <Loader size="large" />
          <Text style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}>
            Cargando información educativa...
          </Text>
        </Flex>
      </View>
    );
  }

  return (
    <View style={containerStyles}>
      {/* Header */}
      <Flex direction="column" gap="2rem" marginBottom="2rem">
        <Flex direction={{ base: 'column', medium: 'row' }} justifyContent="space-between" alignItems={{ base: 'stretch', medium: 'center' }} gap="1rem">
          <View>
            <Text 
              as="h1" 
              fontSize="2rem" 
              fontWeight="700"
              style={{ 
                color: mode === 'dark' ? '#F8FAFC' : '#0F172A',
                marginBottom: '0.5rem'
              }}
            >
              Gestionar Educación
            </Text>
            <Text 
              fontSize="1.125rem"
              style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
            >
              Administra tu formación académica y logros educativos
            </Text>
          </View>
          <Button
            onClick={() => router.push(getLocalizedPath('/admin/education/new'))}
            style={{
              background: mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(37, 99, 235, 1))',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontWeight: '600',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <Plus size={20} />
            Nueva Educación
          </Button>
        </Flex>

        {/* Search */}
        <View style={{
          background: mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.8), rgba(71, 85, 105, 0.6))'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.6))',
          backdropFilter: 'blur(16px)',
          border: mode === 'dark' 
            ? '1px solid rgba(148, 163, 184, 0.2)' 
            : '1px solid rgba(203, 213, 225, 0.3)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}>
          <Flex alignItems="center" gap="1rem">
            <Search size={20} color={mode === 'dark' ? '#94A3B8' : '#64748B'} />
            <TextField
              label=""
              placeholder="Buscar por institución, título o campo de estudio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                fontSize: '1rem',
                color: mode === 'dark' ? '#E2E8F0' : '#1E293B',
              }}
            />
          </Flex>
        </View>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" hasIcon marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Education List */}
      {filteredEducation.length === 0 ? (
        <Card style={cardStyles}>
          <Flex direction="column" alignItems="center" gap="2rem" padding="3rem">
            <View style={{
              padding: '2rem',
              borderRadius: '50%',
              background: mode === 'dark' 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(37, 99, 235, 0.1))',
            }}>
              <GraduationCap 
                size={48} 
                color={mode === 'dark' ? '#60A5FA' : '#3B82F6'} 
              />
            </View>
            <Text 
              fontSize="1.25rem" 
              textAlign="center"
              style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
            >
              {searchTerm ? 'No se encontraron entradas educativas que coincidan con tu búsqueda.' : 'No hay información educativa aún. ¡Comienza agregando tu primera entrada!'}
            </Text>
            {!searchTerm && (
              <Button
                onClick={() => router.push(getLocalizedPath('/admin/education/new'))}
                style={{
                  background: mode === 'dark' 
                    ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(37, 99, 235, 0.8))'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 1), rgba(37, 99, 235, 1))',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: '600',
                }}
              >
                <Plus size={20} style={{ marginRight: '8px' }} />
                Agregar Primera Educación
              </Button>
            )}
          </Flex>
        </Card>
      ) : (
        <Flex direction="column" gap="1.5rem">
          {filteredEducation.map((edu) => (
            <Card key={edu.id} style={cardStyles}>
              <Flex direction={{ base: 'column', medium: 'row' }} gap="1.5rem" alignItems={{ base: 'stretch', medium: 'flex-start' }}>
                {/* Institution Image */}
                {educationImages[edu.id] && (
                  <View style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: mode === 'dark' 
                      ? 'linear-gradient(135deg, rgba(71, 85, 105, 0.5), rgba(51, 65, 85, 0.5))'
                      : 'linear-gradient(135deg, rgba(248, 250, 252, 0.5), rgba(241, 245, 249, 0.5))',
                  }}>
                    <img
                      src={educationImages[edu.id]}
                      alt={edu.institution}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </View>
                )}

                {/* Content */}
                <Flex direction="column" gap="0.75rem" flex="1">
                  <Flex direction="column" gap="0.25rem">
                    <Text 
                      fontSize="1.25rem" 
                      fontWeight="700"
                      style={{ color: mode === 'dark' ? '#F8FAFC' : '#0F172A' }}
                    >
                      {edu.degree}
                    </Text>
                    {edu.fieldOfStudy && (
                      <Text 
                        fontSize="1rem" 
                        fontWeight="500"
                        style={{ color: mode === 'dark' ? '#60A5FA' : '#3B82F6' }}
                      >
                        {edu.fieldOfStudy}
                      </Text>
                    )}
                    <Text 
                      fontSize="0.875rem" 
                      fontWeight="600"
                      style={{ color: mode === 'dark' ? '#CBD5E1' : '#475569' }}
                    >
                      {edu.institution}
                    </Text>
                  </Flex>

                  <Flex wrap="wrap" gap="1rem">
                    <Flex alignItems="center" gap="0.25rem">
                      <Calendar size={14} color={mode === 'dark' ? '#94A3B8' : '#64748B'} />
                      <Text 
                        fontSize="0.75rem"
                        style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
                      >
                        {getEducationPeriod(edu.startDate, edu.endDate)}
                      </Text>
                    </Flex>
                    {edu.location && (
                      <Flex alignItems="center" gap="0.25rem">
                        <MapPin size={14} color={mode === 'dark' ? '#94A3B8' : '#64748B'} />
                        <Text 
                          fontSize="0.75rem"
                          style={{ color: mode === 'dark' ? '#94A3B8' : '#64748B' }}
                        >
                          {edu.location}
                        </Text>
                      </Flex>
                    )}
                    {edu.recognition && edu.recognition.length > 0 && (
                      <Flex alignItems="center" gap="0.25rem">
                        <Award size={14} color={mode === 'dark' ? '#F59E0B' : '#D97706'} />
                        <Text 
                          fontSize="0.75rem"
                          style={{ color: mode === 'dark' ? '#F59E0B' : '#D97706' }}
                        >
                          {edu.recognition.length} reconocimiento(s)
                        </Text>
                      </Flex>
                    )}
                  </Flex>
                </Flex>

                {/* Actions */}
                <Flex gap="0.5rem" alignItems="center">
                  <Button
                    onClick={() => router.push(getLocalizedPath(`/admin/education/${edu.id}`))}
                    style={{
                      background: 'transparent',
                      border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.3)' : '1px solid rgba(203, 213, 225, 0.4)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: mode === 'dark' ? '#94A3B8' : '#64748B',
                      cursor: 'pointer',
                    }}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    onClick={() => handleDelete(edu.id)}
                    disabled={deleteLoading === edu.id}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(239, 68, 68, 0.5)',
                      borderRadius: '8px',
                      padding: '8px',
                      color: '#EF4444',
                      cursor: 'pointer',
                      opacity: deleteLoading === edu.id ? 0.5 : 1,
                    }}
                  >
                    {deleteLoading === edu.id ? <Loader size="small" /> : <Trash2 size={16} />}
                  </Button>
                </Flex>
              </Flex>
            </Card>
          ))}
        </Flex>
      )}
    </View>
  );
};

export default AdminEducationClient;
