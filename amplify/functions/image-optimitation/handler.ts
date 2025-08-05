import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const s3Client = new S3Client();
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient());

async function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export const handler = async (event: S3Event): Promise<void> => {
    const amplifyDataTableName = process.env.AMPLIFY_DATA_TABLE_NAME;
    
    if (!amplifyDataTableName) {
        throw new Error('AMPLIFY_DATA_TABLE_NAME environment variable is not set');
    }

    for (const record of event.Records) {
        const bucket = record.s3.bucket.name;
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

        if (key.includes('/webp/')) {
            console.log(`Skipping already optimized image: ${key}`);
            continue; // Skip already optimized images
        }

        try {

            const headObjectCommand = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });
            const objectMetadata = await s3Client.send(headObjectCommand);

            const metadata = objectMetadata.Metadata;
            const recordID = metadata?.['recordid'];
            const fieldName = metadata?.['fieldname'];
            const modelName = metadata?.['modelname'];

            if (!recordID || !fieldName || !modelName) {
                console.error(`Missing metadata for S3 object ${key}`);
                continue;
            }

            // get and process the image

            const getCommand = new GetObjectCommand({
                Bucket: bucket,
                Key: key
            });
            const originalImage = await s3Client.send(getCommand);
            if (!originalImage.Body) continue;
            const imageBuffer = await streamToBuffer(originalImage.Body);

            const webpBuffer = await sharp(imageBuffer).webp({ quality: 80 }).toBuffer();

            // new path 

            const pathParts = key.split('/');
            const originalFileName = pathParts.pop() || 'image.jpg';
            const fileNameWithoutExtension = originalFileName.split('.').slice(0, -1).join('.');
            const webpKey = [...pathParts, 'webp', `${fileNameWithoutExtension}.webp`].join('/');

            // upload the optimized image

            await s3Client.send(new PutObjectCommand({
                Bucket: bucket,
                Key: webpKey,
                Body: webpBuffer,
                ContentType: 'image/webp',
            }));

            // update the Amplify Data record

            const updateCommand = new UpdateCommand({
                TableName: amplifyDataTableName,
                Key: {
                    id: `${modelName}#${recordID}`,
                },
                UpdateExpression: `SET #fieldName = :webpKey`,
                ExpressionAttributeValues: {
                    ':webpKey': webpKey
                },
                ExpressionAttributeNames: {
                    '#fieldName': fieldName
                }
            });


            await dynamoClient.send(updateCommand);
            console.log(`Record ${recordID} on ${modelName} updated with new image key: ${webpKey}`);

        } catch (error) {
            console.error(`Error processing S3 object ${key}:`, error);
        }

    }

}