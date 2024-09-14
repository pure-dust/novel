interface AppConfig extends Record<string, any> {

}

interface ThemeConfig extends Record<string, any> {

}

interface NovelConfig extends Record<string, any> {
  font_color: string,
  font_size: number
  regexp: string
  regexp_options: string[]
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
  app: Partial<AppConfig>
  theme: Partial<ThemeConfig>
  novel: Partial<NovelConfig>
  shortcut: Partial<ShortcutConfig>
  other: Partial<OtherConfig>
}

interface NovelItemCache extends Record<string, string | number> {
  path: string
  chapter: number
  line: number
}

interface NovelCache {
  last?: string,

  [key: string]: NovelItemCache | string
}


interface AppCache {
  novel: NovelCache
}