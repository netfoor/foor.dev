# Detalles Técnicos: Sistema de Optimización de Imágenes

## Arquitectura

El sistema de optimización de imágenes sigue el siguiente flujo:

1. **Frontend**: La aplicación sube una imagen a S3 con metadatos específicos
2. **Evento S3**: La creación del objeto desencadena la función Lambda
3. **Lambda**: Procesa la imagen, crea versión WebP, y actualiza DynamoDB
4. **Frontend**: Muestra la imagen optimizada usando el componente `OptimizedImage`

## Detalles de la Función Lambda

La función Lambda (`imageOptimizationFunction`) ubicada en `amplify/functions/image-optimitation/` realiza:

1. **Extracción de metadatos**: Lee los metadatos del objeto S3 subido
   - `recordid`: ID del registro en DynamoDB
   - `modelname`: Nombre del modelo de datos
   - `fieldname`: Campo a actualizar

2. **Procesamiento de imagen**:
   - Usa la biblioteca `sharp` para convertir la imagen a WebP
   - Aplica compresión de calidad (80%)
   - Mantiene las dimensiones originales

3. **Almacenamiento**:
   - Guarda la versión WebP en la ruta `/webp/filename.webp`
   - Conserva la imagen original

4. **Actualización de la base de datos**:
   - Actualiza el registro correspondiente en DynamoDB con la nueva ruta

## Helpers de Frontend

### `uploadImageWithMetadata`

```typescript
export const uploadImageWithMetadata = async (
    file: File, 
    recordId: string, 
    modelName: string, 
    fieldName: string
): Promise<string> => {
    try {
        // Generate a unique filename
        const fileName = `${uuidv4()}-${file.name}`;
        const path = `public/${fileName}`;
        
        // Upload with metadata
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
        
        return path;
    } catch (error) {
        console.error('Error uploading image with metadata:', error);
        throw error;
    }
};
```

### `getOptimizedImageUrl` y `getResponsiveImageSources`

Estos helpers:
- Construyen la ruta a la versión WebP a partir de la ruta original
- Intentan obtener la URL de la imagen WebP
- Si no está disponible, recurren a la imagen original

## Componente OptimizedImage

El componente utiliza el patrón `<picture>` para maximizar la compatibilidad:

```tsx
export function OptimizedImage({ s3Key, alt, className }: OptimizedImageProps) {
  const [sources, setSources] = useState<{ original: string | null; webp: string | null }>({ original: null, webp: null });

  useEffect(() => {
    if (!s3Key) return;

    const fetchUrls = async () => {
      const urls = await getResponsiveImageSources(s3Key);
      setSources(urls);
    };

    fetchUrls();
  }, [s3Key]);

  if (!sources.original) {
    return <div className={`placeholder ${className}`} />;
  }

  return (
    <picture>
      {sources.webp && <source srcSet={sources.webp} type="image/webp" />}
      <img src={sources.original} alt={alt} className={className} />
    </picture>
  );
}
```

## Gestión de Errores

El sistema incluye:
- Logging exhaustivo en la función Lambda
- Fallback a imágenes originales si la optimización falla
- Manejo de errores en los helpers de frontend

## Consideraciones de Implementación

### Modelos de Datos
Para cada modelo que use imágenes:
1. Usar campos como `photoKey` o `imageKey` (no URLs)
2. Asegurarse que el ID del registro esté disponible antes de subir imágenes

### Formularios
1. Crear primero el registro en la base de datos
2. Luego subir imágenes con los metadatos correctos
3. No es necesario actualizar manualmente el registro (Lambda lo hace)

### Visualización
1. Siempre usar el componente `OptimizedImage`
2. Pasar la clave S3 directamente, no la URL
