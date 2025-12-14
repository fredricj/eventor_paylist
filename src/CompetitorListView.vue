<script setup lang="ts">
import type {CompetitorList} from "@/Competitor.ts";

const props = defineProps<{
  events: Map<number, string>,
  competitors: CompetitorList
}>();

function calculateSum(arr: MapIterator<number>) {
  let sum = 0;
  for (const i of arr) {
    sum += i;
  }
  return sum;
}
</script>

<template>
  <table>
    <thead>
    <tr>
      <th>Förnamn</th>
      <th>Efternamn</th>
      <th>Klubb</th>
      <th>Land</th>
      <th>Klass</th>
      <th v-for="(eventName, eventId) in props.events.values()" :key="eventId">
        {{eventName}}
      </th>
      <th>Total</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(competitor, eventId) in props.competitors.values()" :key="eventId">
      <td>{{ competitor.givenName }}</td>
      <td>{{ competitor.familyName }}</td>
      <td>{{ competitor.club }}</td>
      <td>{{ competitor.organisationCountry }}</td>
      <td>{{ [...competitor.classNames].join(',') }}</td>
      <th v-for="eventId in props.events.keys()" :key="eventId">
        {{ competitor.competitionFees.get(eventId) ?? ''}}
      </th>
      <td>{{ calculateSum(competitor.competitionFees.values())  }}</td>
    </tr>
    </tbody>
  </table>

</template>

<style scoped>

</style>
