<!--suppress ALL -->
<script setup lang="ts">
import {NSelect, NButton, NIcon, NFlex, SelectOption} from "naive-ui"
import {PlusRound, DeleteRound} from "@vicons/material"
import {h, VNode, ref} from "vue"

const model = defineModel<string>()
const options = defineModel<string[]>("options")
const selectRef = ref<HTMLInputElement>()

const renderOption = ({node, option, selected}: { node: VNode, option: SelectOption, selected: boolean }) => {
  return h("div", {
    class: "custom-option", onClick: () => {
      node.props.onClick()
    }
  }, [
    h("div", {class: "label"}, option.label),
    h(NButton, {
      type: "error", size: "tiny", ghost: true, style: "position: relative; left: 4px;", onClick: (event) => {
        selectRef.value?.blurInput()
        let index = options.value?.findIndex(item => item === options.value)
        options.value?.splice(index, 1)
        if (selected) {
          console.log(selected)
          model.value = ""
        }
        event.stopPropagation()
      }
    }, {
      icon: () => h(NIcon, {}, {default: () => h(DeleteRound)})
    })
  ])
}

</script>

<template>
  <n-flex :wrap="false">
    <n-select ref="selectRef" v-model="model" :options="options.map(item => ({ label: item, value: item }))"
              :render-option="renderOption"
    ></n-select>
    <n-button>
      <n-icon>
        <PlusRound/>
      </n-icon>
    </n-button>
  </n-flex>
</template>

<style scoped lang="less">
.n-select {
  flex: 1;
  width: 0;


}
</style>
<style>
.custom-option {
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px 10px;
  cursor: pointer;
  transition: color .3s var(--n-bezier),
  opacity .3s var(--n-bezier);

  &::before {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 4px;
    right: 4px;
    bottom: 0;
    border-radius: var(--n-border-radius);
    transition: background-color .3s var(--n-bezier);
  }


  &:hover {
    color: var(--n-option-text-color-active);

    &::before {
      background-color: var(--n-option-color-pending);
    }
  }

  .label {
    flex: 1;
    width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
