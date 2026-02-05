<script setup lang="ts">
import type {CompetitorList} from "@/Competitor.ts";

const props = defineProps<{
  events: Map<number, string>,
  competitors: CompetitorList
}>();

</script>

<template>
  <div>
  <table>
    <thead>
    <tr>
      <th>Land</th>
      <th>Klubb</th>
      <th>Efternamn</th>
      <th>Förnamn</th>
      <th>Klass</th>
      <template v-for="(eventName, eventId) in props.events.values()" :key="eventId">
        <th>{{eventName}}</th>
        <th>{{eventName}} Hyravg.</th>
      </template>
      <th>Total</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="(competitor, eventId) in props.competitors.values()" :key="eventId">
      <td>{{ competitor.organisationCountry }}</td>
      <td>{{ competitor.club }}</td>
      <td>{{ competitor.familyName }}</td>
      <td>{{ competitor.givenName }}</td>
      <td>{{ [...competitor.classNames].join(',') }}</td>
      <template v-for="eventId in props.events.keys()" :key="eventId">
        <td>{{ competitor.competitionFees.get(eventId)?.entryFee ?? '' }}</td>
        <td>{{ (competitor.competitionFees.get(eventId)?.cardFee ?? 0) > 0 ? competitor.competitionFees.get(eventId)?.cardFee : '' }}</td>
      </template>
      <td>{{ competitor.totalFees  }}</td>
    </tr>
    </tbody>
  </table>
  </div>
</template>

<style scoped>
  td, th {
    border-right: 1px darkgray solid;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  th {
    text-align: left;
  }
  td {

  }
</style>
