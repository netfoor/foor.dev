'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import { getOverrideProps } from "@/utils/utils.js";
import { Flex, Icon, Text, Button, View, useTheme } from '@aws-amplify/ui-react';
import Link from 'next/link';
import { ThemeToggle }  from "../../components/ThemeToggle";

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
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isMobile = windowWidth < 768;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
  <Flex
    gap="10px"
    direction="row"
    width="100%"
    justifyContent="space-between"
    alignItems="center"
    overflow="hidden"
    position="relative"
    boxShadow={tokens.shadows.small.value}
    padding={{
      base: "12px 16px",
      small: "14px 24px",
      medium: "16px 32px"
    }}
    backgroundColor={tokens.colors.background.secondary}
    {...getOverrideProps(overrides, "NavBarHeader2")}
    {...rest}
  >
    <Flex
      gap="16px"
      direction="row"
      justifyContent="center"
      alignItems="center"
      shrink="0"
      position="relative"
      {...getOverrideProps(overrides, "Logo")}
    >
      <Flex
        width={{
          base: "28px",
          medium: "34.55px"
        }}
        height={{
          base: "24px",
          medium: "30px"
        }}
        shrink="0"
        position="relative"
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
      
      {/* Mobile menu toggle button */}
      {isMobile && (
        <Button
          variation="link"
          onClick={toggleMenu}
          ariaLabel="Toggle menu"
          display={{ base: "block", medium: "none" }}
          {...getOverrideProps(overrides, "MenuToggle")}
        >
          <Icon
            width="24px"
            height="24px"
            viewBox={{ minX: 0, minY: 0, width: 24, height: 24 }}
            paths={[
              { d: isMenuOpen ? "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" : "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" },
            ]}
            color={tokens.colors.font.primary}
          />
        </Button>
      )}
    </Flex>

    {/* Navigation items - visible on desktop, conditionally visible on mobile */}
    <Flex
      gap={{
        base: "16px",
        medium: "32px"
      }}
      direction={{
        base: "column",
        medium: "row"
      }}
      justifyContent="center"
      alignItems={{
        base: "flex-start",
        medium: "center"
      }}
      position={{
        base: "absolute",
        medium: "relative"
      }}
      top={{
        base: isMenuOpen ? "56px" : "-100vh",
        medium: "auto"
      }}
      left={{
        base: "0",
        medium: "auto"
      }}
      right={{
        base: "0",
        medium: "auto"
      }}
      backgroundColor={{
        base: tokens.colors.background.secondary,
        medium: "transparent"
      }}
      padding={{
        base: isMenuOpen ? "16px" : "0",
        medium: "0"
      }}
      zindex="10"
      boxShadow={{
        base: isMenuOpen ? tokens.shadows.small.value : "none",
        medium: "none"
      }}
      transition="top 0.3s ease-in-out"
      display={{
        base: isMenuOpen ? "flex" : "none",
        medium: "flex"
      }}
      {...getOverrideProps(overrides, "Frame 5")}
    >
      {[
        { href: "/about", label: "About" },
        { href: "/projects", label: "Projects" },
        { href: "/certifications", label: "Certifications" },
        { href: "/recognitions", label: "Recognitions" },
        { href: "/technologies", label: "Technologies & Tools" }
      ].map((link, index) => (
        <Link href={link.href} key={index} style={{ textDecoration: 'none' }}>
          <Text
            fontFamily={tokens.fonts.default.variable.value}
            fontSize={{
              base: "18px",
              medium: "16px"
            }}
            fontWeight="400"
            color={tokens.colors.font.primary}  // Usar directamente el token
            lineHeight="24px"
            textAlign="left"
            display="block"
            shrink="0"
            position="relative"
            whiteSpace="pre-wrap"
            padding={{
              base: "8px 0",
              medium: "0"
            }}
            cursor="pointer"
            _hover={{
              color: tokens.colors.font.secondary
            }}
          >
            {link.label}
          </Text>
        </Link>
      ))}
    </Flex>

    {/* Buttons - visible on desktop, conditionally visible on mobile */}
    <Flex
      gap="8px"
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
      shrink="0"
      position="relative"
      display={{
        base: isMenuOpen ? "none" : "flex",
        medium: "flex"
      }}
      {...getOverrideProps(overrides, "actions")}
    >
      {/* ThemeToggle */}
      <View marginRight="8px">
        <ThemeToggle />
      </View>
      <Button
        shrink="0"
        size={{
          base: "small",
          medium: "default"
        }}
        isDisabled={false}
        variation="link"
        {...getOverrideProps(overrides, "Button39493466")}
      >
        Log in
      </Button>
      <Button
        shrink="0"
        size={{
          base: "small",
          medium: "default"
        }}
        isDisabled={false}
        variation="primary"
        {...getOverrideProps(overrides, "Button39493467")}
      >
        Sign up
      </Button>
    </Flex>
  </Flex>
  );
}