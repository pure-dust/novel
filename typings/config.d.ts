interface AppConfig extends Record<string, any> {

}

interface ThemeConfig extends Record<string, any> {

}

interface NovelConfig extends Record<string, any> {
  theme: {
    font_color: string,
    font_size: number
  }
  regexp: string[]
}

interface ShortcutConfig extends Record<string, any> {
  prev: string
  next: string
  prev_chapter: string
  next_chapter: string
  hide: string
  up: string
  left: string
  right: string
  down: string
}

interface OtherConfig {

}

interface Config extends Record<string, any> {
  app: AppConfig
  theme: ThemeConfig
  novel: NovelConfig
  shortcut: ShortcutConfig
  other: OtherConfig
}