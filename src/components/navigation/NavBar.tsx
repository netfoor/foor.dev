'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { View, Flex, Text, Button } from '@aws-amplify/ui-react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import LanguageSelector, { LanguageIndicator } from '@/components/ui/LanguageSelector';
import { useTheme } from '@/hooks/useTheme';
import { useTranslation, useLocalizedPath } from '@/lib/i18n/client';

// Define las rutas de navegación
const navLinks = [
  { href: '/about', key: 'about' },
  { href: '/projects', key: 'projects' },
  { href: '/certifications', key: 'certifications' },
  { href: '/skills', key: 'skills' },
  { href: '/contact', key: 'contact' }
];

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);  const pathname = usePathname();
  const { t } = useTranslation('common');
  const getLocalizedPath = useLocalizedPath();
  const [mounted, setMounted] = useState(false);

  // Agregar verificación para el contexto del tema
  let mode = 'light';
  let toggleMode = () => {};
  try {
    const themeContext = useTheme();
    mode = themeContext.mode;
    toggleMode = themeContext.toggleMode;
  } catch {
    console.warn('Theme context is not available. Defaulting to light mode.');
  }

  // Manejador de scroll para cambiar la apariencia de la barra de navegación
  const handleScroll = React.useCallback(() => {
    const scrollPosition = window.scrollY;
    setHasScrolled(scrollPosition > 20);
  }, []);

  // Configuración de oyentes de eventos
  useEffect(() => {
    // Marcar el componente como montado para prevenir problemas de hidratación
    setMounted(true);
    
    // Agregar oyentes de eventos para scroll
    window.addEventListener('scroll', handleScroll);
    
    // Verificación inicial de scroll
    handleScroll();
    
    // Limpieza al desmontar
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);
  // Cerrar menú cuando cambia la ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);
    // Use safe defaults for server-side rendering to prevent hydration mismatch
  const safeHasScrolled = mounted ? hasScrolled : false;
  const safeMode = mounted ? mode : 'light';

  // Return a minimal nav on server-side to prevent hydration issues
  if (!mounted) {
    return (
      <View
        as="nav"
        position="fixed"
        width="100%"
        top="0"
        left="0"
        right="0"
        height="60px"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          zIndex: 1000
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          padding="0 2rem"
          height="100%"
          maxWidth="1200px"
          margin="0 auto"
        >
          <Text fontWeight="700" fontSize="1.25rem" color="#F59E0B">
            foor.dev
          </Text>
        </Flex>
      </View>
    );
  }

  // Determinar colores basados en el modo
  const bgColor = safeMode === 'dark' ? 'var(--neutral-90)' : 'var(--neutral-10)';
  const textColor = safeMode === 'dark' ? 'var(--neutral-20)' : 'var(--neutral-80)';
  const accentColor = '#40AABF';
  
  return (
    <>      <View
        as="nav"
        ref={navRef}
        position="fixed"
        width="100%"
        top="0"
        left="0"
        right="0"
        height="60px"
        style={{
          backgroundColor: safeHasScrolled 
            ? (safeMode === 'dark' ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)') 
            : (safeMode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)'),
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: safeHasScrolled ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
          transition: 'background-color 0.3s, box-shadow 0.3s',
          zIndex: 1000
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <Flex
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          padding="0 2rem"
          height="100%"
          maxWidth="1200px"
          margin="0 auto"
        >          {/* Logo */}
          <Link 
            href={getLocalizedPath('/')} 
            aria-label="Go to homepage"
            style={{
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Flex
              direction="row"
              alignItems="center"
              gap="0.5rem"
              style={{
                transition: 'transform 0.3s',
              }}
              className="hover:scale-105"
            >              <Text
                fontWeight="700"
                fontSize="1.25rem"                style={
                  safeMode === 'dark' 
                    ? {
                        color: '#93C5FD', // Mismo color que la luna y hamburguesa en modo oscuro
                        textDecoration: 'none'
                      }
                    : {
                        backgroundImage: 'linear-gradient(135deg, #F59E0B, #FBBF24)', // Colores sol para modo claro
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        textDecoration: 'none'
                      }
                }
              >
                foor.dev
              </Text>
            </Flex>
          </Link>
          
          {/* Enlaces de navegación para escritorio */}
          <Flex
            direction="row"
            gap="1.5rem"
            display={{ base: 'none', medium: 'flex' }}
          >            {navLinks.map((link) => (
              <Link 
                key={link.key} 
                href={getLocalizedPath(link.href)}
                style={{
                  position: 'relative',
                  color: pathname === getLocalizedPath(link.href) ? accentColor : textColor,
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '0.5rem 0',
                  transition: 'color 0.3s'
                }}
              >
                <Text>
                  {t(link.key)}
                </Text>
                <div                  style={{
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: 0,
                    width: pathname === getLocalizedPath(link.href) ? '100%' : '0',
                    height: '2px',
                    backgroundImage: 'linear-gradient(135deg, #40AABF, #64D2E7)',
                    transition: 'width 0.3s'
                  }}
                />
              </Link>
            ))}
          </Flex>
            {/* Controles de navegación */}
          <Flex
            direction="row"
            alignItems="center"
            gap="0.5rem"
          >            {/* Selector de idioma - Solo en desktop */}
            <View display={{ base: 'none', medium: 'flex' }}>
              <LanguageSelector 
                mode={safeMode === 'dark' ? 'dark' : 'light'}
                compact={false}
              />
            </View>
              <ThemeToggle 
              size="md"
            />            {/* Selector de idioma móvil - Al lado del ThemeToggle */}
            <View display={{ base: 'flex', medium: 'none' }}>
              <LanguageIndicator 
                size={18} 
                mode={safeMode === 'dark' ? 'dark' : 'light'}
              />
            </View>

            {/* Botón de menú móvil - ESTILO TRANSPARENTE COMO THEME TOGGLE */}
            <View
              as="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              display={{ base: 'flex', medium: 'none' }}
              padding="0.5rem"
              backgroundColor="transparent"
              border="none"
              borderRadius="0.375rem"
              style={{
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1100,
                transition: 'all 0.2s ease'
              }}
            >              {isMenuOpen ? (
                // Ícono de cerrar (X) con colores temáticos
                <X 
                  size={24} 
                  color={safeMode === 'dark' ? '#93C5FD' : '#F59E0B'} 
                  style={{ 
                    transition: 'all 0.2s ease'
                  }}
                />
              ) : (
                // Ícono de menú hamburguesa
                <Menu 
                  size={24} 
                  color={safeMode === 'dark' ? '#93C5FD' : '#F59E0B'} 
                  style={{ 
                    transition: 'all 0.2s ease'
                  }}
                />
              )}
            </View>
          </Flex>
        </Flex>
      </View>
      
      {/* Navegación móvil */}
      {isMenuOpen && (
        <View
          ref={menuRef}
          id="mobile-menu"
          position="fixed"
          top="60px"
          left="0"
          right="0"
          bottom="0"
          overflow="auto"          style={{
            backgroundColor: safeMode === 'dark' 
              ? 'rgba(30, 41, 59, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            boxShadow: safeMode === 'dark' 
              ? '-5px 0 15px rgba(0, 0, 0, 0.2)' 
              : '-5px 0 15px rgba(0, 0, 0, 0.1)',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Flex
            direction="column"
            padding="2rem"
            gap="1.5rem"
            flex="1"
          >            {navLinks.map((link) => (
              <Link 
                key={link.key} 
                href={getLocalizedPath(link.href)}
                onClick={() => setIsMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  color: pathname === getLocalizedPath(link.href) ? accentColor : textColor,
                  textDecoration: 'none',
                  fontWeight: 500,
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  transition: 'all 0.3s',
                  marginBottom: '0.5rem',                  backgroundColor: pathname === getLocalizedPath(link.href) 
                    ? (safeMode === 'dark' ? 'rgba(64, 170, 191, 0.1)' : 'rgba(64, 170, 191, 0.1)') 
                    : 'transparent'
                }}
              >                <Text fontSize="1.125rem">
                  {t(link.key)}
                </Text>
              </Link>
            ))}          </Flex>
          
          {/* Selector de idioma en menú móvil */}
          <Flex
            direction="row"
            justifyContent="center"
            padding="1rem 2rem"
          >            <LanguageSelector 
              mode={safeMode === 'dark' ? 'dark' : 'light'}
              compact={false}
            />
          </Flex>
            
          {/* Redes sociales en el menú móvil */}
          <Flex
            direction="row"
            gap="2rem"
            padding="2rem"
            justifyContent="center"            style={{
              borderTop: safeMode === 'dark' 
                ? '1px solid rgba(255, 255, 255, 0.1)' 
                : '1px solid rgba(0, 0, 0, 0.1)'
            }}
          >
            <a href="https://instagram.com/foor.rm" target="_blank" rel="noopener noreferrer" aria-label={t('hero.social.instagram')}>
              <img
                src="https://img.icons8.com/3d-fluency/94/instagram-new.png"
                alt={t('hero.social.instagram')}
                width={32}
                height={32}
                style={{
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </a>
            <a href="mailto:fortino.rom@gmail.com" aria-label={t('hero.social.email')}>
              <img
                src="https://img.icons8.com/3d-fluency/94/gmail.png"
                alt={t('hero.social.email')}
                width={32}
                height={32}
                style={{
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </a>
            <a href="https://linkedin.com/in/fortino-romero-mantilla" target="_blank" rel="noopener noreferrer" aria-label={t('hero.social.linkedin')}>
              <img
                src="https://img.icons8.com/3d-fluency/94/linkedin--v2.png"
                alt={t('hero.social.linkedin')}
                width={32}
                height={32}
                style={{
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </a>
            <a href="https://github.com/netfoor" target="_blank" rel="noopener noreferrer" aria-label={t('hero.social.github')}>
              <img
                src="https://img.icons8.com/3d-fluency/94/github.png"
                alt={t('hero.social.github')}
                width={32}
                height={32}
                style={{
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </a>
          </Flex>
        </View>
      )}
    </>
  );
}

export default NavBar;
