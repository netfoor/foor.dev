import React from 'react';
import { View, Flex, Text } from '@aws-amplify/ui-react';
import { TimelineCard } from './TimelineCard';
import { timelineEvents } from './timelineData';

export const TimelineSection: React.FC = () => {
  return (
    <View
      className="timeline-container"
      position="relative"
      padding="2rem 0"
    >
      {/* Timeline Line */}
      <View
        className="timeline-line"
        position="absolute"
        left="50%"
        top="0"
        bottom="0"
        width="2px"
        backgroundColor="var(--amplify-colors-border-primary)"
        style={{
          transform: 'translateX(-50%)',
          zIndex: 1
        }}
      />

      {/* Timeline Events */}      <Flex
        direction="column"
        alignItems="center"
        position="relative"
        style={{ zIndex: 2 }}
      >
        {timelineEvents.map((event, index) => (
          <TimelineCard 
            key={`${event.year}-${index}`}
            event={event}
            index={index}
          />
        ))}
      </Flex>
    </View>
  );
};
