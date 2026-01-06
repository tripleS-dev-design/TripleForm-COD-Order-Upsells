// ===== File: app/components/SettingTile.jsx =====
import React from "react";
import { Card, BlockStack, InlineStack, Text, Button, Badge } from "@shopify/polaris";

export default function SettingTile({
  title,
  description,
  status, // { label: string, tone?: "success"|"info"|"warning"|"critical" }
  primaryAction, // { content, onAction }
  secondaryAction, // { content, onAction } (optional)
}) {
  return (
    <Card padding="500">
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="start" gap="300">
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <Text variant="headingSm" as="h3">
                {title}
              </Text>
              {status?.label ? (
                <Badge tone={status.tone || "success"}>{status.label}</Badge>
              ) : null}
            </InlineStack>

            {description ? (
              <Text tone="subdued" as="p">
                {description}
              </Text>
            ) : null}
          </BlockStack>

          <InlineStack gap="200">
            {secondaryAction ? (
              <Button onClick={secondaryAction.onAction}>
                {secondaryAction.content}
              </Button>
            ) : null}

            {primaryAction ? (
              <Button variant="primary" onClick={primaryAction.onAction}>
                {primaryAction.content}
              </Button>
            ) : null}
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
