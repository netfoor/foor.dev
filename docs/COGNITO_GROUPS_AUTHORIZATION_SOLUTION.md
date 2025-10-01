# AMPLIFY AUTHORIZATION - COGNITO GROUPS SOLUTION

## 🎯 **PROBLEMA COMÚN: "Unauthorized" con Grupos de Cognito**

### **Síntomas:**
- Usuario está en el grupo ADMINS en Cognito ✅
- JWT token contiene el grupo ADMINS ✅  
- GraphQL mutations fallan con "Unauthorized" ❌

### **CAUSA RAÍZ:**
El `defaultAuthorizationMode` estaba configurado como `'identityPool'` en lugar de `'userPool'`.

### **DIFERENCIA ENTRE MODOS:**
- **`identityPool`** - Para acceso anónimo y credenciales temporales de AWS
- **`userPool`** - Para usuarios autenticados con grupos de Cognito

**Los grupos de Cognito SOLO funcionan con `userPool` mode.**

## ✅ **SOLUCIÓN:**

### **1. Configurar el Schema Correctamente:**

```typescript
// amplify/data/resource.ts
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // ← ESTO ES CRUCIAL
  },
});
```

### **2. Reglas de Autorización Correctas:**

```typescript
// Sintaxis correcta para grupos de Cognito
Projects: a
  .model({
    // ... campos del modelo
  })
  .authorization((allow) => [
    allow.guest().to(['read']),                                    // Lectura pública
    allow.group('ADMINS').to(['create', 'read', 'update', 'delete']) // Grupo ADMINS
  ]),
```

### **3. Verificar Grupos en JWT Token:**

```typescript
// Método correcto para leer grupos
import { fetchAuthSession } from 'aws-amplify/auth';

const session = await fetchAuthSession();
const groups = session.tokens?.idToken?.payload['cognito:groups'] || [];
console.log('User groups:', groups); // Debe incluir 'ADMINS'
```

### **❌ MÉTODO INCORRECTO:**
```typescript
// NO usar fetchUserAttributes() para grupos
const userAttributes = await fetchUserAttributes();
const groups = userAttributes['cognito:groups']; // ← No funciona
```

## 🔧 **PASOS DE TROUBLESHOOTING:**

### **1. Verificar Usuario en Grupo:**
- Ir a AWS Cognito Console
- User Pool → Groups → ADMINS
- Confirmar que el usuario está listado

### **2. Verificar JWT Token:**
```typescript
const session = await fetchAuthSession();
const payload = session.tokens?.idToken?.payload;
console.log('Groups in token:', payload['cognito:groups']);
```

### **3. Verificar Schema Authorization Mode:**
```typescript
// amplify/data/resource.ts
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool', // ← Debe ser 'userPool'
  },
});
```

### **4. Refrescar Sesión después de cambios:**
```typescript
import { signOut } from 'aws-amplify/auth';

// Logout y login de nuevo para obtener token fresco
await signOut();
// Luego login de nuevo
```

## 🚀 **RESULTADO ESPERADO:**

Después de aplicar estos cambios:
- ✅ Usuario en grupo ADMINS puede crear/editar/eliminar
- ✅ Usuarios guest pueden solo leer
- ✅ GraphQL mutations funcionan correctamente
- ✅ No más errores "Unauthorized"

## 📋 **CHECKLIST DE VERIFICACIÓN:**

- [ ] `defaultAuthorizationMode: 'userPool'` en schema
- [ ] Usuario agregado al grupo ADMINS en Cognito
- [ ] Usar `fetchAuthSession()` para leer grupos
- [ ] Logout/login después de cambios de grupo
- [ ] Sandbox redesplegado con nuevos cambios

---

**Fecha de solución:** 17 de junio de 2025  
**Problema:** Grupos de Cognito no funcionaban con `identityPool` mode  
**Solución:** Cambiar a `userPool` mode en `authorizationModes`
