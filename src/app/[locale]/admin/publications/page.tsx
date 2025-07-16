'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n/client';
import { useTheme } from '@/hooks/useTheme';
import { View, Heading, Button, Flex, Loader } from '@aws-amplify/ui-react';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../../../amplify/data/resource';

export default function PublicationsManagement() {
  const { t } = useTranslation('admin');
  const { mode } = useTheme();
  const [publications, setPublications] = useState<Awaited<ReturnType<ReturnType<typeof generateClient<Schema>>['models']['SocialPublications']['list']>>['data']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const client = generateClient<Schema>();
        const response = await client.models.SocialPublications.list({ authMode: 'userPool' });
        setPublications(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching publications:', error);
        setLoading(false);
      }
    };

    fetchPublications();
  }, []);

  if (loading) {
    return (
      <View style={{ padding: '2rem', textAlign: 'center' }}>
        <Loader size="large" />
      </View>
    );
  }

  return (
    <View>
      <Flex direction="row" justifyContent="space-between" alignItems="center" marginBottom="2rem">
        <Heading level={1}>{t('publications.manage_publications')}</Heading>
        <Link href="/admin/publications/new">
          <Button variation="primary">
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            {t('publications.add_publication')}
          </Button>
        </Link>
      </Flex>

      <View style={{ marginBottom: '1rem' }}>
        <p>{t('publications.manage_publications_description')}</p>
      </View>

      {publications.length === 0 ? (
        <View
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: mode === 'dark' ? 'rgba(51, 65, 85, 0.3)' : 'rgba(241, 245, 249, 0.7)',
            borderRadius: '8px',
            marginTop: '2rem'
          }}
        >
          <p>{t('publications.no_records')}</p>
          <Link href="/admin/publications/new">
            <Button variation="primary" marginTop="1rem">
              <Plus size={18} style={{ marginRight: '0.5rem' }} />
              {t('publications.add_publication')}
            </Button>
          </Link>
        </View>
      ) : (
        <View>
          {/* Publications list would go here */}
          <p>Publications list component will be implemented here</p>
        </View>
      )}
    </View>
  );
}