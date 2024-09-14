interface ConfigItem {
  name: string
  prop: string
  items: {
    name: string
    type: string
    prop: string
  }[]
}

export const config: ConfigItem[] = [
  {
    name: "应用",
    prop: "app",
    items: [],
  },
  {
    name: "主题",
    prop: "theme",
    items: [],
  },
  {
    name: "小说",
    prop: "novel",
    items: [
      {name: "字体颜色", type: "color", prop: "font_color"},
      {name: "字体大小", type: "number", prop: "font_size"},
      {name: "章节正则", type: "select", prop: "regexp"},
    ],
  },
  {
    name: "快捷键",
    prop: "shortcut",
    items: [
      {name: "上一行", type: "shortcut", prop: "prev"},
      {name: "下一行", type: "shortcut", prop: "next"},
      {name: "上一章", type: "shortcut", prop: "prev_chapter"},
      {name: "下一章", type: "shortcut", prop: "next_chapter"},
      {name: "老板键", type: "shortcut", prop: "hide"},
      {name: "窗口左移", type: "shortcut", prop: "left"},
      {name: "窗口上移", type: "shortcut", prop: "up"},
      {name: "窗口右移", type: "shortcut", prop: "right"},
      {name: "窗口下移", type: "shortcut", prop: "down"},
    ],
  },
  {
    name: "其他",
    prop: "other",
    items: [
      {name: "缓存管理", type: "button", prop: "cache"}
    ],
  },
]
