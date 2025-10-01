
'use client';

import { Button, Flex, Heading, Text } from '@aws-amplify/ui-react';
import { Frown } from 'lucide-react';
import { useLocalizedPath } from '@/lib/i18n/client';
import { useTranslation } from '@/lib/i18n/client';

export default function NotFoundClient() {
  const getLocalizedPath = useLocalizedPath();
  const { t } = useTranslation('certifications');

  return (
    <Flex direction="column" alignItems="center" justifyContent="center" minHeight="60vh" gap="large">
      <Frown size={64} />
      <Heading level={1}>{t('notFound.title')}</Heading>
      <Text>{t('notFound.message')}</Text>
      <Button onClick={() => window.location.href = getLocalizedPath('/certifications')}>
        {t('notFound.backButton')}
      </Button>
    </Flex>
  );
}
