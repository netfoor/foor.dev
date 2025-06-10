// amplify/storage/resource.ts
import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'myAmplifyImages', // Un nombre para tu bucket de S3
  access: (allow) => ({
    'public/*': [ // Contenido público para certificaciones
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete']),
    ],
    'private/{entity_id}/*': [ // Contenido solo para el dueño
      allow.entity('identity').to(['read', 'write', 'delete']),
      allow.guest.to(['read']),
    ]
  }),
});