<template>
  <n-scrollbar class="setting">
    <n-card>
      <n-list v-for="part in config">
        <template #header>
          {{ part.name }}
        </template>
        <n-list-item v-for="item in part.items">
          <template #prefix>
            <n-button text>{{ item.name }}</n-button>
          </template>
          <n-input v-if="item.type === 'input'"></n-input>
          <n-select v-else-if="item.type === 'select'"></n-select>
        </n-list-item>
      </n-list>
      <n-button>保存</n-button>

    </n-card>
  </n-scrollbar>
</template>
<script setup lang="ts">
import {NInput, NButton, NSelect, NList, NListItem, NScrollbar, NCard} from "naive-ui"
import {config} from "../constants/config"

</script>
<style lang="less">
.setting {
  width: 100%;
}
</style>
