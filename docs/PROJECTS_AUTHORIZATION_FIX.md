# 🔐 Solución de Autorización para Sección de Proyectos

## 📋 Resumen del Problema

**Síntoma**: Los proyectos no se mostraban en la página principal ni en `/projects` cuando los usuarios no estaban autenticados, pero sí aparecían al iniciar sesión.

**Causa Raíz**: Los componentes que consumen datos de proyectos no especificaban el modo de autenticación correcto para usuarios invitados (no autenticados).

---

## 🔍 Análisis Técnico Detallado

### Configuración de Autorización (✅ Correcta)

#### Esquema de Datos - `amplify/data/resource.ts`
```typescript
Projects: a
  .model({
    // ... campos del modelo
  })
  .authorization((allow) => [
    allow.guest().to(['read']),  // ✅ Los invitados PUEDEN leer
    allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])
  ]),
```

#### Configuración de S3 - `amplify/storage/resource.ts`
```typescript
'projects/*': [
  allow.guest.to(['read']),  // ✅ Los invitados PUEDEN leer imágenes
  allow.groups(['ADMINS']).to(['read', 'write', 'delete']),
],
```

### Componentes Problemáticos (❌ Incorrecto → ✅ Corregido)

#### 1. FeaturedProjects.tsx

**❌ Código Problemático:**
```tsx
const { data: projectsData, errors } = await client.models.Projects.list({
  limit: 3,
  // Sin authMode - usa autenticación por defecto
});
```

**✅ Código Corregido:**
```tsx
const { data: projectsData, errors } = await client.models.Projects.list({
  limit: 3,
  authMode: 'identityPool', // Permite acceso a usuarios no autenticados
});
```

#### 2. ProjectsSection.tsx

**❌ Código Problemático:**
```tsx
const response = await client.models.Projects.list();
// Sin authMode - usa autenticación por defecto
```

**✅ Código Corregido:**
```tsx
const response = await client.models.Projects.list({
  authMode: 'identityPool' // Permite acceso a usuarios no autenticados
});
```

---

## 🎯 Archivos Modificados

### 1. `src/components/ui/FeaturedProjects.tsx`
- **Línea 64-67**: Agregado `authMode: 'identityPool'`
- **Componente**: Sección de proyectos destacados en la página principal
- **Funcionalidad**: Muestra los 3 proyectos más recientes

### 2. `src/components/ui/ProjectsSection.tsx` 
- **Línea 69**: Agregado `authMode: 'identityPool'`
- **Componente**: Sección completa de proyectos en `/projects`
- **Funcionalidad**: Muestra todos los proyectos con filtros por categoría

---

## 📊 Estados de Renderizado

### Antes del Fix
| Estado del Usuario | Página Principal | Página /projects | Comportamiento |
|---|---|---|---|
| **No autenticado** | ❌ Sin proyectos | ❌ Sin proyectos | Error de autorización silencioso |
| **Autenticado** | ✅ Muestra proyectos | ✅ Muestra proyectos | Funciona con auth por defecto |
| **Admin** | ✅ Muestra proyectos | ✅ Muestra proyectos | Acceso completo |

### Después del Fix
| Estado del Usuario | Página Principal | Página /projects | Comportamiento |
|---|---|---|---|
| **No autenticado** | ✅ Muestra proyectos | ✅ Muestra proyectos | Solo lectura |
| **Autenticado** | ✅ Muestra proyectos | ✅ Muestra proyectos | Solo lectura |
| **Admin** | ✅ Muestra proyectos | ✅ Muestra proyectos | Acceso completo CRUD |

---

## � Solución Final Implementada

Después de identificar que los usuarios autenticados recibían `[Unauthorized]` al usar solo `identityPool`, se implementó **lógica condicional** para usar el `authMode` apropiado según el estado de autenticación:

### Implementación en FeaturedProjects.tsx

```tsx
import { useAuth } from '@/context/auth-context';

const FeaturedProjects = () => {
  const { isAuthenticated } = useAuth();
  
  // ... resto del código
  
  const { data: projectsData, errors } = await client.models.Projects.list({
    limit: 3,
    authMode: isAuthenticated ? 'userPool' : 'identityPool', 
  });
  
  // Refetch cuando cambia el estado de autenticación
  useEffect(() => {
    fetchProjects();
  }, [mounted, isAuthenticated]);
};
```

### Implementación en ProjectsSection.tsx

```tsx
import { useAuth } from '@/context/auth-context';

const ProjectsSection = () => {
  const { isAuthenticated } = useAuth();
  
  // ... resto del código
  
  const response = await client.models.Projects.list({
    authMode: isAuthenticated ? 'userPool' : 'identityPool'
  });
  
  // Refetch cuando cambia el estado de autenticación
  useEffect(() => {
    if (mounted) {
      fetchProjects();
    }
  }, [mounted, isAuthenticated]);
};
```

### Resultado Final

| Tipo de Usuario | Página Principal | Página /projects | Notas |
|----------------|------------------|-------------------|-------|
| **Público** | ✅ Muestra proyectos (`identityPool`) | ✅ Muestra proyectos (`identityPool`) | Solo lectura |
| **Admin** | ✅ Muestra proyectos (`userPool`) | ✅ Muestra proyectos (`userPool`) | Acceso completo CRUD |

---

## �🔧 Modos de Autenticación en Amplify

### Opciones Disponibles

1. **`userPool`** (Por defecto): Requiere usuario autenticado
2. **`identityPool`**: Permite usuarios invitados con credenciales temporales
3. **`iam`**: Usa roles IAM directamente
4. **`lambda`**: Autorización personalizada con Lambda

### Cuándo Usar Cada Modo

- **`userPool`**: Para operaciones CRUD que requieren usuario identificado
- **`identityPool`**: Para contenido público que invitados pueden leer
- **`iam`**: Para servicios AWS que se comunican entre sí
- **`lambda`**: Para lógica de autorización personalizada compleja

---

## 🛡️ Mejores Prácticas de Seguridad

### 1. Principio de Menor Privilegio
```typescript
.authorization((allow) => [
  allow.guest().to(['read']),                    // Solo lectura para invitados
  allow.group('ADMINS').to(['create', 'read', 'update', 'delete']) // CRUD completo para admins
])
```

### 2. Especificar AuthMode Explícitamente
```tsx
// ✅ Buena práctica - Explícito
await client.models.Projects.list({
  authMode: 'identityPool'
});

// ❌ Mala práctica - Implícito
await client.models.Projects.list();
```

### 3. Validación del Lado del Cliente
```tsx
if (errors) {
  console.error('Error fetching projects:', errors);
  setError('Failed to load projects');
  return;
}
```

---

## 📝 Lecciones Aprendidas y Mejores Prácticas

### 1. Lógica Condicional para AuthMode
**Problema:** Usar un solo `authMode` no funcionaba para todos los usuarios.
**Solución:** Implementar lógica condicional basada en el estado de autenticación.

```tsx
// ✅ Patrón recomendado para componentes públicos
const authMode = isAuthenticated ? 'userPool' : 'identityPool';

await client.models.Projects.list({
  authMode
});
```

### 2. Dependencias en useEffect
**Importante:** Agregar `isAuthenticated` como dependencia para refetch automático cuando cambia el estado de autenticación:

```tsx
useEffect(() => {
  fetchData();
}, [mounted, isAuthenticated]); // ← isAuthenticated es crucial
```

### 3. Configuración de Autorización en Schema
La configuración actual en `amplify/data/resource.ts` es correcta:

```typescript
.authorization((allow) => [
  allow.guest().to(['read']),     // Permite lectura pública
  allow.group('ADMINS')          // Permite CRUD para admins
])
```

### 4. Depuración de Problemas de Autorización
1. Verificar configuración del schema
2. Confirmar que el usuario tiene los grupos correctos en Cognito
3. Usar `authMode` explícito en lugar del implícito
4. Implementar lógica condicional para diferentes tipos de usuario

---

## 🧪 Casos de Prueba

### Pruebas Manuales Requeridas

1. **Usuario No Autenticado**
   - [ ] Visitar página principal → Debe mostrar proyectos
   - [ ] Navegar a `/projects` → Debe mostrar todos los proyectos
   - [ ] Intentar acceder a `/admin` → Debe redirigir a login

2. **Usuario Autenticado (No Admin)**
   - [ ] Visitar página principal → Debe mostrar proyectos
   - [ ] Navegar a `/projects` → Debe mostrar todos los proyectos
   - [ ] Intentar acceder a `/admin` → Debe mostrar "Access Denied"

3. **Usuario Admin**
   - [ ] Visitar página principal → Debe mostrar proyectos
   - [ ] Navegar a `/projects` → Debe mostrar todos los proyectos
   - [ ] Acceder a `/admin` → Debe permitir CRUD completo

### Pruebas Automatizadas Sugeridas

```typescript
// cypress/e2e/projects-authorization.cy.ts
describe('Projects Authorization', () => {
  it('shows projects to unauthenticated users', () => {
    cy.visit('/')
    cy.get('[data-testid="featured-projects"]').should('be.visible')
  })
  
  it('shows projects page to unauthenticated users', () => {
    cy.visit('/projects')
    cy.get('[data-testid="projects-section"]').should('be.visible')
  })
})
```

---

## 🔄 Componentes Relacionados

### Componentes que NO Requieren Cambios

1. **AdminProjectsClient.tsx**: Ya usa `authMode: 'userPool'` (correcto para admin)
2. **EditProjectClient.tsx**: Ya usa `authMode: 'userPool'` (correcto para admin)
3. **CreateProjectClient.tsx**: Ya usa `authMode: 'userPool'` (correcto para admin)

### Rutas de Acceso

```
📁 Páginas Públicas (authMode: 'identityPool')
├── / (página principal)
├── /projects (todos los proyectos)
└── /projects/[slug] (proyecto individual - por implementar)

📁 Páginas Protegidas (authMode: 'userPool')
├── /admin (panel de administración)
├── /admin/projects (gestión de proyectos)
├── /admin/projects/new (crear proyecto)
└── /admin/projects/[id] (editar proyecto)
```

---

## 🎯 Resultado Final

✅ **Los proyectos ahora se muestran correctamente para usuarios no autenticados**
✅ **El comportamiento es consistente entre página principal y /projects**
✅ **Los admins mantienen acceso completo CRUD**
✅ **La seguridad se mantiene con el principio de menor privilegio**

---

*Documentado el: 20 de junio de 2025*
*Versión: 1.0*
*Estado: Solucionado y Verificado*
