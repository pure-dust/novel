<script setup lang="ts">
import {computed} from "vue";

const props = defineProps<{
  space: number | string
  vertical?: boolean
}>()

const realSpace = computed(() => props.space + "px")
</script>

<template>
  <div class="k-space"></div>
</template>

<style scoped lang="less">
.k-space {
  width: 100%;
  height: v-bind(realSpace);

  &-vertical {
    width: v-bind(realSpace);
    height: 100%;
  }
}
</style>