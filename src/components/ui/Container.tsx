'use client';

import React from 'react';
import { Flex } from '@aws-amplify/ui-react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <Flex
      direction="column"
      maxWidth={{ base: '100%', medium: '90%', large: '1200px' }}
      marginLeft="auto"
      marginRight="auto"
      padding={{ base: '0 1rem', medium: '0 2rem' }}
      className={className}
    >
      {children}
    </Flex>
  );
};

export default Container;
