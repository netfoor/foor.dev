import { getUrl, uploadData } from 'aws-amplify/storage'
import { v4 as uuidv4 } from 'uuid'

/**
 * Get optimized image URL with fallback to original
 * @param originalKey The original S3 key path
 * @returns URL string to the optimized or original image
 */


const  getWebpKey = (originalKey: string): string | null => {
    if (!originalKey) return null;

    const pathParts = originalKey.split('/')
    const filename = pathParts.pop()
    if (!filename) return null;

    const fileNameWithoutExtension = filename.split('.').slice(0,-1).join('.');
    
    return [...pathParts, 'webp', `${fileNameWithoutExtension}.webp`].join('/');
};


export const getOptimizedImageUrl = async (originalKey: string): Promise<string | null> => {
    if (!originalKey) return null;

    try {

        const optimizedKey = getWebpKey(originalKey);

        if (optimizedKey){
            try {
                const optimizedUrl = await getUrl({ path: optimizedKey });
                return optimizedUrl.url.toString();
            } catch (error) {
                console.log('Optimized image not found, falling back to original:', error);
            }
        }

        const url = await getUrl({path: originalKey})
        return url.url.toString();

    } catch (error) {
        console.error('Error getting image URL:', error);
        return null;
    }
};


export const getResponsiveImageSources = async (key: string) => {
    if (!key) return { original: null, webp: null };

    try {

        let webpUrl = null;

        const webpKey = getWebpKey(key);

        if (webpKey) {
            try {
                const webpResponse = await getUrl({path: webpKey});
                webpUrl = webpResponse.url.toString();
            } catch (error) {
                console.log('WebP image not found, falling back to original:', error);
            }
        }

        const originalResult = await getUrl({path: key});
        const originalUrl = originalResult.url.toString();

        return {
            original: originalUrl,
            webp: webpUrl || null
        };

    } catch (error) {
        console.error('Error getting responsive image sources:', error);
        return { original: null, webp: null };
    }
};

/**
 * Uploads an image to S3 with metadata for Lambda processing
 * @param file The file object to upload
 * @param recordId The ID of the record in the database
 * @param modelName The name of the model in Amplify Data
 * @param fieldName The name of the field in the model that stores the image key
 * @returns Promise with the S3 key of the uploaded image
 */
export const uploadImageWithMetadata = async (
    file: File, 
    recordId: string, 
    modelName: string, 
    fieldName: string
): Promise<string> => {
    try {
        // Generate a unique filename to avoid collisions
        const fileName = `${uuidv4()}-${file.name}`;
        
        // Store in public directory to ensure it's accessible
        const path = `public/${fileName}`;
        
        // Upload with metadata that the Lambda will use to update the record
        await uploadData({
            path,
            data: file,
            options: {
                metadata: {
                    'recordid': recordId,
                    'modelname': modelName,
                    'fieldname': fieldName,
                }
            }
        }).result;
        
        return path; // Return the S3 key to be stored in the database
    } catch (error) {
        console.error('Error uploading image with metadata:', error);
        throw error; // Re-throw to let calling code handle the error
    }
};

