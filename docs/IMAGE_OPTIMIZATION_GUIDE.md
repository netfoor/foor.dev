# Guía de Optimización de Imágenes

## Descripción General

Este sistema de optimización de imágenes utiliza AWS Lambda para convertir automáticamente las imágenes subidas a S3 a formato WebP, reduciendo significativamente el tamaño de los archivos y mejorando los tiempos de carga.

## Componentes Clave

### 1. Función Lambda de Optimización

La función Lambda (`imageOptimizationFunction`) se activa automáticamente cuando se sube una nueva imagen a S3. Esta función:

- Procesa la imagen original y la convierte a formato WebP
- Almacena la versión optimizada en una subcarpeta `/webp/`
- Actualiza automáticamente el registro correspondiente en DynamoDB con la ruta de la nueva imagen

### 2. Helper de Subida de Imágenes

El helper `uploadImageWithMetadata` en `src/lib/utils/image-helpers.ts` es esencial para subir correctamente las imágenes con los metadatos necesarios:

```typescript
uploadImageWithMetadata(
  file: File,               // El archivo a subir
  recordId: string,         // ID del registro en la base de datos
  modelName: string,        // Nombre del modelo en Amplify Data
  fieldName: string         // Nombre del campo que almacena la key
): Promise<string>          // Retorna la S3 key
```

Estos metadatos permiten a la función Lambda identificar qué registro debe actualizar después de procesar la imagen.

### 3. Componente OptimizedImage

El componente `OptimizedImage` en `src/components/optimitation/OptimizedImage.tsx` maneja la visualización de imágenes optimizadas:

```tsx
<OptimizedImage
  s3Key={s3KeyValue}
  alt="Texto alternativo"
  className="nombre-clase-css"
/>
```

Este componente:
- Intenta cargar la versión WebP de la imagen primero
- Si no está disponible, carga la imagen original como fallback
- Utiliza la etiqueta `<picture>` para permitir que el navegador elija el formato óptimo

## Patrón de Implementación

### Para Subir Imágenes

1. Primero crea el registro en la base de datos para obtener su ID
2. Usa `uploadImageWithMetadata` para subir la imagen con metadatos correctos
3. La función Lambda procesará automáticamente la imagen y actualizará el registro

```typescript
// 1. Crear el registro
const newRecord = await client.models.MiModelo.create({
  // ... campos básicos
});

// 2. Subir la imagen con metadatos
if (newRecord.data && imageFile) {
  const imageKey = await uploadImageWithMetadata(
    imageFile,
    newRecord.data.id,
    'MiModelo',
    'imageField'
  );
}
```

### Para Mostrar Imágenes

Reemplaza las etiquetas `<img>` con el componente `OptimizedImage`:

```tsx
// Antes:
{record.imageUrl && <img src={imageUrl} alt="Descripción" />}

// Después:
{record.imageKey && (
  <OptimizedImage
    s3Key={record.imageKey}
    alt="Descripción"
    className="clase-css-opcional"
  />
)}
```

## Beneficios

- **Mejor rendimiento**: Imágenes WebP son ~30% más pequeñas que JPEG o PNG
- **Experiencia mejorada**: Tiempos de carga más rápidos, especialmente en conexiones lentas
- **SEO mejorado**: La velocidad de carga de página es un factor de ranking
- **Compatibilidad universal**: Fallback automático para navegadores que no soportan WebP
