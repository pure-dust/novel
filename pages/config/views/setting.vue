<template>
  <n-flex vertical class="setting">
    <n-scrollbar style="flex: 1">
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
            <n-input
                v-if="item.type === 'input'"
                v-model:value="configData[part.prop][item.prop]"
            ></n-input>
            <n-input-number
                v-else-if="item.type === 'number'"
                v-model:value="configData[part.prop][item.prop]"
            ></n-input-number>
            <n-color-picker
                v-else-if="item.type === 'color'"
                v-model:value="configData[part.prop][item.prop]"
                :modes="['hex']"
            ></n-color-picker>
            <add-select
                v-model="configData[part.prop][item.prop]"
                v-else-if="item.type === 'select'"
                v-model:options="configData[part.prop][item.prop + '_options']"
                @update="onRegexpUpdate"
            ></add-select>
            <shortcut
                v-model="configData[part.prop][item.prop]"
                v-else-if="item.type === 'shortcut'"
                @confirm="onConfirm(part.prop, item.prop)"
                @default="onDefault(item.prop)"
            ></shortcut>
            <n-button v-else-if="item.type === 'button'" @click="onItemClick(item.prop)">
              {{ item.name }}
            </n-button>
          </n-list-item>
        </n-list>
      </n-card>
    </n-scrollbar>
    <n-flex justify="flex-end" style="padding: 5px 24px">
      <n-button @click="onConfirm()">保存</n-button>
    </n-flex>
    <n-modal v-model:show="state.isShowCache" transform-origin="center">
      <n-card title="缓存管理" :bordered="false">
        <n-scrollbar style="max-height: 200px">
          <n-list hoverable>
            <n-list-item>
              上次看到：{{ filename(cacheData['last']) }}
            </n-list-item>
            <template v-for="(item, key) in cacheData">
              <n-list-item v-if="key !=='last'">
                <template v-if="key !=='last'">
                  <div style="display: flex">
                    <span style="flex: 1">{{ key }}</span>
                    <span style="width: 80px">第{{ item.chapter + 1 }}章</span>
                    <span style="width: 80px">第{{ item.line + 1 }}行</span>
                  </div>
                </template>
                <template v-if="key !=='last'" #suffix>
                  <n-popconfirm @positive-click="onNovelDelete(item)" v-model:show="showTip[key]">
                    是否一并删除书籍
                    <template #trigger>
                      <n-button type="error" size="small">删除</n-button>
                    </template>
                    <template #action>
                      <n-button size="small" type="error" @click="onNovelDelete(key, true)">是</n-button>
                      <n-button size="small" @click="onNovelDelete(key, true)">否</n-button>
                      <n-button size="small" @click="showTip[key] = false">取消</n-button>
                    </template>
                  </n-popconfirm>
                </template>
              </n-list-item>
            </template>
          </n-list>
        </n-scrollbar>
      </n-card>
    </n-modal>
  </n-flex>
</template>
<script setup lang="ts">
import {
  NButton,
  NCard,
  NColorPicker,
  NFlex,
  NInput,
  NInputNumber,
  NList,
  NListItem,
  NModal,
  NPopconfirm,
  NScrollbar,
  useMessage,
} from "naive-ui"
import {h, onMounted, reactive, ref} from "vue"
import {emit, listen} from "@tauri-apps/api/event"

// @ts-ignore
import default_config from "~assets/default"
import {config} from "../constants/config"
import Shortcut from "~components/shortcut.vue"
import AddSelect from "~components/add-select.vue"
import ConfigManager from "~utils/config.ts"
import CacheManager from "~utils/cache.ts"
import {filename} from "~utils/utils.ts";
import {invoke} from "@tauri-apps/api/core";

const configManager = new ConfigManager()
const cacheManager = new CacheManager()
const messageManager = useMessage()

const configData = ref<Config>({
  app: {},
  theme: {},
  novel: {
    font_color: "",
    font_size: 0,
    regexp: "",
    regexp_options: [],
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
    down: "",
  },
  other: {},
})

const cacheData = ref<NovelCache>({})

const state = reactive({
  isShowCache: false,
})

const showTip = ref({})

const onConfirm = (part?: string, prop?: string) => {
  if (part && prop) {
    emit("config-update", {
      [part]: {
        [prop]: configData.value[part][prop],
      },
    })
  } else if (part) {
    emit("config-update", {
      [part]: configData.value[part],
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

const onItemClick = (type: string) => {
  if (type === "cache") {
    state.isShowCache = true
  }
}

const onNovelDelete = async (key: string, isDelete: boolean) => {
  if (isDelete) {
    await invoke("remove", {path: (cacheData.value[key] as NovelItemCache).path})
  }

  delete cacheData.value[key]
  await cacheManager.update("novel", cacheData.value)
  await cacheManager.reload()
  cacheData.value = cacheManager.get<NovelCache>("novel")
  messageManager.success("删除成功")
  if (key === filename(cacheData.value['last'])) {
    cacheData.value['last'] = ""
    emit("reload")
  }
  showTip.value[key] = false
}

listen<string>("hotkey-update", ({payload: key}) => {
  let conf = config.find((item) => item.prop === "shortcut")
  let shortcut = conf?.items.find((item) => item.prop === key)
  messageManager.success("", {
    render() {
      return h(
          "div",
          {class: "n-message"},
          {
            default: () => [
              "快捷键",
              h(
                  NButton,
                  {
                    secondary: true,
                    type: "info",
                    size: "tiny",
                    style: "margin: 0 4px;",
                  },
                  {default: () => shortcut?.name},
              ),
              "更新成功",
            ],
          },
      )
    },
  })
})

onMounted(async () => {
  await configManager.load()
  await cacheManager.load()
  configData.value = configManager.get<Config>()
  cacheData.value = cacheManager.get<NovelCache>("novel")
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
