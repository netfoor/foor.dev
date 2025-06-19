# Sistema de Gestión de Proyectos - Admin Panel

## Descripción

Sistema completo de gestión de proyectos con interfaz administrativa, integrado con AWS Amplify, que permite crear, editar, eliminar y gestionar proyectos con almacenamiento de imágenes en S3.

## Características Implementadas

### 🔧 Backend (AWS Amplify)

#### Modelo de Datos (amplify/data/resource.ts)
- **Modelo Projects** con campos completos:
  - Información básica: título, descripción, lugar
  - URLs: proyecto, GitHub, demo
  - Metadata: skills, categorías, fechas, estado
  - Almacenamiento S3: photoKey, galleryKeys
  - SEO: slug, metaDescription, tags
  - Configuración: featured, status (Draft/Published/Archived)

#### Storage Configuration (amplify/storage/resource.ts)
- **Bucket S3** configurado con carpetas organizadas:
  - `projects/*` - Imágenes principales de proyectos
  - `projects/gallery/*` - Galería de imágenes por proyecto
  - `projects/thumbnails/*` - Thumbnails (uso futuro)
  - `profiles/*` - Avatares y perfiles
  - `certifications/*` - Certificaciones
  - `private/{entity_id}/*` - Contenido privado por usuario

#### Autorización
- **Lectura pública**: Invitados pueden ver proyectos publicados
- **Escritura autenticada**: Solo usuarios autenticados pueden crear/editar
- **Owner-based**: Control granular por propietario

### 🎨 Frontend (Next.js + AWS Amplify UI)

#### Rutas Protegidas Implementadas

##### 1. `/[locale]/admin/projects` - Panel Principal
- **Componente**: `AdminProjectsClient.tsx`
- **Funcionalidades**:
  - Lista todos los proyectos del usuario
  - Estadísticas (Publicados, Borradores, Total)
  - Tabla responsive con información clave
  - Acciones: Ver, Editar, Eliminar
  - Botón "Nuevo Proyecto"

##### 2. `/[locale]/admin/projects/new` - Crear Proyecto
- **Componente**: `CreateProjectClient.tsx`
- **Funcionalidades**:
  - Formulario completo con validaciones
  - Upload de imagen principal (máx. 5MB)
  - Upload de galería (máx. 10 imágenes)
  - Gestión de skills y tags
  - Auto-generación de slug
  - Preview de imágenes
  - Integración completa con S3

##### 3. `/[locale]/admin/projects/[id]` - Editar Proyecto
- **Componente**: `EditProjectClient.tsx`
- **Funcionalidades**:
  - Carga datos existentes del proyecto
  - Edición de todos los campos
  - Gestión de imágenes existentes y nuevas
  - Eliminación de imágenes de S3
  - Actualización incremental
  - Preservación de URLs existentes

#### Componentes de Soporte

Los componentes de soporte incluyen utilidades de limpieza y gestión de archivos S3.

### 🔄 Integración AWS Amplify

#### Data API
```typescript
// Crear proyecto
const result = await client.models.Projects.create({...});

// Actualizar proyecto
const result = await client.models.Projects.update({...});

// Eliminar proyecto
const result = await client.models.Projects.delete({ id });

// Obtener proyecto
const result = await client.models.Projects.get({ id });

// Listar proyectos
const result = await client.models.Projects.list();
```

#### Storage API (S3)
```typescript
// Subir archivo
await uploadData({
  path: `projects/${key}`,
  data: file,
  options: { contentType: file.type }
}).result;

// Obtener URL
const url = await getUrl({ path: key });

// Eliminar archivo
await remove({ path: key });
```

### 🌐 Internacionalización

#### Traducciones Agregadas
- **English**: `/translations/en/admin.json`
- **Spanish**: `/translations/es/admin.json`
- **Japanese**: `/translations/ja/admin.json`

#### Claves de Traducción
```json
{
  "projects": {
    "title": "Projects",
    "create_project": "Create New Project",
    "edit_project": "Edit Project",
    "delete_project": "Delete Project",
    "manage_projects": "Manage Projects"
  }
}
```

### 🎨 Diseño y UX

#### Theme-Aware Components
- Soporte completo para modo claro/oscuro
- Colores dinámicos basados en tema
- Consistency con AWS Amplify UI

#### Responsive Design
- Optimizado para desktop, tablet y mobile
- Grids y flexbox responsive
- Imágenes adaptativas

#### Feedback Visual
- Loading states en todas las operaciones
- Alerts de éxito/error
- Progress indicators
- Confirmaciones de eliminación

### 🔒 Autenticación y Autorización

#### AuthGuard Integration
- Protección de rutas administrativas
- Redirección automática si no autenticado
- Layout específico para admin

#### Owner-Based Access
- Solo el propietario puede editar/eliminar
- Filtrado automático por usuario
- Seguridad a nivel de API

## Estructura de Archivos

```
src/app/[locale]/admin/projects/
├── page.tsx                     # Lista de proyectos
├── AdminProjectsClient.tsx      # Componente principal
├── new/
│   ├── page.tsx                 # Página crear proyecto
│   └── CreateProjectClient.tsx  # Formulario de creación
└── [id]/
    ├── page.tsx                 # Página editar proyecto
    └── EditProjectClient.tsx    # Formulario de edición

src/lib/utils/
└── s3-cleanup.ts                # Utilidad de limpieza S3

amplify/
├── data/
│   └── resource.ts              # Esquema de base de datos
└── storage/
    └── resource.ts              # Configuración S3

src/translations/
├── en/admin.json                # Traducciones inglés
├── es/admin.json                # Traducciones español
└── ja/admin.json                # Traducciones japonés
```

## Próximos Pasos

### 🚀 Implementaciones Futuras
1. **Optimización de Imágenes**:
   - Generación automática de thumbnails
   - Compresión de imágenes
   - CDN integration

2. **Features Avanzadas**:
   - Drag & drop para galería
   - Bulk operations
   - Filtros avanzados
   - Export/Import

3. **Analytics**:
   - Views por proyecto
   - Métricas de engagement
   - Dashboard de estadísticas

### 🧪 Testing

#### Flujo de Testing
1. Acceder a `/es/admin/projects`
2. Crear nuevo proyecto manualmente
3. Probar creación de nuevo proyecto
4. Probar edición de proyecto existente
5. Probar upload de imágenes
6. Verificar eliminación completa (DynamoDB + S3)

## Tecnologías Utilizadas

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: AWS Amplify UI React
- **Backend**: AWS Amplify Gen 2
- **Database**: DynamoDB
- **Storage**: S3
- **Auth**: Cognito
- **Deployment**: AWS Amplify Hosting

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Deploy sandbox
npx ampx sandbox

# Deploy producción
npx ampx pipeline-deploy --branch main

# Limpiar sandbox
npx ampx sandbox delete
```

## Documentación Relacionada

- [AWS Amplify Gen 2 Docs](https://docs.amplify.aws/react/)
- [Amplify UI React](https://ui.docs.amplify.aws/react)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Estado**: ✅ Implementación completa del CRUD de proyectos con S3 integration
**Última actualización**: Diciembre 2024
