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
        console.log('[normalizeS3Key] Project path without main folder:', key);
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
        console.log('[normalizeS3Key] Normalized path:', originalKey, '->', key);
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
                console.log('Optimized image not found, falling back to original:', error);
                
                // Try legacy path for WebP if normalized path failed
                if (originalKey !== normalizedKey) {
                    const legacyOptimizedKey = getWebpKey(originalKey);
                    if (legacyOptimizedKey) {
                        try {
                            const legacyUrl = await getUrl({ path: legacyOptimizedKey });
                            return legacyUrl.url.toString();
                        } catch (legacyError) {
                            console.log('Legacy WebP path also failed:', legacyError);
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
        console.log('[getResponsiveImageSources] Processing key:', key);
        
        // Normalize the key before processing
        const normalizedKey = normalizeS3Key(key);
        
        let webpUrl = null;
        const webpKey = getWebpKey(normalizedKey);
        
        console.log('[getResponsiveImageSources] WebP key:', webpKey);

        if (webpKey) {
            try {
                console.log('[getResponsiveImageSources] Attempting to get WebP at:', webpKey);
                const webpResponse = await getUrl({path: webpKey});
                webpUrl = webpResponse.url.toString();
                console.log('[getResponsiveImageSources] Successfully found WebP image at:', webpKey);
            } catch (error) {
                console.log('[getResponsiveImageSources] WebP image not found at path:', webpKey);
                // Try alternative WebP path for legacy images
                if (key !== normalizedKey) {
                    try {
                        const legacyWebpKey = getWebpKey(key);
                        if (legacyWebpKey) {
                            console.log('[getResponsiveImageSources] Trying legacy WebP path:', legacyWebpKey);
                            const legacyWebpResponse = await getUrl({path: legacyWebpKey});
                            webpUrl = legacyWebpResponse.url.toString();
                            console.log('[getResponsiveImageSources] Successfully found WebP image using legacy path');
                        }
                    } catch (legacyError) {
                        console.log('[getResponsiveImageSources] Legacy WebP image also not found');
                    }
                }
            }
        }

        // Try to get the original image with normalized path first
        try {
            console.log('[getResponsiveImageSources] Trying to get original image at:', normalizedKey);
            const originalResult = await getUrl({path: normalizedKey});
            const originalUrl = originalResult.url.toString();
            console.log('[getResponsiveImageSources] Successfully found original image at normalized path');
            
            return {
                original: originalUrl,
                webp: webpUrl || null
            };
        } catch (originalError) {
            console.log('[getResponsiveImageSources] Failed to get image at normalized path:', normalizedKey);
            
            // If normalized path fails, try special case for projects folder structure
            if (normalizedKey.startsWith('projects/') && !normalizedKey.includes('/main/')) {
                try {
                    // Try with /main/ folder inserted
                    const partsWithMain = normalizedKey.split('/');
                    partsWithMain.splice(1, 0, 'main');
                    const keyWithMain = partsWithMain.join('/');
                    
                    console.log('[getResponsiveImageSources] Trying with /main/ folder:', keyWithMain);
                    const mainResult = await getUrl({path: keyWithMain});
                    const mainUrl = mainResult.url.toString();
                    console.log('[getResponsiveImageSources] Successfully found image with /main/ folder');
                    
                    return {
                        original: mainUrl,
                        webp: webpUrl || null
                    };
                } catch (mainError) {
                    console.log('[getResponsiveImageSources] Failed to find image with /main/ folder');
                }
            }
            
            // If all else fails, try the original path
            if (key !== normalizedKey) {
                console.log('[getResponsiveImageSources] Trying original non-normalized path:', key);
                const fallbackResult = await getUrl({path: key});
                const fallbackUrl = fallbackResult.url.toString();
                console.log('[getResponsiveImageSources] Successfully found image at original path');
                
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

