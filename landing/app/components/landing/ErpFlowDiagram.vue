<script setup lang="ts">
const titleId = 'erp-flow-diagram-title'
</script>

<template>
  <svg
    viewBox="0 0 440 140"
    class="w-full h-auto"
    role="img"
    :aria-labelledby="titleId"
    data-testid="erp-flow-diagram"
  >
    <title :id="titleId">Bidirectional data flow between your ERP system and PickupQueue</title>

    <!-- Your ERP box -->
    <rect x="10" y="30" width="140" height="80" rx="12" class="fill-card stroke-border" stroke-width="2" />
    <text x="80" y="76" text-anchor="middle" class="fill-foreground text-sm font-semibold">Your ERP</text>

    <!-- PickupQueue box -->
    <rect x="290" y="30" width="140" height="80" rx="12" class="fill-card stroke-border" stroke-width="2" />
    <text x="360" y="76" text-anchor="middle" class="fill-foreground text-sm font-semibold">PickupQueue</text>

    <!-- Arrow: ERP → PickupQueue -->
    <line x1="160" y1="55" x2="278" y2="55" class="stroke-primary" stroke-width="2" />
    <polygon points="280,55 272,50 272,60" class="fill-primary" />
    <text x="220" y="48" text-anchor="middle" class="fill-muted-foreground" style="font-size: 10px;">Orders &amp; Fulfillment</text>

    <!-- Arrow: PickupQueue → ERP -->
    <line x1="280" y1="90" x2="162" y2="90" class="stroke-primary" stroke-width="2" />
    <polygon points="160,90 168,85 168,95" class="fill-primary" />
    <text x="220" y="108" text-anchor="middle" class="fill-muted-foreground" style="font-size: 10px;">Check-in &amp; Status</text>
  </svg>
</template>
