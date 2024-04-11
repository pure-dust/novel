export default <Config>{
  app: {},
  theme: {},
  novel: {
    font_color: "#ffffff",
    font_size: 12,
    regexp: "第[零一二三四五六七八九十百千万0-9]+章[\s|：]*[?s:.]*",
    regexp_options: ["第[零一二三四五六七八九十百千万0-9]+章[\s|：]*[?s:.]*"]
  },
  shortcut: {
    prev: "NumpadSubtract",
    next: "NumpadAdd",
    prev_chapter: "Alt+NumpadSubtract",
    next_chapter: "Alt+NumpadAdd",
    hide: "NumpadDivide",
    up: "CommandOrControl+ArrowUp",
    left: "CommandOrControl+ArrowLeft",
    right: "CommandOrControl+ArrowRight",
    down: "CommandOrControl+ArrowDown"
  },
  other: {}
}