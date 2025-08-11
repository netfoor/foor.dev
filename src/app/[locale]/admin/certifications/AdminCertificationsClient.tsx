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
  Divider
} from '@aws-amplify/ui-react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical, 
  Image as ImageIcon,
  ExternalLink,
  Calendar,
  Award
} from 'lucide-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3Cleanup from '@/lib/utils/s3-cleanup';

// Tipos para la certificación
type Certification = Schema["Certifications"]["type"];

interface AdminCertificationsClientProps {
  locale: SupportedLocale;
}

const AdminCertificationsClient: React.FC<AdminCertificationsClientProps> = ({ locale }) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();

  // Fetch certifications from Amplify Data API
  const fetchCertifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      const response = await client.models.Certifications.list({
        authMode: 'userPool', // Usar autenticación de usuario
      });
      
      if (response.data) {
        // Filtrar nulls y ordenar por fecha de emisión (más reciente primero)
        const sortedCertifications = response.data
          .filter(cert => cert !== null && cert.issueDate)
          .sort((a, b) => 
            new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
          );
        setCertifications(sortedCertifications);
      }
    } catch (err) {
      console.error('Error fetching certifications:', err);
      setError(t('certifications.error_loading_certifications'));
    } finally {
      setLoading(false);
    }
  };

  // Eliminar certificación completa (DynamoDB + S3)
  const handleDeleteCertification = async (certificationId: string) => {
    if (!confirm(t('certifications.confirm_delete'))) {
      return;
    }

    try {
      setDeleteLoading(certificationId);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      // 1. PRIMERO: Obtener los datos de la certificación para acceder a la clave de S3
      const certificationResponse = await client.models.Certifications.get({ id: certificationId }, { authMode: 'userPool' });
      const certificationData = certificationResponse.data;
      
      if (!certificationData) {
        throw new Error(t('certifications.certification_not_found'));
      }

      // 2. SEGUNDO: Eliminar archivo de S3 si existe
      if (certificationData.photoKey) {
        await S3Cleanup.deleteSingleFile(certificationData.photoKey);
      }

      // 3. TERCERO: Eliminar el registro de DynamoDB
      await client.models.Certifications.delete({
        id: certificationId
      }, { authMode: 'userPool' });
      
      console.log(`✅ Certificación ${certificationId} eliminada completamente de DynamoDB`);
      
      // 4. CUARTO: Actualizar la lista local
      setCertifications(prev => prev.filter(c => c.id !== certificationId));
      
      // Mensaje de éxito
      console.log(`🎉 Certificación eliminada exitosamente: ${certificationData.title}`);
      
    } catch (err) {
      console.error('Error deleting certification:', err);
      setError(`${t('certifications.error_deleting_certification')}: ${err instanceof Error ? err.message : t('certifications.unknown_error')}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'Active': return '#22C55E';
      case 'Expired': return '#F59E0B';
      case 'Revoked': return '#EF4444';
      default: return '#22C55E'; // Por defecto activo
    }
  };

  // Función para obtener el color del badge según la categoría
  const getCategoryColor = (category: string | null | undefined) => {
    const colors = {
      'Technology': '#3B82F6',
      'Business': '#10B981',
      'Arts': '#F59E0B',
      'Health': '#EF4444',
      'Languages': '#8B5CF6'
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  // Función para determinar el estado basado en la fecha de expiración
  const getCertificationStatus = (cert: Certification | null) => {
    if (!cert || !cert.expirationDate) return 'Active';
    
    const now = new Date();
    const expirationDate = new Date(cert.expirationDate);
    
    return expirationDate > now ? 'Active' : 'Expired';
  };

  useEffect(() => {
    fetchCertifications();
  }, []);

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
        <Loader size="large" />
        <Text>Cargando certificaciones...</Text>
      </Flex>
    );
  }

  return (
    <View>
      {/* Header */}
      <Flex
        direction={{ base: 'column', medium: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ base: 'stretch', medium: 'flex-start' }}
        gap="1rem"
        marginBottom="2rem"
        style={{ width: '100%' }}
      >
        <View style={{ flex: '1 1 auto', minWidth: 0 }}>
          <Text
            fontSize={{ base: '1.5rem', medium: '2rem' }}
            fontWeight="700"
            style={{
              color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            }}
          >
            {t('certifications.manage_certifications')}
          </Text>
          <Text
            fontSize={{ base: '0.875rem', medium: '1rem' }}
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
            }}
          >
            {t('sections.manage_certifications')}
          </Text>
        </View>

        <View style={{ flexShrink: 0, width: '100%', maxWidth: '220px' }} className="md:w-auto">
          <Link href={getLocalizedPath('/admin/certifications/new')} style={{ textDecoration: 'none' }}>
            <Button
              variation="primary"
              size="large"
              style={{
                backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center',
                width: '100%',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={20} />
              <Text className="hidden sm:inline">{t('certifications.new_certification')}</Text>
              <Text className="sm:hidden">{t('certifications.new_certification')}</Text>
            </Button>
          </Link>
        </View>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Estadísticas Compactas */}
      <Flex 
        direction={{ base: 'column', medium: 'row' }} 
        gap="1.5rem" 
        marginBottom="2rem"
        style={{
          width: '100%',
          maxWidth: '100%'
        }}
      >
        <Card
          style={{
            flex: 1,
            minWidth: '160px',
            maxWidth: '100%',
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            boxSizing: 'border-box'
          }}
        >
          <View padding="1rem">
            <Text fontSize="1.25rem" fontWeight="700" color="#22C55E">
              {certifications.filter(c => c && getCertificationStatus(c) === 'Active').length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('certifications.active_count')}
            </Text>
          </View>
        </Card>

        <Card
          style={{
            flex: 1,
            minWidth: '160px',
            maxWidth: '100%',
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            boxSizing: 'border-box'
          }}
        >
          <View padding="1rem">
            <Text fontSize="1.25rem" fontWeight="700" color="#F59E0B">
              {certifications.filter(c => c && getCertificationStatus(c) === 'Expired').length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('certifications.expired_count')}
            </Text>
          </View>
        </Card>
        
        <Card
          style={{
            flex: 1,
            minWidth: '160px',
            maxWidth: '100%',
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
            boxSizing: 'border-box'
          }}
        >
          <View padding="1rem">
            <Text fontSize="1.25rem" fontWeight="700" color="#3B82F6">
              {certifications.length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              {t('certifications.total_count')}
            </Text>
          </View>
        </Card>
      </Flex>

      {/* Tabla de certificaciones */}
      <Card
        style={{
          backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        {certifications.length === 0 ? (
          <View padding="3rem" textAlign="center">
            <Text fontSize="1.125rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'} marginBottom="2rem">
              {t('certifications.no_certifications_yet')}
            </Text>
          </View>
        ) : (
          <View 
            className="table-container"
            style={{
              overflowX: 'auto',
              width: '100%'
            }}
          >
            <Table
              style={{
                backgroundColor: 'transparent',
                width: '100%'
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    Certificación
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    Estado
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    Categoría
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    Fecha de Emisión
                  </TableCell>
                  <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                    Acciones
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {certifications.filter(certification => certification !== null).map((certification) => (
                <TableRow key={certification.id}>
                  <TableCell>
                    <Flex alignItems="center" gap="0.75rem">
                      <View
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: mode === 'dark' ? '#374151' : '#F3F4F6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Award size={20} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                      </View>
                      <View>
                        <Text 
                          fontWeight="600" 
                          style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                        >
                          {certification.title}
                        </Text>
                        <Text 
                          fontSize="0.875rem" 
                          style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                        >
                          {certification.issuer}
                        </Text>
                      </View>
                    </Flex>
                  </TableCell>
                  
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: getStatusColor(getCertificationStatus(certification)),
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '6px',
                      }}
                    >
                      {getCertificationStatus(certification)}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {certification.category && (
                      <Badge
                        style={{
                          backgroundColor: getCategoryColor(certification.category),
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '6px',
                        }}
                      >
                        {certification.category}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                      {new Date(certification.issueDate).toLocaleDateString()}
                    </Text>
                  </TableCell>
                  
                  <TableCell>
                    <Flex gap="0.5rem">
                      {/* Ver credencial */}
                      {certification.credentialUrl && (
                        <Button
                          size="small"
                          style={{
                            backgroundColor: 'transparent',
                            color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
                            border: 'none',
                            padding: '0.5rem',
                          }}
                          as="a"
                          href={certification.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink size={16} />
                        </Button>
                      )}
                      
                      {/* Editar */}
                      <Button
                        size="small"
                        style={{
                          backgroundColor: 'transparent',
                          color: mode === 'dark' ? '#FBBF24' : '#F59E0B',
                          border: 'none',
                          padding: '0.5rem',
                        }}
                        as="a"
                        href={getLocalizedPath(`/admin/certifications/${certification.id}`)}
                      >
                        <Edit3 size={16} />
                      </Button>
                      
                      {/* Eliminar */}
                      <Button
                        size="small"
                        style={{
                          backgroundColor: 'transparent',
                          color: mode === 'dark' ? '#F87171' : '#EF4444',
                          border: 'none',
                          padding: '0.5rem',
                        }}
                        onClick={() => handleDeleteCertification(certification.id)}
                        isDisabled={deleteLoading === certification.id}
                      >
                        {deleteLoading === certification.id ? (
                          <Loader size="small" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </Button>
                    </Flex>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </View>
        )}
      </Card>
    </View>
  );
};

export default AdminCertificationsClient;
