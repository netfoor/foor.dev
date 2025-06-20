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
  showAfter = 400,
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
  if (!isVisible) return null;  return (
    <div
      className={`fixed z-50 scroll-to-top-button transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{
        bottom: 'clamp(1rem, 4vw, 1.5rem)',
        right: 'clamp(1rem, 4vw, 1.5rem)',
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
      }}
    >      <button
        onClick={scrollToTop}
        disabled={isScrolling}
        className="group relative"
        style={{
          width: 'clamp(48px, 12vw, 56px)',
          height: 'clamp(48px, 12vw, 56px)',
          borderRadius: '50%',
          padding: '0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',          backgroundColor: mode === 'dark' 
            ? 'hsl(213, 94%, 68%)' 
            : 'hsl(210, 96%, 45%)',
          border: mode === 'dark'
            ? '2px solid rgba(255, 255, 255, 0.1)'
            : '2px solid rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: mode === 'dark'
            ? '0 8px 32px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
            : '0 8px 32px rgba(59, 130, 246, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1)',          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: isScrolling ? 'wait' : 'pointer',
          transform: isScrolling ? 'scale(0.95)' : 'scale(1)',
          outline: 'none',
          fontFamily: 'inherit'
        }}
        onMouseEnter={(e) => {
          if (!isScrolling) {
            e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
            e.currentTarget.style.boxShadow = mode === 'dark'
              ? '0 12px 40px rgba(59, 130, 246, 0.4), 0 6px 20px rgba(0, 0, 0, 0.3)'
              : '0 12px 40px rgba(59, 130, 246, 0.3), 0 6px 20px rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isScrolling) {
            e.currentTarget.style.transform = 'scale(1) translateY(0)';
            e.currentTarget.style.boxShadow = mode === 'dark'
              ? '0 8px 32px rgba(59, 130, 246, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)'
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
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
          }}
        />        {/* Ícono */}
        <ChevronUp
          size={24}
          color="white"
          strokeWidth={2.5}
          className={`transition-transform duration-300 sm:scale-100 scale-90 ${
            isScrolling ? 'animate-bounce' : 'group-hover:scale-110'
          }`}
        />
        
        {/* Indicador de loading sutil */}
        {isScrolling && (
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30 animate-spin"
            style={{ borderWidth: '2px' }}
          />        )}
      </button>{/* Tooltip opcional - Solo visible en pantallas medianas y grandes */}
      <div
        className="absolute bottom-full right-0 mb-2 px-3 py-1 text-sm font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap hidden sm:block"
        style={{
          fontSize: '0.75rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
      >
        {t('scroll_to_top.tooltip')}
        <div
          className="absolute top-full right-4 w-0 h-0"
          style={{
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '4px solid #1F2937'
          }}
        />
      </div>
    </div>
  );
};

export default ScrollToTop;
