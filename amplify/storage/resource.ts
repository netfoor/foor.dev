// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';
import { imageOptimizationFunction } from '../functions/image-optimitation/resource';

export const storage = defineStorage({
  name: 'foorDevStorage', // Nombre del bucket de S3
  access: (allow) => {
    // Base permissions
    const baseAdminPermissions = [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ];
    
    // Define admin-only permissions
    const adminOnlyPermissions = [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ];
    
    return {
            'public/*': [
        ...baseAdminPermissions,
        allow.resource(imageOptimizationFunction).to(['read', 'write'])
      ],
      
      // Proyectos
      'projects/*': baseAdminPermissions,
      'projects/main/*': baseAdminPermissions,
      'projects/gallery/*': baseAdminPermissions,
      'projects/thumbnails/*': baseAdminPermissions,
      
      // Certificaciones - solo ADMINS pueden modificar
      'certifications/*': baseAdminPermissions,
      
      // Skills - iconos e imágenes (solo ADMINS pueden modificar)
      'skills/*': baseAdminPermissions,
      
      // Perfiles
      'profiles/*': baseAdminPermissions,
      'profile/*': baseAdminPermissions,
      
      // Sección About
      'about/profiles/*': baseAdminPermissions,
      'about/experiences/*': baseAdminPermissions,
      'experiences/*': baseAdminPermissions,
      
      // Reconocimientos
      'recognitions/*': baseAdminPermissions,
      
      // Publicaciones
      'publications/*': baseAdminPermissions,
      'socialpublications/*': baseAdminPermissions,
      
      // Contenido privado del administrador
      'admin/*': adminOnlyPermissions,

      // Educación
      'education/*': baseAdminPermissions,

    };
  },
  triggers: {
    onUpload: imageOptimizationFunction,
  },
});