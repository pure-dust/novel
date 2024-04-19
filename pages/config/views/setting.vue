<template>
  <n-flex vertical class="setting">
    <n-scrollbar style="flex:1;">
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
            <n-input v-if="item.type === 'input'" v-model:value="configData[part.prop][item.prop]"></n-input>
            <n-input-number v-else-if="item.type==='number'"
                            v-model:value="configData[part.prop][item.prop]"></n-input-number>
            <n-color-picker v-else-if="item.type==='color'"
                            v-model:value="configData[part.prop][item.prop]" :modes="['hex']"></n-color-picker>
            <add-select v-model="configData[part.prop][item.prop]" v-else-if="item.type === 'select'"
                        v-model:options="configData[part.prop][item.prop + '_options']"
                        @update="onRegexpUpdate"></add-select>
            <shortcut v-model="configData[part.prop][item.prop]" v-else-if="item.type === 'shortcut'"
                      @confirm="onConfirm(part.prop,item.prop)"
                      @default="onDefault(item.prop)"></shortcut>
          </n-list-item>
        </n-list>
      </n-card>
    </n-scrollbar>
    <n-flex justify="flex-end" style="padding: 5px 24px ">
      <n-button @click="onConfirm()">保存</n-button>
    </n-flex>
  </n-flex>
</template>
<script setup lang="ts">
import {NInput, NButton, NList, NListItem, NScrollbar, NCard, NInputNumber, NColorPicker, NFlex} from "naive-ui"
import {onMounted, ref, h} from "vue";
import {emit, listen} from "@tauri-apps/api/event";
import {useMessage} from "naive-ui"

// @ts-ignore
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

const onConfirm = (part?: string, prop?: string) => {
  if (part && prop) {
    emit("config-update", {
      [part]: {
        [prop]: configData.value[part][prop]
      }
    })
  } else if (part) {
    emit("config-update", {
      [part]: configData.value[part]
    })
  } else {
    emit("config-update", configData.value)
  }
}

const onDefault = (prop: string) => {
  configData.value.shortcut[prop] = default_config.shortcut[config]
  onConfirm("shortcut", prop)
}

const onRegexpUpdate = () => {
  onConfirm("novel")
}

listen<string>("hotkey-update", ({payload: key}) => {
  let conf = config.find(item => item.prop === "shortcut")
  let shortcut = conf?.items.find(item => item.prop === key)
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
          }, {default: () => shortcut?.name}),
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
  height: 100%;
  gap: unset !important;

  .label {
    width: 60px;
    text-align: right;
  }
}
</style>
