// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'foorDevStorage', // Nombre del bucket de S3
  access: (allow) => ({
    // Contenido público - accesible por todos
    'public/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    
    // Proyectos - imágenes principales
    'projects/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    
    // Galería de proyectos - imágenes de la galería organizadas por proyecto
    'projects/gallery/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    
    // Thumbnails y versiones optimizadas (futuro uso)
    'projects/thumbnails/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    
    // Certificaciones (mantener configuración existente)
    'certifications/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    
    // Perfiles de usuario y avatares
    'profiles/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    
    // Contenido privado del usuario
    'private/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ]
  }),
});