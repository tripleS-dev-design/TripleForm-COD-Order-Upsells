// ===== File: app/components/SectionCard.jsx =====
import { Card, Box, Text, BlockStack, Button, InlineStack } from "@shopify/polaris";


export default function SectionCard({ title, description, primaryAction, secondaryActions, children }) {
return (
<Card>
<BlockStack gap="400">
<Box>
<Text as="h3" variant="headingMd">{title}</Text>
{description && (
<Text as="p" variant="bodyMd" tone="subdued">
{description}
</Text>
)}
</Box>
{children}
{(primaryAction || (secondaryActions && secondaryActions.length)) && (
<InlineStack gap="200">
{primaryAction && (
<Button onClick={primaryAction.onAction} variant="primary">
{primaryAction.content}
</Button>
)}
{secondaryActions?.map((a, i) => (
<Button key={i} onClick={a.onAction}>
{a.content}
</Button>
))}
</InlineStack>
)}
</BlockStack>
</Card>
);
}