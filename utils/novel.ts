import {invoke} from "@tauri-apps/api/core"
import {emit} from "@tauri-apps/api/event"
import {filename} from "./utils"

interface NovelConfig {
  path: string
  count: number
  chapter: number
  line: number
}

export interface NovelCache {
  path: string,
  chapter: number,
  line: number
}


export default class Novel {
  private readonly config: NovelConfig = {path: '', count: 30, chapter: -1, line: -1}
  private chapters: Array<string> = []
  private cur_chapter: number = -1
  private cur_line: number = -1
  private cur_content: string = ''
  private lines: Array<string> = []

  constructor(config: Partial<NovelConfig>) {
    this.config = Object.assign(this.config, config)
    this.cur_chapter = this.config.chapter
    this.cur_line = this.config.line
    this.init()
  }

  get chapter() {
    return this.cur_chapter
  }

  get line() {
    return this.cur_line
  }

  private do_prev() {
    return this.cur_line - 1 < 0 && this.cur_chapter > 0
  }

  private do_next() {
    return this.cur_line + 1 > this.lines.length - 1 && this.cur_chapter < this.chapters.length - 1
  }

  private async parse_chapter() {
    try {
      this.cur_content = await invoke<string>("chapter", {title: this.chapters[this.cur_chapter]})
      this.parse_line()
      this.cur_line = 0
    } catch (error) {
      console.error(error);
    }
  }

  private parse_line() {
    this.lines = []
    this.lines.push(this.chapters[this.cur_chapter] + "\n")
    const {count} = this.config
    this.cur_content.split(/\n/).forEach(c => {
      let i = 0
      let s = c.slice(i * count, (i + 1) * count)
      while (s) {
        this.lines.push(s.trim())
        i++
        s = c.slice(i * count, (i + 1) * count)
      }
    })
  }

  private update() {
    emit("change-tip", {name: filename(this.config.path), chapter: this.cur_chapter, line: this.cur_line})
  }


  async init() {
    try {
      this.chapters = await invoke("init", {config: {path: this.config.path}})
      if (this.cur_line >= 0 && this.cur_chapter >= 0) {
        this.cur_content = await invoke<string>("chapter", {title: this.chapters[this.cur_chapter]})
        this.parse_line()
        this.update()
      }
    } catch (error) {
      console.error(error);
    }
  }

  async prev_chapter() {
    if (this.cur_chapter === -1) {
      return ""
    }
    this.cur_chapter--
    if (this.cur_chapter < 0) {
      this.cur_chapter = 0
      return ""
    }
    await this.parse_chapter()
    this.update()
    return this.lines[this.cur_line]
  }

  async next_chapter() {
    this.cur_chapter++
    if (this.cur_chapter > this.chapters.length - 1) {
      this.cur_chapter = this.chapters.length - 1
      return ""
    }
    await this.parse_chapter()
    this.update()
    return this.lines[this.cur_line]
  }

  async prev_line() {
    if (this.cur_line === -1) {
      return ""
    }
    if (this.do_prev()) {
      await this.prev_chapter()
      this.cur_line = this.lines.length - 1
    } else {
      this.cur_line--
    }
    this.update()
    return this.lines[this.cur_line]
  }

  async next_line() {
    if (this.do_next()) {
      await this.next_chapter()
    } else {
      this.cur_line++
    }
    this.update()
    return this.lines[this.cur_line]
  }
}