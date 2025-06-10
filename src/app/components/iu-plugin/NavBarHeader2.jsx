'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import { getOverrideProps } from "@/utils/utils.js";
import { Flex, Icon, Text, Button, View, useTheme } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { ThemeToggle }  from "../../components/ThemeToggle";
import dynamic from 'next/dynamic';

// Dynamically import the AuthButtons component to avoid SSR issues with auth
const AuthButtons = dynamic(
  () => import('../AuthButtons'),
  { ssr: false }
);

export default function NavBarHeader2(props) {
  const { overrides, ...rest } = props;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const { tokens } = useTheme();

  // Track window size for responsive behavior
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
        if (window.innerWidth > 768) {
          setIsMenuOpen(false);
        }
      };
      
      // Set initial width
      setWindowWidth(window.innerWidth);
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, []);

  const isMobile = windowWidth < 768;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  return (
    <>
      {/* Main Navigation */}      <Flex
        gap="10px"
        direction="row"        width="100%"
        justifyContent="space-between"
        alignItems="center"
        overflow="visible"
        position="fixed"
        top="0"
        left="0"
        right="0"
        style={{ zIndex: 1000 }}
        boxShadow={tokens.shadows.small.value}
        padding={{
          base: "12px 16px",
          small: "14px 24px",
          medium: "16px 32px"
        }}
        backgroundColor={tokens.colors.background.secondary}
        className="navbar-main"
        {...getOverrideProps(overrides, "NavBarHeader2")}
        {...rest}
      >
        {/* Logo Section */}        <Flex
          gap="16px"
          direction="row"
          justifyContent="center"
          alignItems="center"
          shrink={0}
          position="relative"
          {...getOverrideProps(overrides, "Logo")}
        >
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Flex
              width={{
                base: "28px",
                medium: "34.55px"
              }}
              height={{
                base: "24px",
                medium: "30px"              }}
              shrink={0}
              position="relative"
              transition="transform 0.3s ease"
              _hover={{
                transform: "scale(1.1) rotate(5deg)"
              }}
              {...getOverrideProps(overrides, "Amplify Mark")}
            >
              <Icon
                width="100%"
                height="100%"
                viewBox={{"minX":0,"minY":0,"width":34.55172348022461,"height":30}}
                paths={[
                  {"d":"M21.4692 29.7592C21.5476 29.8948 21.6926 29.9784 21.8496 29.9784L25.2666 29.9784C25.6048 29.9784 25.8161 29.6131 25.647 29.3208L13.2346 7.86425C13.0656 7.572 12.6429 7.572 12.4738 7.86425C8.34493 15.0016 4.20619 22.1711 0.0594594 29.3425C-0.109529 29.6348 0.101807 30 0.439898 30L16.4449 30C16.783 30 16.9944 29.6347 16.8253 29.3424L15.1882 26.5124C15.1097 26.3768 14.9647 26.2932 14.8078 26.2932L6.62176 26.2932C6.45269 26.2932 6.34703 26.1106 6.43156 25.9644L12.6625 15.1933C12.7471 15.0472 12.9584 15.0472 13.0429 15.1933L21.4692 29.7592Z","fill":"rgba(64,170,191,1)","fillRule":"nonzero"},
                  {"d":"M15.1924 3.16491C15.1139 3.30055 15.1139 3.46765 15.1924 3.60329L30.3233 29.7592C30.4017 29.8948 30.5468 29.9784 30.7037 29.9784L34.1118 29.9784C34.45 29.9784 34.6613 29.6131 34.4922 29.3208L17.6572 0.219188C17.4882 -0.0730631 17.0655 -0.0730625 16.8964 0.219189L15.1924 3.16491Z","fill":"rgba(64,170,191,1)","fillRule":"nonzero"}
                ]}
                display="block"
                position="absolute"
                top="0%"
                bottom="0%"
                left="0%"
                right="0%"
                {...getOverrideProps(overrides, "Union")}
              />
            </Flex>
              {/* Brand Text */}
            <Text              fontFamily={tokens.fonts.default.variable.value}
              fontSize={{
                base: "18px",
                medium: "20px"
              }}
              fontWeight={700}
              color={tokens.colors.font.primary}
              display={{
                base: "none",
                small: "block"
              }}
              style={{
                background: "linear-gradient(135deg, rgba(64,170,191,1) 0%, rgba(100,210,231,1) 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              foor.dev
            </Text>
          </Link>
            {/* Mobile menu toggle button */}
          {isMobile && (
            <Button
              variation="link"
              onClick={toggleMenu}
              ariaLabel="Toggle menu"
              display={{ base: "flex", medium: "none" }}
              alignItems="center"
              justifyContent="center"
              width="44px"
              height="44px"
              borderRadius="8px"
              _hover={{
                backgroundColor: tokens.colors.background.primary
              }}
              {...getOverrideProps(overrides, "MenuToggle")}
            >
              <View>
                <Icon
                  viewBox={{ minX: 0, minY: 0, width: 24, height: 24 }}
                  paths={[
                    {
                      d: isMenuOpen ? "M18 6L6 18M6 6l12 12" : "M3 12h18M3 6h18M3 18h18",
                      stroke: "currentColor",
                      strokeWidth: "2",
                      strokeLinecap: "round",
                      strokeLinejoin: "round"
                    }
                  ]}
                  width="24px"
                  height="24px"
                />
              </View>
            </Button>
          )}
        </Flex>

        {/* Desktop Navigation */}
        <Flex
          gap="32px"
          direction="row"
          justifyContent="center"
          alignItems="center"
          display={{
            base: "none",
            medium: "flex"
          }}
          {...getOverrideProps(overrides, "DesktopNav")}
        >
          {[
            { href: "/about", label: "About" },
            { href: "/projects", label: "Projects" },
            { href: "/certifications", label: "Certifications" },
            { href: "/skills", label: "Skills" },
            { href: "/recognitions", label: "Recognitions" },
            { href: "/publications", label: "Publications" }
          ].map((link, index) => (
            <Link href={link.href} key={index} style={{ textDecoration: 'none' }}>              <Text
                fontFamily={tokens.fonts.default.variable.value}
                fontSize="16px"
                fontWeight={500}
                color={tokens.colors.font.primary}
                lineHeight="24px"
                position="relative"
                padding="8px 16px"
                borderRadius="8px"
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                cursor="pointer"
                className="nav-link"
                _hover={{
                  color: "rgba(64,170,191,1)",
                  backgroundColor: `color-mix(in srgb, rgba(64,170,191,1) 10%, transparent)`,
                  transform: "translateY(-2px)"
                }}
              >
                {link.label}
              </Text>
            </Link>
          ))}
        </Flex>

        {/* Action Buttons */}        <Flex
          gap="8px"
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          shrink={0}
          position="relative"
          {...getOverrideProps(overrides, "actions")}
        >
          <View marginRight="8px">
            <ThemeToggle />
          </View>
          
          {/* Authentication Buttons */}
          <AuthButtons />
          <Button
            shrink={0}
            size={{
              base: "small",
              medium: "default"
            }}            isDisabled={false}
            variation="primary"
            borderRadius="12px"
            style={{
              background: "linear-gradient(135deg, rgba(64,170,191,1) 0%, rgba(100,210,231,1) 100%)"
            }}
            transition="all 0.3s ease"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 8px 25px rgba(64,170,191,0.3)"
            }}
            {...getOverrideProps(overrides, "Button39493467")}
          >
            Sign up
          </Button>
        </Flex>
      </Flex>      {/* Mobile Navigation Overlay */}
      {isMobile && isMenuOpen && (
        <View          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0, 0, 0, 0.5)"
          style={{ zIndex: 999 }}
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Navigation Menu */}
      {isMobile && (        <Flex
          direction="column"
          position="fixed"
          top="0"
          right={isMenuOpen ? "0" : "-280px"}
          width="280px"
          height="100vh"
          backgroundColor={tokens.colors.background.secondary}
          boxShadow={tokens.shadows.large.value}
          style={{ zIndex: 1001 }}
          padding="80px 24px 24px"
          gap="8px"
          transition="right 0.3s ease"
          {...getOverrideProps(overrides, "MobileMenu")}
        >{[
            { href: "/about", label: "About", icon: "👨‍💻" },
            { href: "/projects", label: "Projects", icon: "🚀" },
            { href: "/certifications", label: "Certifications", icon: "🏆" },
            { href: "/skills", label: "Skills", icon: "⚡" },
            { href: "/recognitions", label: "Recognitions", icon: "🌟" },
            { href: "/publications", label: "Publications", icon: "📚" }
          ].map((link, index) => (
            <Link href={link.href} key={index} style={{ textDecoration: 'none', width: '100%' }}>
              <Flex
                alignItems="center"
                gap="16px"
                padding="16px 20px"
                borderRadius="8px"
                backgroundColor="transparent"
                cursor="pointer"
                _hover={{
                  backgroundColor: tokens.colors.background.primary
                }}
                onClick={toggleMenu}
              >
                <Text fontSize="20px">{link.icon}</Text>                <Text
                  fontFamily={tokens.fonts.default.variable.value}
                  fontSize="18px"
                  fontWeight={500}
                  color={tokens.colors.font.primary}
                >
                  {link.label}
                </Text>
              </Flex>
            </Link>
          ))}
            {/* Mobile Action Buttons */}
          <Flex
            direction="column"
            gap="12px"
            marginTop="32px"
          >
            {/* Mobile Auth Buttons */}
            <Flex
              direction="column"
              gap="12px"
              width="100%"
            >
              <AuthButtons />
            </Flex>
          </Flex>
        </Flex>
      )}

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <View height={{
        base: "72px",
        medium: "82px"
      }} />
    </>
  );
}