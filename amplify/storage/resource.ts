// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'foorDevStorage', // Nombre del bucket de S3
  access: (allow) => ({
    // Contenido público - solo lectura para guests, solo ADMINS pueden escribir
    'public/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Proyectos - imágenes principales (solo ADMINS pueden modificar)
    'projects/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Galería de proyectos - imágenes de la galería organizadas por proyecto
    'projects/gallery/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Thumbnails y versiones optimizadas (futuro uso)
    'projects/thumbnails/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Certificaciones - solo ADMINS pueden modificar
    'certifications/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Skills - iconos e imágenes (solo ADMINS pueden modificar)
    'skills/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Perfiles de usuario y avatares - solo ADMINS
    'profiles/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Sección About - Perfiles (nueva estructura)
    'about/profiles/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Sección About - Experiencias
    'about/experiences/*': [
      allow.guest.to(['read']),
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ],
    
    // Contenido privado del administrador
    'admin/*': [
      allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
    ]
  }),
});