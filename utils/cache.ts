import {BaseDirectory} from "@tauri-apps/api/path"
import {exists, readTextFile} from "@tauri-apps/plugin-fs"
import Emitter from "./emit";
import {writeFile} from "./utils";

export default class CacheManager extends Emitter {
  base = BaseDirectory.AppConfig
  name!: string
  cache: Record<string, any> = {}
  loaded: boolean = false
  static instance: CacheManager

  constructor(name?: string) {
    super()
    if (!CacheManager.instance) {
      CacheManager.instance = this
      this.name = name ?? "cache"
      return this
    }
    return CacheManager.instance
  }

  private async _create_default() {
    if (!await exists(this.name, {baseDir: this.base})) {
      await writeFile(this.name, JSON.stringify({}, void 0, 2))
    }
  }

  private async _write() {
    await writeFile(this.name, JSON.stringify(this.cache, void 0, 2))
  }

  async load() {
    if (this.loaded) {
      return
    }
    await this._create_default()
    let config = await readTextFile(this.name, {baseDir: this.base})
    this.cache = JSON.parse(config)
    this.loaded = true
  }

  async reload() {
    await this._create_default()
    let config = await readTextFile(this.name, {baseDir: this.base})
    this.cache = JSON.parse(config)
  }

  async update(key: string, config: Record<string, any>) {
    let keys = key.split(".")
    const deep = (conf: Record<string, any>, key: string | undefined) => {
      if (!key) {
        conf = Object.assign(conf, config)
        return
      }
      if (!conf[key]) conf[key] = {}
      deep(conf[key], keys.shift())
    }
    deep(this.cache, keys.shift())
    await this._write()
  }

  get<T>(key: string) {
    let keys = key.split(".")
    let result = this.cache
    for (let i = 0; i < keys.length; i++) {
      result = result[keys[i]]
      if (!result) {
        return result as T
      }
    }
    return result as T
  }
}