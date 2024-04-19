<!--suppress ALL -->
<script setup lang="ts">
import {NSelect, NButton, NIcon, NFlex, NModal, NList, NListItem, NCard, NScrollbar, NInput} from "naive-ui"
import {PlusRound} from "@vicons/material"
import space from "./space.vue"
import {ref} from "vue"

const model = defineModel<string>()
const options = defineModel<string[]>("options")
const emit = defineEmits<{
  (e: "update"): void
}>()

const showModal = ref(false)
const inputValue = ref("")
const isAddNew = ref(false)

const onNewConfirm = () => {
  console.log(inputValue.value)
  isAddNew.value = false
  options.value?.push(inputValue.value)
  inputValue.value = ""
}

const onDelete = (index: number) => {
  if (model.value === options.value?.[index]!) {
    model.value = ""
  }
  options.value?.splice(index, 1)
}

const onSubmit = () => {
  emit('update')
  showModal.value = false
}
</script>

<template>
  <n-flex :wrap="false">
    <n-select v-model:value="model" :options="options?.map(item => ({ label: item, value: item }))"
    ></n-select>
    <n-button @click="showModal = true">
      <n-icon>
        <PlusRound/>
      </n-icon>
    </n-button>
  </n-flex>
  <n-modal v-model:show="showModal" transform-origin="center">
    <n-card title="正则条件管理" :bordered="false">
      <template #header-extra>
        <n-button type="primary" @click="isAddNew = true" size="small">新增</n-button>
      </template>
      <n-scrollbar style="max-height: 200px;">
        <n-input placeholder="请输入正则表达式，按回车结束" v-show="isAddNew" v-model:value="inputValue"
                 @keydown.enter="onNewConfirm"></n-input>
        <space v-show="isAddNew" space="10"/>
        <n-list hoverable>
          <n-list-item v-for="(item,i) in options">
            {{ item }}
            <template #suffix>
              <n-button type="error" size="small" @click="onDelete(i)">删除</n-button>
            </template>
          </n-list-item>
        </n-list>
      </n-scrollbar>
      <space space="10"/>
      <n-flex justify="center">
        <n-button @click="showModal = false">取消</n-button>
        <n-button type="primary" @click="onSubmit">确定</n-button>
      </n-flex>
    </n-card>
  </n-modal>
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
