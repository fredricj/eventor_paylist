<script setup lang="ts">
import {type Ref, ref} from "vue";
import {extractFeesFromFileList} from "@/utils.ts";

const names: Ref<FileList | undefined | null> = ref();
const haveOutput: Ref<boolean> = ref(false);
const events: Ref<Map<number, string>> = ref(new Map<number, string>());
function fileselected(event: Event) {
  names.value = (event.target as HTMLInputElement).files;
}

async function extractFees() {
  const {events: eventsParsed, competitors} = await extractFeesFromFileList(names.value as FileList);
  haveOutput.value = eventsParsed.size > 0;
  if (haveOutput.value) {
    events.value = eventsParsed;
  }
}

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
  </form>
  <div v-if="events.size > 0">
    <h2>Out:</h2>
    <ul>
      <li v-for="eventName in events.values()">
        {{ eventName }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
form {
  background-color: lightblue;
}
</style>
