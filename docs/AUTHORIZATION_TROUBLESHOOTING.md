# Guía de Solución de Problemas de Autorización

## Error: "Unauthorized" al crear proyectos

### Problema
Los usuarios autenticados reciben errores "Unauthorized" al intentar crear, actualizar o eliminar proyectos, incluso después de iniciar sesión correctamente.

### Causa Principal
El usuario **no está en el grupo ADMINS** en Amazon Cognito. Las nuevas reglas de autorización requieren que los usuarios sean miembros del grupo "ADMINS" para realizar operaciones CRUD.

### Solución

#### 1. Verificar grupo ADMINS en Cognito

```bash
# Listar todos los grupos en el User Pool
aws cognito-idp list-groups --user-pool-id <USER_POOL_ID>

# Crear el grupo ADMINS si no existe
aws cognito-idp create-group \
  --user-pool-id <USER_POOL_ID> \
  --group-name ADMINS \
  --description "Administrators with full access"

# Agregar usuario al grupo ADMINS
aws cognito-idp admin-add-user-to-group \
  --user-pool-id <USER_POOL_ID> \
  --username <USERNAME_OR_EMAIL> \
  --group-name ADMINS
```

#### 2. Encontrar los IDs necesarios

```bash
# Obtener el User Pool ID desde amplify_outputs.json
cat amplify_outputs.json | grep -A 5 "user_pool_id"

# O directamente con jq
cat amplify_outputs.json | jq '.auth.user_pool_id'
```

#### 3. Verificar que el usuario está en el grupo

```bash
# Listar grupos del usuario
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id <USER_POOL_ID> \
  --username <USERNAME_OR_EMAIL>

# Listar usuarios en el grupo ADMINS
aws cognito-idp get-group \
  --user-pool-id <USER_POOL_ID> \
  --group-name ADMINS
```

### Reglas de Autorización Actuales

```typescript
// Todos los modelos ahora tienen estas reglas:
.authorization((allow) => [
  allow.guest().to(['read']),                    // Lectura pública
  allow.group('ADMINS').to(['create', 'read', 'update', 'delete'])  // Solo ADMINS pueden modificar
])
```

### Pasos de Verificación

1. **Usar el componente DebugUserPermissions** en `/admin/projects`
2. **Verificar la consola del navegador** para logs detallados
3. **Confirmar que el usuario está en el grupo ADMINS** en Cognito
4. **Limpiar cache del navegador** si es necesario
5. **Cerrar sesión y volver a iniciar** para refrescar tokens

### Comandos de Emergencia

Si necesitas acceso inmediato:

```bash
# Obtener User Pool ID
USER_POOL_ID=$(cat amplify_outputs.json | jq -r '.auth.user_pool_id')

# Obtener tu email/username
echo "Tu User Pool ID: $USER_POOL_ID"

# Crear grupo ADMINS
aws cognito-idp create-group \
  --user-pool-id $USER_POOL_ID \
  --group-name ADMINS \
  --description "Administrators with full access"

# Agregar tu usuario al grupo (reemplaza tu-email@ejemplo.com)
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username tu-email@ejemplo.com \
  --group-name ADMINS
```

### Verificación Final

Después de agregar el usuario al grupo ADMINS:

1. **Cerrar sesión** completamente de la aplicación
2. **Limpiar cache del navegador** (Ctrl+Shift+Delete)
3. **Volver a iniciar sesión**
4. **Probar crear un proyecto** de prueba

El error debería resolverse y verás "CREATE succeeded!" en el componente de debug.
