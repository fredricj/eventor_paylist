<script setup lang="ts">
import {computed, type Ref, ref, useTemplateRef, watch} from "vue";
import {extractFeesFromFileList, generateCSV} from "@/utils.ts";
import EventListView from "@/components/EventListView.vue";
import CompetitorListView from "@/CompetitorListView.vue";
import {Competitor, type CompetitorList} from "@/Competitor.ts";

const names: Ref<FileList | undefined | null> = ref();
const haveOutput: Ref<boolean> = ref(false);
const events: Ref<Map<number, string>> = ref(new Map<number, string>());
const competitors: Ref<CompetitorList> = ref([]);
const filterSwedish = ref(true);
const downloadLink = useTemplateRef('downloadLink');

function fileselected(event: Event) {
  names.value = (event.target as HTMLInputElement).files;
  events.value.clear();
  competitors.value = [];
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
  let l = [...competitors.value];
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

watch([filteredCompetitors, downloadLink], () => {
  if (downloadLink.value) {
    const csvData = generateCSV(events.value, filteredCompetitors.value);
    downloadLink.value.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvData);
    downloadLink.value.download = 'betallista.csv';
  }
});

</script>

<template>
  <h1>Generate paylist</h1>
  <p>
    Generate list of amount to pay for competitors
  </p>
  <div class="data">
    <input type="file" name="infiles" multiple @change="fileselected" accept=".xml"/>
    <div v-if="names && names.length > 0">
      <div style="display: flex;">
        <div>
          <p>Selected files:</p>
        </div>
        <div>
          <ul>
          <li v-for="item in names" :key="item.name">
            {{ item.name }}
          </li>
          </ul>
        </div>
      </div>
      <div>
        <input type="button" name="convert" value="Extract fees" @click="extractFees">
      </div>
      <div>
        <label for="filterNonmembers">Exclude members of Swedish clubs</label>
        <input type="checkbox" name="filterNonmembers" id="filterNonmembers" v-model="filterSwedish">
      </div>
    </div>
    <div v-if="events.size > 0" class="output">
      <h2>Events:</h2>
      <EventListView :events=events />
      <h3>Competitors:</h3>
      <a href="" class="downloadLink" ref="downloadLink" download="">Download list</a>
      <CompetitorListView :events="events" :competitors="filteredCompetitors" />
    </div>
  </div>

</template>

<style scoped>
div.data {
  background-color: lightgrey;
  padding: 1em;
  width: fit-content;
  min-width: 30em;
  border-radius: 1em;
}
.output {
  background-color: lightgreen;
  padding: 1em;
  border-radius: 1em;
  width: fit-content;
  margin-top: 1em;
}
.downloadLink {
  margin-top: 1em;
}
</style>
