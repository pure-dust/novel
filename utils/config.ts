import {BaseDirectory} from "@tauri-apps/api/path"
import {exists, readTextFile} from "@tauri-apps/plugin-fs"

// @ts-ignore
import default_config from "~assets/default"
import {merge, writeFile} from "./utils"
import Emitter from "./emit"
import {listen} from "@tauri-apps/api/event";

export default class ConfigManager extends Emitter {
  base = BaseDirectory.AppConfig
  private config: Config = default_config
  private name = "config.json"

  static instance: ConfigManager

  constructor() {
    super()
    if (!ConfigManager.instance) {
      ConfigManager.instance = this
      // noinspection JSIgnoredPromiseFromCall
      listen<Partial<Config>>("config-update", ({payload: config}) => {
        this.update(config)
      })
      return this
    }
    return ConfigManager.instance
  }

  private async default() {
    if (!await exists(this.name, {baseDir: BaseDirectory.AppConfig})) {
      await writeFile(this.name, JSON.stringify(default_config, void 0, 2))
    }
  }

  private async write() {
    await writeFile(this.name, JSON.stringify(this.config, void 0, 2))
  }

  private update(config: Partial<Config>) {
    this.config = merge<Config>(this.config, config)
    this.write().then(() => {
      this.emit("update", config)
    })
  }

  async load() {
    await this.default()
    let config = await readTextFile(this.name, {baseDir: this.base})
    this.config = JSON.parse(config)
  }

  async reload() {
    await this.default()
    let config = await readTextFile(this.name, {baseDir: this.base})
    this.config = JSON.parse(config)
  }


  get<T>(key?: string) {
    if (!key) {
      return this.config as T
    }
    let keys = key.split(".")
    let result = this.config
    for (let i = 0; i < keys.length; i++) {
      result = result[keys[i]]
      if (!result) {
        return result as T
      }
    }
    return result as T
  }
}