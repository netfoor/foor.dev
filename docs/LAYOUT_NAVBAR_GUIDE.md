# 🧩 Guía de Solución de Problemas de Layout y Navbar

Esta guía documenta problemas comunes y soluciones relacionadas con el layout principal, la navegación y el espacio del contenido en la aplicación.

## 📚 Tabla de Contenidos

1. [Problema: Contenido Oculto Bajo el Navbar](#problema-contenido-oculto-bajo-el-navbar)
2. [Estructura del Layout Principal](#estructura-del-layout-principal)
3. [Estilos Globales para Contenido](#estilos-globales-para-contenido)
4. [Mejores Prácticas](#mejores-prácticas)
5. [Soluciones a Problemas Comunes](#soluciones-a-problemas-comunes)

---

## 🚫 Problema: Contenido Oculto Bajo el Navbar

### Síntoma
El contenido principal de las páginas (como login, home, profile) aparece parcialmente oculto debajo de la barra de navegación fija, como si no tuviera suficiente espacio o padding en la parte superior.

### Causa Raíz
El navbar está configurado correctamente con `position: fixed`, `height: 60px` y `z-index: 1000`, pero:

1. **Aplicación incorrecta de clases CSS**: La clase `.main-content` se estaba aplicando en múltiples niveles, causando conflictos de padding
2. **Valores de padding inconsistentes**: El padding-top no coincidía exactamente con la altura del navbar
3. **Cálculos de altura incorrectos**: Los contenedores internos no estaban considerando la altura exacta del navbar

### Solución Implementada

1. **Alineación precisa del padding-top**: Se ajustó la clase `.main-content` para usar exactamente `pt-[60px]` (coincidiendo con la altura del navbar)
2. **Eliminación de duplicados**: Se eliminaron las clases duplicadas en componentes internos
3. **Cálculo correcto de alturas mínimas**: Se implementó `min-h-[calc(100vh-60px)]` para componentes que necesitan ocupar toda la altura disponible

---

## 🏗️ Estructura del Layout Principal

La aplicación utiliza una estructura clara para garantizar que el contenido siempre esté visible:

```jsx
// src/app/[locale]/layout.tsx
export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  
  return (
    <I18nProvider locale={locale as SupportedLocale}>
      <NavBar />
      <main className="main-content">
        {children}
      </main>
    </I18nProvider>
  );
}
```

Esta estructura asegura que:
1. El navbar está siempre fijo en la parte superior
2. Todo el contenido de la página se envuelve en un contenedor `main` con el padding-top adecuado
3. La clase CSS global `.main-content` maneja el espaciado correctamente

---

## 🎨 Estilos Globales para Contenido

Los estilos CSS globales definen clases específicas para manejar el espaciado del contenido principal:

```css
@layer components {
  /* Clase para el contenido principal debajo del navbar */
  .main-content {
    @apply pt-[60px] min-h-screen; /* Exactamente 60px para coincidir con la altura del navbar */
  }

  /* Variante para páginas que necesitan más espacio */
  .main-content-lg {
    @apply pt-[80px]; /* Más espacio para casos especiales */
  }
}
```

Esta implementación:
- Usa valores precisos para el padding-top que coinciden con la altura del navbar
- Proporciona una variante para casos que requieren más espacio
- Está implementada en una capa de componentes para evitar conflictos de especificidad

---

## 💡 Mejores Prácticas

### 1. Alineación de Valores Numéricos

Siempre alinear estas tres propiedades para evitar problemas de espaciado:
- La altura del navbar (`height: 60px` en `NavBar.tsx`)
- El padding-top del contenedor principal (`.main-content` en `globals.css`)
- Cualquier cálculo de altura basado en restar la altura del navbar (`min-h-[calc(100vh-60px)]`)

### 2. Evitar Duplicación de Clases

- No aplicar `.main-content` en componentes anidados
- El layout principal ya aplica esta clase al contenedor `<main>`
- Los componentes internos deben usar clases personalizadas para ajustes adicionales

### 3. Uso de Cálculos para Alturas Mínimas

Para componentes que necesitan ocupar toda la altura disponible:
```jsx
<Flex className="min-h-[calc(100vh-60px)]">
  {/* Contenido */}
</Flex>
```

### 4. Espaciado Visual vs. Estructural

- El padding-top de `.main-content` es estructural y debe coincidir exactamente con la altura del navbar
- Para espaciado visual adicional, agregar padding a los componentes internos:
```jsx
<Flex style={{ paddingTop: '2rem' }}>
  {/* Esto agrega espacio visual sin afectar la estructura */}
</Flex>
```

---

## 🛠️ Soluciones a Problemas Comunes

### Problema: Página de Login Oculta

**Síntoma:** La parte superior del formulario de login queda oculta bajo el navbar.

**Solución:**
```jsx
// Incorrecto
<Flex className="main-content">
  {/* Contenido del login */}
</Flex>

// Correcto
<Flex 
  className="min-h-[calc(100vh-60px)]" 
  style={{ paddingTop: '2rem' }}
>
  {/* Contenido del login */}
</Flex>
```

### Problema: Altura Variable del Navbar

**Síntoma:** El navbar cambia de altura en diferentes breakpoints, causando que el contenido se desplace.

**Solución:**
- Usar variables CSS para definir la altura del navbar
- Actualizar esas variables en media queries
- Referenciar las variables en los cálculos de altura y padding

### Problema: Layouts Anidados con Múltiples Barras

**Síntoma:** Layouts anidados (como el admin layout) tienen barras adicionales que ocupan espacio.

**Solución:**
- Para la barra principal: `position: fixed`
- Para barras secundarias: `position: sticky` con `top` igual a la altura de la barra principal
- Ajustar z-index adecuadamente para garantizar el orden correcto

---

## 📐 Resumen Técnico

### Valores Clave
- **Altura del Navbar:** `60px`
- **Padding Principal:** `pt-[60px]`
- **Z-Index del Navbar:** `1000`
- **Clase Principal:** `.main-content`

### Estructura Ideal
```
<NavBar /> <!-- position: fixed, height: 60px -->
<main className="main-content"> <!-- pt-[60px] -->
  <Componente /> <!-- No debe tener padding-top estructural -->
</main>
```

Esta arquitectura garantiza una experiencia de usuario consistente, sin contenido oculto y con un espaciado adecuado en todas las páginas de la aplicación.
