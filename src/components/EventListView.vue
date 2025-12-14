<script setup lang="ts">

const props = defineProps<{
  events: Map<number, string>
}>();

</script>

<template>
  <ul>
    <li v-for="(eventName, eventId) in props.events.values()" :key="eventId">
      {{ eventName }}
    </li>
  </ul>
</template>

<style scoped>

</style>
