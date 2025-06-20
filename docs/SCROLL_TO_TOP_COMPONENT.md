# ScrollToTop Component

## Descripción

Componente minimalista "Scroll to Top" que proporciona una forma elegante y accesible para que los usuarios regresen rápidamente al inicio de la página. El componente está diseñado para integrarse perfectamente con el sistema de diseño de la aplicación.

## Características

- ✨ **Diseño minimalista** - Se adapta al tema claro/oscuro de la aplicación
- 🌐 **Soporte i18n** - Textos localizados en inglés, español y japonés
- 📱 **Totalmente responsivo** - Funciona perfectamente en todos los dispositivos
- ♿ **Accesible** - Cumple con estándares de accesibilidad web
- 🎨 **Animaciones suaves** - Transiciones fluidas y naturales
- ⚡ **Optimizado** - Throttling de scroll y animaciones con requestAnimationFrame
- 🎯 **Personalizable** - Props configurables para diferentes casos de uso

## Uso Básico

El componente ya está integrado en el layout principal de la aplicación (`[locale]/layout.tsx`), por lo que aparecerá automáticamente en todas las páginas.

```tsx
import ScrollToTop from '@/components/ui/ScrollToTop';

// Uso con configuración por defecto
<ScrollToTop />
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `showAfter` | `number` | `400` | Altura de scroll mínima (en pixels) para mostrar el botón |
| `scrollDuration` | `number` | `800` | Duración de la animación de scroll (en milisegundos) |
| `className` | `string` | `''` | Clases CSS adicionales |

## Ejemplos de Personalización

### Mostrar el botón más temprano
```tsx
<ScrollToTop showAfter={200} />
```

### Scroll más rápido
```tsx
<ScrollToTop scrollDuration={500} />
```

### Con estilos personalizados
```tsx
<ScrollToTop 
  className="custom-scroll-button" 
  showAfter={300}
  scrollDuration={600}
/>
```

## Integración con el Sistema de Temas

El componente se adapta automáticamente al tema activo de la aplicación:

- **Modo claro**: Colores vibrantes con sombras suaves
- **Modo oscuro**: Colores adaptados con mejor contraste

## Internacionalización

Las traducciones están disponibles en:

- **Inglés** (`en`): "Back to top"
- **Español** (`es`): "Volver al inicio"  
- **Japonés** (`ja`): "トップに戻る"

## Características Técnicas

### Optimizaciones de Rendimiento
- **Throttling de scroll**: Usa `requestAnimationFrame` para optimizar el rendimiento
- **Lazy rendering**: Solo se renderiza cuando es necesario
- **Smooth scrolling**: Implementación custom con curva de easing cubic-bezier

### Accesibilidad
- Etiquetas ARIA apropiadas
- Soporte para `prefers-reduced-motion`
- Navegación por teclado
- Alto contraste para visibilidad

### Responsividad
- Tamaño adaptativo usando `clamp()`
- Posicionamiento seguro con safe-area-inset
- Tooltip oculto en dispositivos móviles

## Estilos CSS

El componente incluye estilos CSS personalizados en `globals.css`:

```css
.scroll-to-top-button {
  z-index: 9999;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  /* Safe area para dispositivos con notch */
  @supports (bottom: env(safe-area-inset-bottom)) {
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
  }
}
```

## Solución de Problemas

### El botón no aparece
- Verifica que hay suficiente contenido en la página para hacer scroll
- Ajusta el valor de `showAfter` si es necesario

### Animaciones lentas en dispositivos móviles
- Reduce el valor de `scrollDuration`
- Las animaciones se desactivan automáticamente si el usuario tiene `prefers-reduced-motion` activado

### Conflictos de z-index
- El componente usa `z-index: 9999` por defecto
- Puedes ajustarlo con la clase `scroll-to-top-button` en CSS

## Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+

---

**Nota**: Este componente forma parte del sistema de diseño de la aplicación y mantiene consistencia visual con el resto de los componentes UI.
