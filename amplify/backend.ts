import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

/**
 * Define and configure your backend
 * @see https://docs.amplify.aws/gen2/build-a-backend/auth
 */
export const backend = defineBackend({
  auth,
  data,
  storage,
});
