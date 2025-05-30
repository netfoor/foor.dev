'use client';

import React, { useState, useEffect } from 'react';
import { Button, View } from '@aws-amplify/ui-react';

export const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  return (    <View
      className={`scroll-to-top ${isVisible ? 'visible' : 'hidden'}`}
      position="fixed"
      bottom="2rem"
      right="2rem"
      style={{ zIndex: 500 }}
    >
      <Button
        variation="primary"
        size="large"
        onClick={scrollToTop}
        borderRadius="50%"
        width="56px"
        height="56px"
        padding="0"
        ariaLabel="Scroll to top"
        className="scroll-to-top-button"
      >
        <View
          fontSize="xl"
          style={{
            transform: 'rotate(-90deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ➤
        </View>
      </Button>
    </View>
  );
};
