import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { imageOptimizationFunction } from './functions/image-optimitation/resource';

export const backend = defineBackend({
  auth,
  data,
  storage,
  imageOptimizationFunction,
});

backend.imageOptimizationFunction.addEnvironment("AMPLIFY_DATA_TABLE_NAME", backend.data.resources.tables["Certifications"].tableName);

backend.storage.resources.bucket.grantRead(backend.imageOptimizationFunction.resources.lambda);
backend.storage.resources.bucket.grantWrite(backend.imageOptimizationFunction.resources.lambda);


// Grant DynamoDB permissions
backend.data.resources.tables["Certifications"].grantReadWriteData(backend.imageOptimizationFunction.resources.lambda);
