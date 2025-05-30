import React from 'react';
import { Card, Flex, Text, Heading, Badge } from '@aws-amplify/ui-react';
import { TimelineEvent } from './timelineData';

interface TimelineCardProps {
  event: TimelineEvent;
  index: number;
}

export const TimelineCard: React.FC<TimelineCardProps> = ({ event, index }) => {
  const isEven = index % 2 === 0;
    const getTypeColor = (type: string) => {
    switch (type) {
      case 'education': return 'info';
      case 'achievement': return 'success';
      case 'leadership': return 'warning';
      case 'project': return 'info';
      case 'recognition': return 'success';
      default: return 'info';
    }
  };

  return (
    <Flex
      className={`timeline-item ${isEven ? 'timeline-left' : 'timeline-right'}`}
      direction={isEven ? 'row' : 'row-reverse'}
      alignItems="center"
      gap="2rem"
      marginBottom="3rem"
    >
      {/* Timeline Connector */}      <Flex
        className="timeline-connector"
        justifyContent="center"
        alignItems="center"
        width="60px"
        height="60px"
        backgroundColor={event.highlight ? "var(--amplify-colors-primary-80)" : "var(--amplify-colors-background-secondary)"}
        borderRadius="50%"
        border={event.highlight ? "4px solid var(--amplify-colors-primary-60)" : "4px solid var(--amplify-colors-border-primary)"}
        position="relative"
        style={{ zIndex: 2 }}
      >
        <Text fontSize="xl">{event.icon}</Text>
      </Flex>

      {/* Content Card */}
      <Card
        className="timeline-card"
        variation="elevated"
        backgroundColor="var(--amplify-colors-background-secondary)"
        borderRadius="large"
        padding="large"
        width="100%"
        maxWidth="500px"
      >
        <Flex
          direction="column"
          gap="medium"
        >
          {/* Header */}
          <Flex
            direction="column"
            gap="small"
          >
            <Flex
              alignItems="center"
              gap="small"
              wrap="wrap"
            >
              <Badge 
                variation={getTypeColor(event.type)}
                size="small"
              >
                {event.year}
              </Badge>
              {event.highlight && (
                <Badge 
                  variation="success"
                  size="small"
                >
                  Highlight
                </Badge>
              )}
            </Flex>
            
            <Heading 
              level={4}
              fontSize="large"
              fontWeight="semibold"
              color="var(--amplify-colors-font-primary)"
            >
              {event.title}
            </Heading>
            
            <Text
              fontSize="small"
              color="var(--amplify-colors-primary-80)"
              fontWeight="medium"
            >
              📍 {event.location}
            </Text>
          </Flex>

          {/* Description */}
          <Text
            fontSize="medium"
            color="var(--amplify-colors-font-secondary)"
            lineHeight="1.6"
          >
            {event.description}
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
};
