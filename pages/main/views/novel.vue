<template>
  <div data-tauri-drag-region class="novel">
    {{ line }}
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue"
import {getCurrent} from "@tauri-apps/api/window"
import {listen} from "@tauri-apps/api/event"
import {open} from "@tauri-apps/plugin-dialog"
import {filename} from "~utils/utils"

import Novel, {NovelCache} from "~utils/novel"
import ShortcutManager from "~utils/shortcut.ts"
import CacheManager from "~utils/cache"
import ConfigManager from "~utils/config"

const line = ref("")
const file = ref("")
const fontColor = ref("")
const fontSize = ref("12px")
let shortcutManager = new ShortcutManager()
let cacheManager = new CacheManager()
let configManager = new ConfigManager()
let novel: Novel
let path: string

const init_theme = () => {
  fontColor.value = configManager.get<string>("novel.font_color")
  fontSize.value = configManager.get<number>("novel.font_size") + "px"
}

const init_novel = () => {
  path = cacheManager.get<string>("novel.last") || ""

  if (!path) {
    line.value = "请选择书籍"
    return
  }
  line.value = filename(path)
  file.value = line.value
  novel = new Novel({
    path: path,
    chapter: cacheManager.get<number>(`novel.${file.value}.chapter`) ?? -1,
    line: cacheManager.get<number>(`novel.${file.value}.line`) ?? -1,
    regexp: configManager.get<string>("novel.regexp"),
  })

  cacheManager.update(`novel`, {
    last: path,
  })
}

const move = async (dir: string) => {
  let window = getCurrent()
  let origin = await window.outerPosition()
  switch (dir) {
    case "up":
      window.setPosition({x: origin.x, y: origin.y - 1, type: origin.type})
      break
    case "left":
      window.setPosition({x: origin.x - 1, y: origin.y, type: origin.type})
      break
    case "right":
      window.setPosition({x: origin.x + 1, y: origin.y, type: origin.type})
      break
    case "down":
      window.setPosition({x: origin.x, y: origin.y + 1, type: origin.type})
      break
    default:
      break
  }
}

const updateCache = () => {
  cacheManager.update(`novel.${file.value}`, {
    chapter: novel.chapter,
    line: novel.line,
  })
}

shortcutManager.on("prev", async () => {
  if (!novel) {
    return
  }
  line.value = await novel.prev_line()
  cacheManager.update(`novel.${file.value}`, {
    chapter: novel.chapter,
    line: novel.line,
  })
})

shortcutManager.on("next", async () => {
  if (!novel) {
    return
  }
  line.value = await novel.next_line()
  updateCache()
})

shortcutManager.on("prev_chapter", async () => {
  if (!novel) {
    return
  }
  line.value = await novel.prev_chapter()
  updateCache()
})

shortcutManager.on("next_chapter", async () => {
  if (!novel) {
    return
  }
  line.value = await novel.next_chapter()
  updateCache()
})

shortcutManager.on("hide", async () => {
  let window = getCurrent()
  let visible = await window.isVisible()
  if (visible) {
    await window.hide()
  } else {
    await window.show()
  }
})

shortcutManager.on("up", () => {
  move("up")
})

shortcutManager.on("down", () => {
  move("down")
})

shortcutManager.on("left", () => {
  move("left")
})

shortcutManager.on("right", () => {
  move("right")
})

listen("select", async () => {
  let result = await open()
  if (!result) return
  line.value = filename(result.name || "")
  file.value = line.value
  await cacheManager.reload()
  await configManager.reload()
  let cache = cacheManager.get<NovelCache>(`novel.${file.value}`)

  novel = new Novel({
    path: result.path,
    chapter: cache?.chapter ?? -1,
    line: cache?.line ?? -1,
    regexp: configManager.get<string>("novel.regexp"),
  })

  cacheManager.update(`novel.${file.value}`, {
    path: result.path,
    chapter: novel.chapter,
    line: novel.line,
  })

  cacheManager.update(`novel`, {
    last: result.path,
  })
})

listen("reload", async () => {
  await configManager.reload()
  await cacheManager.reload()
  init_novel()
})

configManager.on("update", () => {
  init_theme()
  init_novel()
})

init_theme()
init_novel()
</script>
<style>
.novel {
  color: v-bind("fontColor");
  font-size: v-bind("fontSize");
  letter-spacing: 1px;
  font-weight: lighter;
}
</style>
