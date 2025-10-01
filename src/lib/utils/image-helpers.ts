import { getUrl, uploadData } from 'aws-amplify/storage'
import { v4 as uuidv4 } from 'uuid'

/**
 * Get optimized image URL with fallback to original
 * @param originalKey The original S3 key path
 * @returns URL string to the optimized or original image
 */


/**
 * Normalize S3 key paths to handle both old and new path formats
 * @param key The S3 key to normalize
 * @returns Normalized S3 key
 */
const normalizeS3Key = (key: string): string => {
    if (!key) return key;
    
    const originalKey = key;
    
    // Handle old project paths (projects/main/file.jpg -> projects/file.jpg)
    if (key.startsWith('projects/main/')) {
        key = key.replace('projects/main/', 'projects/');
    }
    
    // Handle projects path without 'main' but needing it
    if (key.startsWith('projects/') && !key.includes('/main/') && key.split('/').length === 2) {
        // This might be a case where we need to insert 'main'
        // Format: projects/filename.jpg -> projects/main/filename.jpg
        // We'll log this but keep both versions to try
    }
    
    // Handle old experiences paths
    if (key.startsWith('about/experiences/')) {
        key = key.replace('about/experiences/', 'experiences/');
    }
    
    // Remove public/ prefix if present
    if (key.startsWith('public/')) {
        key = key.slice(7);
    }
    
    if (originalKey !== key) {
    }
    
    return key;
};

const getWebpKey = (originalKey: string): string | null => {
    if (!originalKey) return null;

    // Normalize the key first
    const normalizedKey = normalizeS3Key(originalKey);

    const pathParts = normalizedKey.split('/')
    const filename = pathParts.pop()
    if (!filename) return null;

    const fileNameWithoutExtension = filename.split('.').slice(0,-1).join('.');
    
    return [...pathParts, 'webp', `${fileNameWithoutExtension}.webp`].join('/');
};


export const getImageUrl = async (originalKey: string): Promise<string | null> => {
    return await getOptimizedImageUrl(originalKey);
};

export const getOptimizedImageUrl = async (originalKey: string): Promise<string | null> => {
    if (!originalKey) return null;

    try {
        // Normalize the key before processing
        const normalizedKey = normalizeS3Key(originalKey);
        const optimizedKey = getWebpKey(normalizedKey);

        if (optimizedKey) {
            try {
                const optimizedUrl = await getUrl({ path: optimizedKey });
                return optimizedUrl.url.toString();
            } catch (error) {
                
                // Try legacy path for WebP if normalized path failed
                if (originalKey !== normalizedKey) {
                    const legacyOptimizedKey = getWebpKey(originalKey);
                    if (legacyOptimizedKey) {
                        try {
                            const legacyUrl = await getUrl({ path: legacyOptimizedKey });
                            return legacyUrl.url.toString();
                        } catch (legacyError) {
                        }
                    }
                }
            }
        }

        // Try the normalized original path first
        try {
            const url = await getUrl({path: normalizedKey});
            return url.url.toString();
        } catch (normalizedError) {
            // If that fails, try the original non-normalized path
            if (originalKey !== normalizedKey) {
                const originalUrl = await getUrl({path: originalKey});
                return originalUrl.url.toString();
            }
            throw normalizedError;
        }

    } catch (error) {
        console.error('Error getting image URL:', error);
        return null;
    }
};


export const getResponsiveImageSources = async (key: string) => {
    if (!key) return { original: null, webp: null };

    try {
        
        // Normalize the key before processing
        const normalizedKey = normalizeS3Key(key);
        
        // Check if the key is already a WebP path to avoid double webp folders
        if (normalizedKey.includes('/webp/')) {
            try {
                const webpResult = await getUrl({path: normalizedKey});
                return {
                    original: webpResult.url.toString(),
                    webp: webpResult.url.toString()
                };
            } catch (error) {
                return { original: null, webp: null };
            }
        }
        
        let webpUrl = null;
        const webpKey = getWebpKey(normalizedKey);
        

        if (webpKey) {
            try {
                const webpResponse = await getUrl({path: webpKey});
                webpUrl = webpResponse.url.toString();
            } catch (error) {
                // Try alternative WebP path for legacy images
                if (key !== normalizedKey) {
                    try {
                        const legacyWebpKey = getWebpKey(key);
                        if (legacyWebpKey) {
                            const legacyWebpResponse = await getUrl({path: legacyWebpKey});
                            webpUrl = legacyWebpResponse.url.toString();
                        }
                    } catch (legacyError) {
                    }
                }
            }
        }

        // Try to get the original image with normalized path first
        try {
            const originalResult = await getUrl({path: normalizedKey});
            const originalUrl = originalResult.url.toString();
            
            return {
                original: originalUrl,
                webp: webpUrl || null
            };
        } catch (originalError) {
            
            // If normalized path fails, try special case for projects folder structure
            if (normalizedKey.startsWith('projects/') && !normalizedKey.includes('/main/')) {
                try {
                    // Try with /main/ folder inserted
                    const partsWithMain = normalizedKey.split('/');
                    partsWithMain.splice(1, 0, 'main');
                    const keyWithMain = partsWithMain.join('/');
                    
                    const mainResult = await getUrl({path: keyWithMain});
                    const mainUrl = mainResult.url.toString();
                    
                    return {
                        original: mainUrl,
                        webp: webpUrl || null
                    };
                } catch (mainError) {
                }
            }
            
            // If all else fails, try the original path
            if (key !== normalizedKey) {
                const fallbackResult = await getUrl({path: key});
                const fallbackUrl = fallbackResult.url.toString();
                
                return {
                    original: fallbackUrl,
                    webp: webpUrl || null
                };
            }
            throw originalError;
        }

    } catch (error) {
        console.error('[getResponsiveImageSources] Error getting responsive image sources:', error);
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
        const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        // Determine the correct folder based on the model name
        let folder;
        switch (modelName.toLowerCase()) {
            case 'projects':
                folder = 'projects';
                break;
            case 'certifications':
                folder = 'certifications';
                break;
            case 'recognitions':
                folder = 'recognitions';
                break;
            case 'profiles':
                folder = 'profiles';
                break;
            case 'profile':
                folder = 'profile';
                break;
            case 'publications':
                folder = 'publications';
                break;
            case 'socialpublications':
                folder = 'socialpublications';
                break;
            case 'skills':
                folder = 'skills';
                break;
            case 'experiences':
                folder = 'experiences';
                break;
            case 'education':
                folder = 'education';
                break;
            default:
                folder = modelName.toLowerCase();
        }
        
        // Create the full path with the correct folder
        const path = `${folder}/${fileName}`;
        
        // Upload with metadata that the Lambda will use to update the record
        await uploadData({
            path,
            data: file,
            options: {
                metadata: {
                    'recordid': recordId,
                    'modelname': modelName,
                    'fieldname': fieldName,
                },
                contentType: file.type
            }
        }).result;
        
        return path; // Return the S3 key to be stored in the database
    } catch (error) {
        console.error('Error uploading image with metadata:', error);
        throw error; // Re-throw to let calling code handle the error
    }
};

