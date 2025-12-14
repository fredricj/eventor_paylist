<script setup lang="ts">
import {type Ref, ref} from "vue";

const names: Ref<FileList | undefined | null> = ref();
function fileselected(event: Event) {
  names.value = (event.target as HTMLInputElement).files;
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
      <li v-for="item in names">
        {{ item.name }}
      </li>
      </ul>
    </div>
  </form>
</template>

<style scoped>
form {
  background-color: lightblue;
}
</style>
