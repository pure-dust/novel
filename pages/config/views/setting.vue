<template>
  <n-scrollbar class="setting">
    <n-card :bordered="false">
      <n-list v-for="part in config">
        <template #header>
          {{ part.name }}
        </template>
        <n-list-item v-for="item in part.items">
          <template #prefix>
            <div class="label">
              <n-button text>{{ item.name }}</n-button>
            </div>
          </template>
          <n-input v-if="item.type === 'input'"></n-input>
          <add-select v-model="configData[part.prop][item.prop]" v-else-if="item.type === 'select'"
                      :options="configData[part.prop][item.prop + '_options']"></add-select>
          <shortcut v-model="configData[part.prop][item.prop]" v-else-if="item.type === 'shortcut'"
                    @confirm="onConfirm(item.prop)"
                    @default="onDefault(part.prop, item.prop)"></shortcut>
        </n-list-item>
      </n-list>
      <n-button>保存</n-button>

    </n-card>
  </n-scrollbar>
</template>
<script setup lang="ts">
import {NInput, NButton, NSelect, NList, NListItem, NScrollbar, NCard} from "naive-ui"
import {onMounted, ref, h} from "vue";
import {listen} from "@tauri-apps/api/event";
import {useMessage} from "naive-ui"

import default_config from "~assets/default"
import {config} from "../constants/config"
import Shortcut from "~components/shortcut.vue"
import AddSelect from "~components/add-select.vue";
import ConfigManager from "~utils/config.ts";

const configData = ref<Config>({
  app: {},
  theme: {},
  novel: {
    font_color: "",
    font_size: 0,
    regexp: "",
    regexp_options: []
  },
  shortcut: {
    prev: "",
    next: "",
    prev_chapter: "",
    next_chapter: "",
    hide: "",
    up: "",
    left: "",
    right: "",
    down: ""
  },
  other: {}
})
const configManager = new ConfigManager()
const messageManager = useMessage()

const onConfirm = (prop: string) => {
  configManager.update({
    shortcut: {
      [prop]: configData.value.shortcut[prop]
    }
  })
}

const onDefault = (part: string, prop: string) => {
  configData.value[part][prop] = default_config[part][config]
  onConfirm()
}

listen<string>("hotkey-update", ({payload: key}) => {
  let conf = config.find(item => item.prop === "shortcut")
  let shortcut = conf.items.find(item => item.prop === key)
  messageManager.success("", {
    render() {
      return h("div", {class: "n-message"}, {
        default: () => [
          "快捷键",
          h(NButton, {
            secondary: true,
            type: "info",
            size: "tiny",
            style: "margin: 0 4px;"
          }, {default: () => shortcut.name}),
          "更新成功"
        ]
      })
    },
  })
})
onMounted(async () => {
  await configManager.load()
  configData.value = configManager.get<Config>()
})
</script>
<style lang="less">
.setting {
  width: 100%;

  .label {
    width: 60px;
    text-align: right;
  }
}
</style>
