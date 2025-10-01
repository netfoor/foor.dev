'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation } from '@/lib/i18n/client';

interface ScrollToTopProps {
  /**
   * Altura de scroll mínima para mostrar el botón (en pixels)
   * @default 400
   */
  showAfter?: number;
  /**
   * Duración de la animación de scroll (en milisegundos)
   * @default 800
   */
  scrollDuration?: number;
  /**
   * Clases CSS adicionales
   */
  className?: string;
}

/**
 * Componente ScrollToTop - Botón flotante para volver al inicio de la página
 * Diseño minimalista que se adapta al tema de la aplicación
 */
export const ScrollToTop: React.FC<ScrollToTopProps> = ({
  showAfter = 200, // Cambiado de 400 a 200 para que aparezca más temprano
  scrollDuration = 800,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const { mode } = useTheme();
  const { t } = useTranslation('common');

  // Monitorear el scroll para mostrar/ocultar el botón
  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > showAfter);
    };

    // Agregar listener de scroll con throttling
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          toggleVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Verificar la posición inicial
    toggleVisibility();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfter]);

  // Función para scroll suave al inicio
  const scrollToTop = () => {
    if (isScrolling) return;
    
    setIsScrolling(true);
    const startPosition = window.pageYOffset;
    const startTime = performance.now();

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };

    const animateScroll = (currentTime: number) => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / scrollDuration, 1);
      
      const ease = easeInOutCubic(progress);
      const currentPosition = startPosition * (1 - ease);
      
      window.scrollTo(0, currentPosition);
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        setIsScrolling(false);
      }
    };

    requestAnimationFrame(animateScroll);
  };

  // No renderizar si no es visible
  if (!isVisible) return null;

  const primaryColor = mode === 'dark' ? '#60A5FA' : '#3B82F6'; // blue-400 y blue-500
  const hoverColor = mode === 'dark' ? '#93C5FD' : '#2563EB'; // blue-300 y blue-600
  return (
    <button
      onClick={scrollToTop}
      disabled={isScrolling}
      className={`fixed transition-all duration-300 ease-in-out group ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{
        bottom: '24px',
        right: '24px',
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        backgroundColor: primaryColor,
        border: 'none',
        boxShadow: mode === 'dark'
          ? '0 8px 32px rgba(96, 165, 250, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
          : '0 8px 32px rgba(59, 130, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)',
        cursor: isScrolling ? 'wait' : 'pointer',
        outline: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: isScrolling ? 'scale(0.95)' : 'scale(1)',
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
        zIndex: 9999,
        position: 'fixed'
      }}      onMouseEnter={(e) => {
        if (!isScrolling) {
          e.currentTarget.style.backgroundColor = hoverColor;
          e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'; // Menos agresivo
          e.currentTarget.style.boxShadow = mode === 'dark'
            ? '0 12px 40px rgba(96, 165, 250, 0.4), 0 6px 20px rgba(0, 0, 0, 0.3)'
            : '0 12px 40px rgba(59, 130, 246, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isScrolling) {
          e.currentTarget.style.backgroundColor = primaryColor;
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = mode === 'dark'
            ? '0 8px 32px rgba(96, 165, 250, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(59, 130, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)';
        }
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = '2px solid rgba(59, 130, 246, 0.6)';
        e.currentTarget.style.outlineOffset = '2px';
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = 'none';
      }}
      aria-label={t('scroll_to_top.button')}
      title={t('scroll_to_top.tooltip')}
    >
      {/* Efecto de ripple en hover */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
        }}
      />
      
      {/* Ícono */}
      <ChevronUp
        size={24}
        color="white"
        strokeWidth={2.5}
        className={`relative z-10 transition-transform duration-300 ${
          isScrolling ? 'animate-bounce' : 'group-hover:scale-110'
        }`}
      />
      
      {/* Indicador de loading sutil */}
      {isScrolling && (
        <div
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30 animate-spin"
          style={{ borderWidth: '2px' }}
        />
      )}
    </button>
  );
};

export default ScrollToTop;
