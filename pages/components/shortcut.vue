<script setup lang="ts">
import {NInput, InputProps} from "naive-ui"
import {ref, watchEffect} from "vue";
import {parseKey, decodeKey} from "~utils/shortcut.ts";

const model = defineModel<string>()

const emit = defineEmits<{
  (event: "confirm"): void
  (event: "default"): void
}>()

const inputValue = ref("")
const inputElement = ref<HTMLInputElement>()

let platformKeys: string[] = [];
let rustKeys: string[] = []
let downKeys: Set<string> = new Set<string>()

watchEffect(() => {
  let keys = model.value?.split("+")
  if (!keys) {
    return
  }
  rustKeys = []
  platformKeys = []
  keys.forEach(key => {
    rustKeys.push(key)
    platformKeys.push(decodeKey(key))
  })
  inputValue.value = platformKeys.join("  +  ")
})

const inputTheme: NonNullable<InputProps["themeOverrides"]> = {
  borderHover: "1px solid transparent",
}

const globalKeyDown = (event: KeyboardEvent) => {
  const {code} = event
  const {platform_key, rust_key} = parseKey(code)
  downKeys.add(code)
  if (code === "Escape") {
    emit("default")
    return;
  } else if (code === "Backspace") {
    platformKeys = []
    rustKeys = []
    inputValue.value = ''
    return;
  } else if (code === "Enter") {
    inputElement.value?.blur()
    model.value = rustKeys.join("+")
    emit("confirm")
    return
  } else if (downKeys.size === 0 && inputValue.value.length > 0) {
    platformKeys = []
    rustKeys = []
    inputValue.value = ""
  }
  if (platformKeys.length >= 3 || platformKeys.includes(platform_key)) {
    return
  }
  platformKeys.push(platform_key)
  rustKeys.push(rust_key)
  inputValue.value = platformKeys.join("  +  ")
  event.preventDefault()
}

const globalKeyUp = (event: KeyboardEvent) => {
  const {code} = event
  downKeys.delete(code)
}

const onFocus = () => {
  window.addEventListener("keydown", globalKeyDown)
  window.addEventListener("keyup", globalKeyUp)
}

const onBlur = () => {
  window.removeEventListener("keydown", globalKeyDown)
  window.removeEventListener("keyup", globalKeyUp)
}
</script>

<template>
  <n-input ref="inputElement" placeholder="按下要绑定的组合键，以Enter结束，Esc恢复默认值" :value="inputValue"
           :theme-overrides="inputTheme" @focus="onFocus" @blur="onBlur"
  ></n-input>
</template>

<style lang="less" scoped>
.n-input:not(.n-input--focus) {
  cursor: default;

  :deep(input) {
    cursor: default;
  }
}
</style>