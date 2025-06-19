// lib/utils/s3-cleanup.ts
import { remove } from 'aws-amplify/storage';

/**
 * Utilidad para eliminar archivos de S3 asociados a un proyecto
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
    
    // Agregar imagen principal si existe
    if (photoKey) {
      filesToDelete.push(photoKey);
    }
    
    // Agregar imágenes de galería si existen
    if (galleryKeys && galleryKeys.length > 0) {
      galleryKeys.forEach(key => {
        if (key) filesToDelete.push(key);
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
        console.log(`✅ Archivo eliminado de S3: ${normalizedPath}`);
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
   * Elimina un solo archivo de S3
   * @param fileKey - Clave del archivo a eliminar
   * @returns Promise<boolean> - true si se eliminó exitosamente
   */
  static async deleteSingleFile(fileKey: string): Promise<boolean> {
    try {
      // Normalizar el path - remover 'public/' si existe (compatibilidad Gen 1)
      const normalizedPath = fileKey.startsWith('public/') ? fileKey.slice(7) : fileKey;
      await remove({ path: normalizedPath });
      console.log(`✅ Archivo eliminado de S3: ${normalizedPath}`);
      return true;
    } catch (err) {
      console.error(`❌ Error eliminando archivo de S3: ${fileKey}`, err);
      return false;
    }
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

export default S3ProjectCleanup;
