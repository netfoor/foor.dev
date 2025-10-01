# Patrones y Mejores Prácticas para Formularios Complejos

## 📋 Resumen

Este documento establece patrones y mejores prácticas derivados de la resolución del problema de file upload reset, aplicables a todas las futuras implementaciones de formularios en el proyecto.

## 🏗️ Arquitectura Recomendada para Formularios

### Jerarquía Estable de Componentes

```
AuthGuardStable (verificación única)
└── FormLayoutWrapper (memoizado)
    └── FormComponent (React.memo)
        ├── FileUploadComponents (aislados)
        ├── TextInputs (estables)
        └── SubmitLogic (callbacks optimizados)
```

### Template Base para Nuevos Formularios

```tsx
'use client';

import React, { useState, useCallback, memo } from 'react';

// Interfaces
interface FormData {
  // Define tu estructura de datos aquí
}

// Componente principal (sin export default)
function NewFormComponent(): React.JSX.Element {
  // Estados
  const [formData, setFormData] = useState<FormData>({
    // Estado inicial
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Handlers optimizados con useCallback
  const handleInputChange = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    // Validaciones
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large');
      return;
    }
    
    setFiles(prev => [...prev, file]);
    setError('');
  }, []);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      // Lógica de submit
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, files]);

  // Render
  return (
    <form onSubmit={handleSubmit}>
      {/* Contenido del formulario */}
    </form>
  );
}

// Memoización OBLIGATORIA para formularios complejos
const NewFormComponentMemo = memo(NewFormComponent);
NewFormComponentMemo.displayName = 'NewFormComponent';

export default NewFormComponentMemo;
```

## 🛡️ Patrones de AuthGuard

### Cuándo Usar Cada Tipo

#### AuthGuardStable (Recomendado para Admin)
```tsx
// Para secciones admin con formularios complejos
<AuthGuardStable role="admin" redirectTo="/login">
  <ComplexFormComponent />
</AuthGuardStable>
```

**Usar cuando:**
- Formularios con file uploads
- Componentes con estado complejo
- Secciones admin críticas

#### AuthGuard Original
```tsx
// Solo para páginas simples sin formularios complejos
<AuthGuard role="user" redirectTo="/login">
  <SimpleDisplayComponent />
</AuthGuard>
```

**Usar cuando:**
- Páginas de solo lectura
- Componentes sin estado complejo
- Navegación simple

### Implementación de AuthGuardStable

```tsx
// Template para crear nuevos AuthGuards específicos
'use client';

import React, { useEffect, useState, useRef } from 'react';

export function AuthGuardSpecific({
  children,
  role = 'user',
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const [authResult, setAuthResult] = useState({
    status: 'loading',
    initialCheckDone: false
  });
  
  const hasRedirectedRef = useRef(false);

  // Verificación única - NUNCA re-evaluar
  useEffect(() => {
    if (!authResult.initialCheckDone && !isLoading) {
      const isAuthorized = isAuthenticated && hasRole(role);
      
      setAuthResult({
        status: isAuthorized ? 'authorized' : 'unauthorized',
        initialCheckDone: true
      });
      
      if (!isAuthorized && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        // Redirección única
      }
    }
  }, [isLoading, isAuthenticated, hasRole, role, authResult.initialCheckDone]);

  // Estados de renderizado
  if (!authResult.initialCheckDone) return <LoadingComponent />;
  if (authResult.status === 'unauthorized') return <RedirectingComponent />;
  
  return <>{children}</>;
}
```

## 📁 Patrones de File Upload

### FileUploadInput Estándar

```tsx
'use client';

import React, { useRef, useCallback } from 'react';

interface FileUploadProps {
  onFileSelect?: (file: File) => void;
  onMultipleFilesSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en bytes
  children: React.ReactNode;
}

export const FileUploadInput: React.FC<FileUploadProps> = ({
  onFileSelect,
  onMultipleFilesSelect,
  accept = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  children
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validaciones
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds size limit`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length > 0) {
      if (multiple && onMultipleFilesSelect) {
        onMultipleFilesSelect(validFiles);
      } else if (!multiple && onFileSelect) {
        onFileSelect(validFiles[0]);
      }
    }
    
    // CRÍTICO: Reset del input
    event.target.value = '';
  }, [onFileSelect, onMultipleFilesSelect, multiple, maxSize]);

  return (
    <div style={{ position: 'relative', display: 'block' }}>
      {children}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'pointer'
        }}
      />
    </div>
  );
};
```

### Handlers de Archivo Optimizados

```tsx
// Pattern para manejar archivos con preview
const handleFileWithPreview = useCallback((file: File) => {
  // Validaciones inmediatas
  if (file.size > MAX_SIZE) {
    setError(`File too large: ${file.name}`);
    return;
  }
  
  if (!ALLOWED_TYPES.includes(file.type)) {
    setError(`Invalid file type: ${file.type}`);
    return;
  }
  
  // Actualizar estado del archivo
  setSelectedFile(file);
  
  // Generar preview
  const reader = new FileReader();
  reader.onload = (e) => {
    setPreview(e.target?.result as string);
  };
  reader.onerror = () => {
    setError('Error reading file');
  };
  reader.readAsDataURL(file);
  
  // Limpiar errores
  setError('');
}, []);

// Pattern para múltiples archivos
const handleMultipleFiles = useCallback((files: File[]) => {
  const validFiles = files.filter(file => {
    // Validaciones individuales
    return file.size <= MAX_SIZE && ALLOWED_TYPES.includes(file.type);
  });
  
  if (existingFiles.length + validFiles.length > MAX_FILES) {
    setError(`Maximum ${MAX_FILES} files allowed`);
    return;
  }
  
  setExistingFiles(prev => [...prev, ...validFiles]);
  
  // Generar previews asíncronamente
  validFiles.forEach((file, index) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviews(prev => [...prev, e.target?.result as string]);
    };
    reader.readAsDataURL(file);
  });
}, [existingFiles.length]);
```

## 🔄 Patrones de Estado y Callbacks

### Estados Optimizados

```tsx
// Agrupa estados relacionados
const [formState, setFormState] = useState({
  data: initialFormData,
  isLoading: false,
  error: '',
  isDirty: false
});

// Estados de archivos separados
const [fileState, setFileState] = useState({
  mainImage: null as File | null,
  gallery: [] as File[],
  previews: [] as string[]
});

// Helpers para actualizar estado
const updateFormData = useCallback((updates: Partial<FormData>) => {
  setFormState(prev => ({
    ...prev,
    data: { ...prev.data, ...updates },
    isDirty: true
  }));
}, []);

const setLoading = useCallback((loading: boolean) => {
  setFormState(prev => ({ ...prev, isLoading: loading }));
}, []);

const setError = useCallback((error: string) => {
  setFormState(prev => ({ ...prev, error }));
}, []);
```

### Callbacks Estables

```tsx
// Pattern para callbacks complejos
const handleComplexOperation = useCallback(async (data: ComplexData) => {
  setLoading(true);
  setError('');
  
  try {
    // Validaciones previas
    const validationError = validateData(data);
    if (validationError) {
      throw new Error(validationError);
    }
    
    // Operación principal
    const result = await performOperation(data);
    
    // Actualizar estado en éxito
    updateFormData(result);
    
    return result;
  } catch (err) {
    setError(err.message);
    throw err; // Re-throw para que el caller pueda manejar
  } finally {
    setLoading(false);
  }
}, [updateFormData, setLoading, setError]);

// Pattern para submit con archivos
const handleSubmitWithFiles = useCallback(async (event: React.FormEvent) => {
  event.preventDefault();
  
  if (formState.isLoading) return; // Prevenir doble submit
  
  setLoading(true);
  
  try {
    // 1. Validar datos del formulario
    const validationErrors = validateFormData(formState.data);
    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join(', '));
    }
    
    // 2. Subir archivos primero
    const fileUploadResults = await uploadFiles(fileState);
    
    // 3. Crear record con referencias a archivos
    const result = await createRecord({
      ...formState.data,
      ...fileUploadResults
    });
    
    // 4. Navegación o feedback de éxito
    onSuccess?.(result);
    
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [formState, fileState, onSuccess]);
```

## 🧪 Patrones de Testing y Debugging

### Logs Estándar para Debugging

```tsx
// Al inicio de componentes críticos
console.log(`🔄 ${ComponentName} render`, { propsChanged: /* detectar cambios */ });

// En file handlers
console.log('📁 File operation:', { 
  action: 'select|upload|remove', 
  fileName: file?.name, 
  fileSize: file?.size 
});

// En cambios de estado importantes
console.log('🔧 State update:', { 
  component: ComponentName,
  field: fieldName,
  oldValue: /* valor anterior */,
  newValue: /* nuevo valor */
});

// En errores
console.error('❌ Error in component:', { 
  component: ComponentName,
  operation: 'operation name',
  error: err.message,
  context: /* contexto relevante */
});
```

### Debugging Helpers

```tsx
// Hook para detectar por qué se re-renderiza un componente
const useWhyDidYouUpdate = (name: string, props: Record<string, any>) => {
  const previous = useRef<Record<string, any>>();
  
  useEffect(() => {
    if (previous.current) {
      const changedProps: Record<string, any> = {};
      Object.keys(props).forEach(key => {
        if (previous.current![key] !== props[key]) {
          changedProps[key] = {
            from: previous.current![key],
            to: props[key]
          };
        }
      });
      
      if (Object.keys(changedProps).length > 0) {
        console.log('🔍 Props changed in', name, changedProps);
      }
    }
    
    previous.current = props;
  });
};

// Usar en componentes problemáticos
function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props);
  // ... resto del componente
}
```

### Test Patterns

```tsx
// Template para página de test aislada
export default function TestFormPage() {
  const [testState, setTestState] = useState({
    formData: {},
    selectedFiles: [],
    errors: []
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1>Test: {ComponentName}</h1>
      
      {/* Test del componente aislado */}
      <ComponentUnderTest
        onDataChange={(data) => setTestState(prev => ({ ...prev, formData: data }))}
        onFileSelect={(files) => setTestState(prev => ({ ...prev, selectedFiles: files }))}
        onError={(error) => setTestState(prev => ({ ...prev, errors: [...prev.errors, error] }))}
      />
      
      {/* Debug info */}
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5' }}>
        <h3>Debug State:</h3>
        <pre>{JSON.stringify(testState, null, 2)}</pre>
      </div>
    </div>
  );
}
```

## 🚀 Implementación para Futuras Secciones

### Checklist Pre-Desarrollo

#### Para Certificaciones Section
- [ ] Usar AuthGuardStable en el layout
- [ ] Memoizar componente principal con React.memo
- [ ] Implementar FileUploadInput para certificados PDF/imágenes
- [ ] Usar patrones de estado optimizados
- [ ] Crear página de test aislada

#### Para Skills Section
- [ ] Evaluar necesidad de file uploads (logos de tecnologías)
- [ ] Implementar React.memo si hay formularios complejos
- [ ] Usar callbacks estables para operaciones CRUD
- [ ] Considerar virtualization para listas largas de skills

#### Para Projects Gallery
- [ ] Implementar upload múltiple optimizado
- [ ] Usar lazy loading para imágenes
- [ ] Memoizar componentes de preview
- [ ] Implementar drag & drop con FileUploadInput

### Scripts de Verificación

```bash
# Verificar re-renders excesivos
npm run dev 2>&1 | grep -E "(render|state recalculated)" | wc -l

# Detectar loops de loading
npm run dev 2>&1 | grep "translation-loading" | head -20

# Verificar memory leaks en file uploads
# (usar Chrome DevTools -> Memory -> Record)
```

### Estructura de Archivos Recomendada

```
src/app/[locale]/admin/[section]/
├── layout.tsx                 # Usa AuthGuardStable
├── page.tsx                   # Lista/Dashboard
├── new/
│   ├── page.tsx              # Wrapper simple
│   ├── CreateComponent.tsx   # Memoizado, formulario principal
│   └── components/
│       ├── FileUpload.tsx    # File upload específico
│       ├── FormSections/     # Secciones del formulario
│       └── __test__/
│           └── TestPage.tsx  # Página de test aislada
└── [id]/
    ├── page.tsx              # Wrapper para editar
    └── EditComponent.tsx     # Memoizado, formulario de edición
```

## 🎯 Conclusiones

Estos patrones están diseñados para **prevenir** problemas similares al file upload reset, garantizando:

1. **Estabilidad de formularios** con React.memo y callbacks optimizados
2. **AuthGuards inmutables** que no interfieren con el estado de componentes
3. **File uploads robustos** con validación y manejo de errores
4. **Debugging efectivo** con logs estándar y herramientas de test

**Aplicar estos patrones en todas las futuras implementaciones garantizará una experiencia de usuario consistente y código mantenible.**

---

**Última actualización:** Junio 18, 2025  
**Versión:** 1.0  
**Estado:** ✅ Validado en producción
