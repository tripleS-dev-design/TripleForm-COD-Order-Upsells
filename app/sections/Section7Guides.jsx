// app/sections/Section7Guides.jsx
import React from 'react';
import { Card, Text, BlockStack } from '@shopify/polaris';

export default function Section7Guides() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingLg">
          Guides & Documentation
        </Text>
        <Text as="p" variant="bodyMd">
          Documentation pour utiliser TripleForm COD
        </Text>
      </BlockStack>
    </Card>
  );
}