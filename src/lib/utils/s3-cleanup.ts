// lib/utils/s3-cleanup.ts
import { remove, list } from 'aws-amplify/storage';
/**
 * Gets the WebP version key from an original image key
 * @param originalKey The original image key
 * @returns The WebP version key or null if invalid
 */
const getWebpKey = (originalKey: string): string | null => {
  if (!originalKey) return null;

  const pathParts = originalKey.split('/')
  const filename = pathParts.pop()
  if (!filename) return null;

  const fileNameWithoutExtension = filename.split('.').slice(0,-1).join('.');
  
  return [...pathParts, 'webp', `${fileNameWithoutExtension}.webp`].join('/');
};

// NEW: simple URL detector
const isHttpUrl = (key?: string | null) => !!key && /^https?:\/\//i.test(key);

// NEW: Detect if a key points to the optimized WebP version
const isWebpKey = (key: string): boolean => key.includes('/webp/');

// NEW: Given a WebP key, guess possible original keys with common extensions
const getOriginalCandidatesFromWebpKey = (webpKey: string): string[] => {
  try {
    const pathParts = webpKey.split('/');
    const filename = pathParts.pop() || '';
    const nameWithoutExt = filename.replace(/\.webp$/i, '');

    // remove the `webp` folder segment
    const webpIndex = pathParts.lastIndexOf('webp');
    if (webpIndex >= 0) pathParts.splice(webpIndex, 1);

    const basePath = pathParts.join('/');

    // Include lower and upper case variants and more formats (covers scanners/cameras)
    const lower = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const variants = [...lower, ...lower.map(ext => ext.toUpperCase())];

    const candidates = variants.map(ext => `${basePath}/${nameWithoutExt}.${ext}`);
    return candidates;
  } catch {
    return [];
  }
};

/**
 * Generic S3 cleanup utility for all model types
 */
export class S3Cleanup {
  /**
   * Elimina un solo archivo de S3 y su versión WebP si existe
   * Accepts either the original key OR the WebP key.
   * @param fileKey - Clave del archivo a eliminar
   * @returns Promise<boolean> - true si se eliminó exitosamente (alguna de las variantes)
   */
  static async deleteSingleFile(fileKey: string | null | undefined): Promise<boolean> {
    if (!fileKey) return true; // Nada que eliminar

    // Ignore external URLs (not stored in S3)
    if (isHttpUrl(fileKey)) {
      console.log(`ℹ️ Skip S3 cleanup for external URL: ${fileKey}`);
      return true;
    }
    
    try {
      // Normalizar el path - remover 'public/' si existe (compatibilidad Gen 1)
      const normalizedPath = fileKey.startsWith('public/') ? fileKey.slice(7) : fileKey;

      // Case A: the key points to a WebP file (DB updated by Lambda)
      if (isWebpKey(normalizedPath)) {
        let anyDeleted = false;
        // 1) Delete the WebP itself first
        try {
          await remove({ path: normalizedPath });
          anyDeleted = true;
        } catch (err) {
          console.log(`ℹ️ No se pudo eliminar WebP (puede no existir): ${normalizedPath}`, err);
        }

        // 2) Try deleting the likely original(s) with common extensions
        const originals = getOriginalCandidatesFromWebpKey(normalizedPath);
        for (const originalKey of originals) {
          try {
            await remove({ path: originalKey });
            anyDeleted = true;
            // Do not break; try to delete other potential duplicates too
          } catch (err) {
            console.log(`ℹ️ Original no encontrado (o no se pudo eliminar): ${originalKey}`);
          }
        }

        // 3) Fallback: list the folder and remove any file that matches the base name (unknown extensions)
        try {
          const pathParts = normalizedPath.split('/');
          const file = pathParts.pop() || '';
          const nameWithoutExt = file.replace(/\.webp$/i, '');
          const webpIndex = pathParts.lastIndexOf('webp');
          if (webpIndex >= 0) pathParts.splice(webpIndex, 1);
          const baseDir = pathParts.join('/') + '/';
          const listing = await list({ path: baseDir });
          const toDelete = (listing?.items || [])
            .map((it: any) => it?.path)
            .filter((p: string | undefined): p is string => !!p)
            .filter((p: string) => !p.includes('/webp/') && new RegExp(`${baseDir}${nameWithoutExt}\.[^.]+$`, 'i').test(p));
          for (const candidate of toDelete) {
            try {
              await remove({ path: candidate });
              anyDeleted = true;
            } catch (err) {
              console.log(`ℹ️ No se pudo eliminar (listing): ${candidate}`);
            }
          }
        } catch (err) {
          console.log('ℹ️ Fallback listing failed or not supported for this path');
        }

        return anyDeleted;
      }

      // Case B: the key points to the original
      await remove({ path: normalizedPath });
      
      // Intentar eliminar la versión WebP si existe
      const webpKey = getWebpKey(normalizedPath);
      if (webpKey) {
        try {
          await remove({ path: webpKey });
        } catch (webpErr) {
          console.log(`ℹ️ No se encontró versión WebP o error al eliminar: ${webpKey}`, webpErr);
          // No consideramos un error si la versión WebP no existe
        }
      }
      
      return true;
    } catch (err) {
      console.error(`❌ Error eliminando archivo de S3: ${fileKey}`, err);
      return false;
    }
  }
  
  /**
   * Elimina múltiples archivos S3 y sus versiones WebP
   * @param fileKeys - Array de claves de archivos a eliminar
   * @param entityId - ID de la entidad (para logs)
   * @param entityType - Tipo de entidad (para logs)
   * @returns Promise<void>
   */
  static async deleteMultipleFiles(
    fileKeys: (string | null | undefined)[],
    entityId: string,
    entityType: string
  ): Promise<void> {
    // Filtrar claves nulas o vacías
    const validKeys = fileKeys.filter(key => key && key.trim().length > 0) as string[];
    
    if (validKeys.length === 0) {
      console.log(`ℹ️ No hay archivos S3 para eliminar en ${entityType} ${entityId}`);
      return;
    }
    
    // Crear un array con las claves originales y sus versiones WebP
    const filesToDelete: string[] = [];
    
    validKeys.forEach(key => {
      // Skip external URLs
      if (isHttpUrl(key)) return;
      filesToDelete.push(key);
      const webpKey = getWebpKey(key);
      if (webpKey) filesToDelete.push(webpKey);
    });
    
    if (filesToDelete.length === 0) {
      console.log(`ℹ️ No hay archivos S3 para eliminar en ${entityType} ${entityId} (solo URLs externas)`);
      return;
    }

    console.log(`🗑️ Eliminando ${filesToDelete.length} archivos de S3 para ${entityType} ${entityId}:`, filesToDelete);
    
    // Eliminar archivos de S3 en paralelo
    const deletePromises = filesToDelete.map(async (fileKey) => {
      try {
        // Normalizar el path - remover 'public/' si existe (compatibilidad Gen 1)
        const normalizedPath = fileKey.startsWith('public/') ? fileKey.slice(7) : fileKey;
        await remove({ path: normalizedPath });
        return { success: true, key: fileKey };
      } catch (err) {
        console.error(`❌ Error eliminando archivo de S3: ${fileKey}`, err);
        return { success: false, key: fileKey, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    
    // Reportar resultados
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 S3 Cleanup Results - Exitosos: ${successful}, Fallidos: ${failed}`);
    
    if (failed > 0) {
      const failedKeys = results.filter(r => !r.success).map(r => r.key);
      console.warn(`⚠️ Archivos que no se pudieron eliminar:`, failedKeys);
    }
  }
}

/**
 * Utilidad para eliminar archivos de S3 asociados a un proyecto
 * @deprecated Use S3Cleanup instead
 */
export class S3ProjectCleanup {
  /**
   * Elimina todos los archivos S3 asociados a un proyecto
   * @param photoKey - Clave de la imagen principal
   * @param galleryKeys - Array de claves de galería
   * @param projectId - ID del proyecto (para logs)
   * @returns Promise<void>
   */
  static async deleteProjectFiles(
    photoKey: string | null | undefined,
    galleryKeys: (string | null)[] | null | undefined,
    projectId: string
  ): Promise<void> {
    const filesToDelete: string[] = [];
    
    // Agregar imagen principal y su versión WebP si existe (skip URLs)
    if (photoKey && !isHttpUrl(photoKey)) {
      filesToDelete.push(photoKey);
      const webpKey = getWebpKey(photoKey);
      if (webpKey) filesToDelete.push(webpKey);
    }
    
    // Agregar imágenes de galería y sus versiones WebP si existen (skip URLs)
    if (galleryKeys && galleryKeys.length > 0) {
      galleryKeys.forEach(key => {
        if (key && !isHttpUrl(key)) {
          filesToDelete.push(key);
          const webpKey = getWebpKey(key);
          if (webpKey) filesToDelete.push(webpKey);
        }
      });
    }

    if (filesToDelete.length === 0) {
      console.log(`ℹ️ No hay archivos S3 para eliminar en proyecto ${projectId}`);
      return;
    }

    console.log(`🗑️ Eliminando ${filesToDelete.length} archivos de S3 para proyecto ${projectId}:`, filesToDelete);
    
    // Eliminar archivos de S3 en paralelo
    const deletePromises = filesToDelete.map(async (fileKey) => {
      try {
        // Normalizar el path - remover 'public/' si existe (compatibilidad Gen 1)
        const normalizedPath = fileKey.startsWith('public/') ? fileKey.slice(7) : fileKey;
        await remove({ path: normalizedPath });
        return { success: true, key: fileKey };
      } catch (err) {
        console.error(`❌ Error eliminando archivo de S3: ${fileKey}`, err);
        return { success: false, key: fileKey, error: err };
      }
    });

    const results = await Promise.all(deletePromises);
    
    // Reportar resultados
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`📊 S3 Cleanup Results - Exitosos: ${successful}, Fallidos: ${failed}`);
    
    if (failed > 0) {
      const failedKeys = results.filter(r => !r.success).map(r => r.key);
      console.warn(`⚠️ Archivos que no se pudieron eliminar:`, failedKeys);
    }
  }

  /**
   * Elimina un solo archivo de S3 y su versión WebP si existe
   * @param fileKey - Clave del archivo a eliminar
   * @returns Promise<boolean> - true si se eliminó exitosamente
   */
  static async deleteSingleFile(fileKey: string): Promise<boolean> {
    return S3Cleanup.deleteSingleFile(fileKey);
  }

  /**
   * Valida si una clave de archivo es válida
   * @param key - Clave a validar
   * @returns boolean
   */
  static isValidFileKey(key: string | null | undefined): key is string {
    return typeof key === 'string' && key.trim().length > 0;
  }
}

export default S3Cleanup;
