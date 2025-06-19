# 🚀 Referencia Rápida: Solución File Upload Reset

## ⚡ TL;DR - Solución Inmediata

Si experimentas **reset de formularios durante file uploads**, aplica esta solución:

### 1. Reemplazar AuthGuard
```tsx
// ❌ NO usar
import { AuthGuard } from '@/app/components/auth/AuthGuard';

// ✅ SÍ usar  
import { AuthGuard } from '@/app/components/auth/AuthGuardStable';
```

### 2. Memoizar Componente de Formulario
```tsx
import React, { memo } from 'react';

function MyFormComponent() {
  // ... lógica del formulario
}

// ✅ OBLIGATORIO para formularios complejos
const MyFormComponentMemo = memo(MyFormComponent);
export default MyFormComponentMemo;
```

### 3. Verificar en 30 Segundos
- El file upload debe funcionar sin resetear el formulario
- Los logs deben mostrar menos re-renders
- El preview de imagen debe aparecer correctamente

---

## 🔍 Diagnóstico Rápido

### Síntomas del Problema
- ✓ File input parece "no responder"
- ✓ Formulario se resetea al seleccionar archivos
- ✓ onChange se inicia pero nunca termina
- ✓ Múltiples logs de re-render en consola

### Causa Raíz
**Loop infinito:** AuthGuard ↔ I18nProvider ↔ CreateProjectClient

### Verificación Rápida
```bash
# Si ves esto en logs = PROBLEMA
🛡️ AuthGuard render (×50+ veces)
🔄 CreateProjectClient render (×50+ veces)
[i18n:translation-loading] (×50+ veces)
```

---

## 📋 Checklist de Implementación

### Para CUALQUIER formulario nuevo con file uploads:

#### ✅ Setup Básico
- [ ] Usar `AuthGuardStable` en el layout
- [ ] Memoizar componente principal con `React.memo`
- [ ] Usar `useCallback` para file handlers
- [ ] Implementar validación de archivos

#### ✅ Testing
- [ ] Crear página de test aislada (sin AuthGuard)
- [ ] Verificar que funciona en test antes de integrar
- [ ] Probar con diferentes tipos y tamaños de archivo
- [ ] Verificar que no hay re-renders excesivos

#### ✅ Debugging
- [ ] Agregar logs temporales si hay problemas
- [ ] Verificar jerarquía de providers
- [ ] Usar React DevTools para detectar re-renders
- [ ] Crear test de stress con múltiples archivos

---

## 🛠️ Templates Copy-Paste

### AuthGuardStable Template
```tsx
// src/app/components/auth/AuthGuardStable.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAuthorization, type UserRole } from '@/hooks/useAuthorization';
import { useRouter, usePathname } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

interface AuthGuardProps {
  children: React.ReactNode;
  role?: UserRole;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  role = 'user',
  fallback,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole } = useAuthorization();
  const router = useRouter();
  const pathname = usePathname();
  
  const [authResult, setAuthResult] = useState<{
    status: 'loading' | 'authorized' | 'unauthorized';
    initialCheckDone: boolean;
  }>({
    status: 'loading',
    initialCheckDone: false
  });
  
  const hasRedirectedRef = useRef(false);

  const getCurrentLocale = () => {
    const pathParts = pathname.split('/');
    return pathParts[1] || DEFAULT_LOCALE;
  };

  useEffect(() => {
    if (!authResult.initialCheckDone && !isLoading) {
      const isAuthorized = isAuthenticated && hasRole(role);
      
      setAuthResult({
        status: isAuthorized ? 'authorized' : 'unauthorized',
        initialCheckDone: true
      });
      
      if (!isAuthorized && !hasRedirectedRef.current) {
        hasRedirectedRef.current = true;
        const currentLocale = getCurrentLocale();
        const returnUrl = encodeURIComponent(pathname);
        const localizedRedirect = `/${currentLocale}${redirectTo}`;
        
        setTimeout(() => {
          router.push(`${localizedRedirect}?returnUrl=${returnUrl}`);
        }, 100);
      }
    }
  }, [isLoading, isAuthenticated, hasRole, role, authResult.initialCheckDone, pathname, redirectTo, router]);

  if (!authResult.initialCheckDone || authResult.status === 'loading') {
    return fallback || (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (authResult.status === 'unauthorized') {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-lg mb-4">Redirecting to login...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### Formulario Memoizado Template
```tsx
'use client';

import React, { useState, useCallback, memo } from 'react';
import { FileUploadInput } from './FileUploadInput';

// Interfaces
interface FormData {
  title: string;
  description: string;
  // ... otros campos
}

// Componente principal (SIN export default)
function CreateFormComponent(): React.JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: ''
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Handler para cambios en el formulario
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handler para file upload
  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large (max 5MB)');
      return;
    }
    
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.onerror = () => {
      setError('Error reading file');
    };
    reader.readAsDataURL(file);
    setError('');
  }, []);

  // Handler para submit
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      // Validaciones
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      // Upload file si existe
      let fileUrl = '';
      if (selectedFile) {
        // Lógica de upload
      }
      
      // Crear record
      // await createRecord({ ...formData, fileUrl });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, selectedFile]);

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
        />
      </div>
      
      <div>
        <label>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
        />
      </div>
      
      <div>
        <label>File Upload</label>
        <FileUploadInput onFileSelect={handleFileSelect}>
          <button type="button">Select File</button>
        </FileUploadInput>
        {preview && <img src={preview} alt="Preview" style={{maxWidth: '200px'}} />}
      </div>
      
      {error && <div style={{color: 'red'}}>{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
}

// ✅ OBLIGATORIO: Memoizar para evitar re-renders
const CreateFormComponentMemo = memo(CreateFormComponent);
CreateFormComponentMemo.displayName = 'CreateFormComponent';

export default CreateFormComponentMemo;
```

### FileUploadInput Template
```tsx
'use client';

import React, { useRef, useCallback } from 'react';

interface FileUploadInputProps {
  onFileSelect?: (file: File) => void;
  onMultipleFilesSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  children: React.ReactNode;
}

export const FileUploadInput: React.FC<FileUploadInputProps> = ({
  onFileSelect,
  onMultipleFilesSelect,
  accept = "image/*",
  multiple = false,
  children
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length > 0) {
      if (multiple && onMultipleFilesSelect) {
        onMultipleFilesSelect(files);
      } else if (!multiple && onFileSelect) {
        onFileSelect(files[0]);
      }
    }
    
    // CRÍTICO: Reset del input
    event.target.value = '';
  }, [onFileSelect, onMultipleFilesSelect, multiple]);

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

---

## 🚨 Errores Comunes y Soluciones

### Error 1: "onChange no se ejecuta"
```tsx
// ❌ MALO: Sin memoización
export default function MyForm() { ... }

// ✅ BUENO: Con memoización
const MyFormMemo = memo(MyForm);
export default MyFormMemo;
```

### Error 2: "Formulario se resetea constantemente"
```tsx
// ❌ MALO: AuthGuard original
import { AuthGuard } from '@/app/components/auth/AuthGuard';

// ✅ BUENO: AuthGuard estable
import { AuthGuard } from '@/app/components/auth/AuthGuardStable';
```

### Error 3: "Múltiples re-renders"
```tsx
// ❌ MALO: useCallback sin dependencias correctas
const handler = useCallback(() => { ... }, [state1, state2, state3]);

// ✅ BUENO: useCallback con dependencias mínimas
const handler = useCallback(() => { ... }, []); // Solo si no depende del estado
```

### Error 4: "File input no se resetea"
```tsx
// ❌ MALO: Sin reset
const handleChange = (event) => {
  // procesar archivos
  // NO resetear el input
};

// ✅ BUENO: Con reset
const handleChange = (event) => {
  // procesar archivos
  event.target.value = ''; // OBLIGATORIO
};
```

---

## 🎯 Para Implementaciones Futuras

### Certificaciones Section
```tsx
// Usar estos patterns para:
- Upload de certificados PDF
- Upload de logos de instituciones
- Formulario de nueva certificación
```

### Skills Section
```tsx
// Considerar para:
- Upload de logos de tecnologías
- Formulario de skill management
- Si hay imports masivos de skills
```

### Projects Gallery
```tsx
// Aplicar para:
- Upload múltiple de screenshots
- Formulario de nuevo proyecto
- Editor de proyecto existente
```

---

## 🔍 Debugging Rápido

### Si algo no funciona:
1. **Verificar logs**: ¿Hay re-renders excesivos?
2. **Crear test page**: ¿Funciona sin AuthGuard?
3. **Verificar memoización**: ¿Está el componente memoizado?
4. **Revisar providers**: ¿Qué está en la jerarquía?

### Logs esperados (BUENOS):
```
🔒 AuthGuardStable - Initial auth check: {isAuthenticated: true, ...}
🔄 CreateComponent render (solo 1-2 veces)
🎯 FileUploadInput onChange triggered
✅ File processed successfully
```

### Logs problemáticos (MALOS):
```
🛡️ AuthGuard render (×50+ veces) ← PROBLEMA
🔄 CreateComponent render (×50+ veces) ← PROBLEMA
[i18n:translation-loading] (loops infinitos) ← PROBLEMA
```

---

**✅ Solución validada y funcionando al 100%**  
**📅 Última verificación:** Junio 18, 2025  
**🎯 Aplicar estos patrones en TODAS las futuras implementaciones**
