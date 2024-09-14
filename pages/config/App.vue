<template>
  <n-config-provider class="main" :theme="darkTheme" :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <div data-tauri-drag-region class="header">
        <n-button-group size="medium">
          <n-button tertiary :bordered="false" :focusable="false" :theme-overrides="buttonTheme" @click="onMinimize">
            <template #icon>
              <n-icon>
                <MinusRound/>
              </n-icon>
            </template>
          </n-button>
          <n-button tertiary :bordered="false" :focusable="false" type="error" :theme-overrides="buttonTheme"
                    @click="onClose">
            <template #icon>
              <n-icon>
                <CloseRound/>
              </n-icon>
            </template>
          </n-button>
        </n-button-group>
      </div>
      <div class="body">
        <setting/>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
<script setup lang="ts">
import {
  ButtonProps,
  darkTheme,
  dateZhCN,
  NButton,
  NButtonGroup,
  NConfigProvider,
  NIcon,
  NMessageProvider,
  zhCN
} from "naive-ui"
import {CloseRound, MinusRound} from "@vicons/material"
import setting from "./views/setting.vue"
import {webviewWindow} from "@tauri-apps/api";

const buttonTheme: NonNullable<ButtonProps["themeOverrides"]> = {
  heightMedium: "24px"
}

const onMinimize = () => {
  webviewWindow.getCurrent().minimize()
}

const onClose = () => {
  webviewWindow.getCurrent().close()
}

</script>
<style lang="less">
.main {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #000;
  border-radius: 5px;
  overflow: hidden;

  .header {
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .body {
    flex: 1;
    height: 0;
  }

}
</style>
