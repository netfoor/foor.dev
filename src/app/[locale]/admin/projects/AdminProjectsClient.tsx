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
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import { getUrl, remove } from 'aws-amplify/storage';
import type { Schema } from '../../../../../amplify/data/resource';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';
import type { SupportedLocale } from '@/lib/i18n/types';
import S3ProjectCleanup from '@/lib/utils/s3-cleanup';
import CreateSampleData from './CreateSampleData';
import CreateAllSampleData from './CreateAllSampleData';

// Tipos para el proyecto actualizado
type Project = Schema["Projects"]["type"];

interface AdminProjectsClientProps {
  locale: SupportedLocale;
}

const AdminProjectsClient: React.FC<AdminProjectsClientProps> = ({ locale }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const { mode } = useTheme();
  const { t } = useTranslation('admin');
  const getLocalizedPath = useLocalizedPath();

  // Fetch projects from Amplify Data API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      const response = await client.models.Projects.list({
        authMode: 'userPool', // Usar autenticación de usuario
      });
      
      if (response.data) {
        setProjects(response.data);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };  // Eliminar proyecto completo (DynamoDB + S3)
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción eliminará permanentemente el proyecto y todas sus imágenes.')) {
      return;
    }

    try {
      setDeleteLoading(projectId);
      
      // Generar el cliente solo en el cliente
      const client = generateClient<Schema>();
      
      // 1. PRIMERO: Obtener los datos del proyecto para acceder a las claves de S3
      const projectResponse = await client.models.Projects.get({ id: projectId });
      const projectData = projectResponse.data;
      
      if (!projectData) {
        throw new Error('Proyecto no encontrado');
      }

      // 2. SEGUNDO: Eliminar archivos de S3 usando utilidad
      await S3ProjectCleanup.deleteProjectFiles(
        projectData.photoKey,
        projectData.galleryKeys,
        projectId
      );

      // 3. TERCERO: Eliminar el registro de DynamoDB
      await client.models.Projects.delete({
        id: projectId
      });
      
      console.log(`✅ Proyecto ${projectId} eliminado completamente de DynamoDB`);
      
      // 4. CUARTO: Actualizar la lista local
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Mensaje de éxito
      console.log(`🎉 Proyecto eliminado exitosamente: ${projectData.title}`);
      
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(`Error al eliminar proyecto: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setDeleteLoading(null);
    }
  };
  // Obtener URL de imagen desde Storage
  const getImageUrl = async (key: string | null | undefined) => {
    if (!key) return null;
    
    try {
      // Normalizar el path - remover 'public/' si existe (para compatibilidad con Gen 1)
      const normalizedPath = key.startsWith('public/') ? key.slice(7) : key;
      
      const url = await getUrl({
        path: normalizedPath,
      });
      return url.url.toString();
    } catch (err) {
      console.error('Error getting image URL:', err);
      return null;
    }
  };

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string | null | undefined) => {
    switch (status) {
      case 'Published': return '#22C55E';
      case 'Draft': return '#F59E0B';
      case 'Archived': return '#6B7280';
      default: return '#6B7280';
    }
  };

  // Función para obtener el color del badge según la categoría
  const getCategoryColor = (category: string | null | undefined) => {
    const colors = {
      'Hackathon': '#FF6B6B',
      'Research': '#4ECDC4',
      'Professional': '#45B7D1',
      'Academic': '#96CEB4',
      'Personal': '#FFEAA7'
    };
    return colors[category as keyof typeof colors] || '#95A5A6';
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" gap="1rem" padding="2rem">
        <Loader size="large" />
        <Text>Cargando proyectos...</Text>
      </Flex>
    );
  }  return (
    <View>
      {/* Header */}
      <Flex
        direction={{ base: 'column', medium: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ base: 'stretch', medium: 'center' }}
        gap="1rem"
        marginBottom="2rem"
      >
        <View>
          <Text
            fontSize="2rem"
            fontWeight="700"
            style={{
              color: mode === 'dark' ? '#F1F5F9' : '#1E293B',
            }}
          >
            Gestión de Proyectos
          </Text>
          <Text
            fontSize="1rem"
            style={{
              color: mode === 'dark' ? '#CBD5E1' : '#64748B',
            }}
          >
            Administra tu portafolio de proyectos
          </Text>
        </View>
        
        <Link href={getLocalizedPath('/admin/projects/new')} style={{ textDecoration: 'none' }}>
          <Button
            variation="primary"
            size="large"
            style={{
              backgroundColor: mode === 'dark' ? '#3B82F6' : '#2563EB',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Plus size={20} />
            Nuevo Proyecto
          </Button>
        </Link>
      </Flex>

      {/* Error Alert */}
      {error && (
        <Alert variation="error" marginBottom="1rem">
          {error}
        </Alert>
      )}

      {/* Estadísticas */}
      <Flex 
        direction={{ base: 'column', medium: 'row' }} 
        gap="1rem" 
        marginBottom="2rem"
      >
        <Card
          style={{
            flex: 1,
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          }}
        >
          <View padding="1.5rem">
            <Text fontSize="2rem" fontWeight="700" color="#22C55E">
              {projects.filter(p => p.status === 'Published').length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              Proyectos Publicados
            </Text>
          </View>
        </Card>
        
        <Card
          style={{
            flex: 1,
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          }}
        >
          <View padding="1.5rem">
            <Text fontSize="2rem" fontWeight="700" color="#F59E0B">
              {projects.filter(p => p.status === 'Draft').length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              Borradores
            </Text>
          </View>
        </Card>
        
        <Card
          style={{
            flex: 1,
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          }}
        >
          <View padding="1.5rem">
            <Text fontSize="2rem" fontWeight="700" color="#3B82F6">
              {projects.length}
            </Text>
            <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
              Total Proyectos
            </Text>
          </View>
        </Card>
      </Flex>

      {/* Tabla de proyectos */}
      <Card
        style={{
          backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(255, 255, 255, 0.9)',
          border: mode === 'dark' ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(203, 213, 225, 0.2)',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >        {projects.length === 0 ? (          <View padding="3rem" textAlign="center">
            <Text fontSize="1.125rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'} marginBottom="2rem">
              No hay proyectos aún. ¡Crea tu primer proyecto!
            </Text>            <Flex direction="column" gap="1rem">
              
              <CreateSampleData onSuccess={fetchProjects} />
              <CreateAllSampleData onSuccess={fetchProjects} />
            </Flex>
          </View>
        ) : (
          <Table
            style={{
              backgroundColor: 'transparent',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                  Proyecto
                </TableCell>
                <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                  Estado
                </TableCell>
                <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                  Categoría
                </TableCell>
                <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                  Fecha
                </TableCell>
                <TableCell style={{ fontWeight: '600', color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}>
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
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
                        <ImageIcon size={20} color={mode === 'dark' ? '#9CA3AF' : '#6B7280'} />
                      </View>
                      <View>
                        <Text 
                          fontWeight="600" 
                          style={{ color: mode === 'dark' ? '#F1F5F9' : '#1E293B' }}
                        >
                          {project.title}
                        </Text>
                        <Text 
                          fontSize="0.875rem" 
                          style={{ color: mode === 'dark' ? '#CBD5E1' : '#64748B' }}
                        >
                          {project.place}
                        </Text>
                      </View>
                    </Flex>
                  </TableCell>
                  
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor: getStatusColor(project.status),
                        color: '#FFFFFF',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        borderRadius: '6px',
                      }}
                    >
                      {project.status || 'Draft'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {project.categories && (
                      <Badge
                        style={{
                          backgroundColor: getCategoryColor(project.categories),
                          color: '#FFFFFF',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          borderRadius: '6px',
                        }}
                      >
                        {project.categories}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <Text fontSize="0.875rem" color={mode === 'dark' ? '#CBD5E1' : '#64748B'}>
                      {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '-'}
                    </Text>
                  </TableCell>
                  
                  <TableCell>
                    <Flex gap="0.5rem">
                      {/* Ver proyecto */}
                      {project.projectUrl && (
                        <Button
                          size="small"
                          style={{
                            backgroundColor: 'transparent',
                            color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
                            border: 'none',
                            padding: '0.5rem',
                          }}
                          as="a"
                          href={project.projectUrl}
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
                        href={getLocalizedPath(`/admin/projects/${project.id}`)}
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
                        onClick={() => handleDeleteProject(project.id)}
                        isDisabled={deleteLoading === project.id}
                      >
                        {deleteLoading === project.id ? (
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
        )}
      </Card>
    </View>
  );
};

export default AdminProjectsClient;
