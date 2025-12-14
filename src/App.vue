<script setup lang="ts">
import {computed, type Ref, ref} from "vue";
import {extractFeesFromFileList} from "@/utils.ts";
import EventListView from "@/components/EventListView.vue";
import CompetitorListView from "@/CompetitorListView.vue";
import {Competitor, type CompetitorList, type CompetitorMap} from "@/Competitor.ts";

const names: Ref<FileList | undefined | null> = ref();
const haveOutput: Ref<boolean> = ref(false);
const events: Ref<Map<number, string>> = ref(new Map<number, string>());
const competitors: Ref<CompetitorMap> = ref(new Map());
const filterSwedish = ref(true);
function fileselected(event: Event) {
  names.value = (event.target as HTMLInputElement).files;
}

async function extractFees() {
  const {events: eventsParsed, competitors: competitorsParsed} = await extractFeesFromFileList(names.value as FileList);
  haveOutput.value = eventsParsed.size > 0;
  if (haveOutput.value) {
    events.value = eventsParsed;
    competitors.value = competitorsParsed;
  }
}
const filteredCompetitors = computed<CompetitorList>(function() {
  let l = [...competitors.value.values()];
  if (filterSwedish.value) {
    l = l.filter((v) => v.organisationCountry !== "Sweden");
  }
  return l.sort(function(a: Competitor, b: Competitor) {
    const sCountry = (a.organisationCountry??'').localeCompare(b.organisationCountry??'');
    if (sCountry !== 0) {
      return sCountry;
    }
    const sClub = (a.club??'').localeCompare(b.club??'');
    if (sClub !== 0) {
      return sClub;
    }
    const sFamily = a.familyName.localeCompare(b.familyName);
    if (sFamily !== 0) {
      return sFamily;
    }
    const sGiven = a.givenName.localeCompare(b.givenName);
    if (sGiven !== 0) {
      return sGiven;
    }
    return a.classNames.size - b.classNames.size;
  });
} );


</script>

<template>
  <h1>Generate paylist</h1>
  <p>
    Generate list of amount to pay for competitors
  </p>
  <form>
    <input type="file" name="infiles" multiple @change="fileselected" accept=".xml"/>
    <div v-if="names && names.length > 0">
      <p>Selected files:</p>
      <ul>
      <li v-for="item in names" :key="item.name">
        {{ item.name }}
      </li>
      </ul>
      <div>
        <input type="button" name="convert" value="Extract fees" @click="extractFees">
      </div>
    </div>
    <div>
      <label for="filterNonmembers">Exclude members of Swedish clubs</label>
      <input type="checkbox" name="filterNonmembers" id="filterNonmembers" v-model="filterSwedish">
    </div>
  </form>
  <div v-if="events.size > 0">
    <h2>Out:</h2>
    <EventListView :events=events />
    <CompetitorListView :events="events" :competitors="filteredCompetitors" />
  </div>
</template>

<style scoped>
form {
  background-color: lightblue;
}
</style>
