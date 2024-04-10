import {register, isRegistered, unregister} from "@tauri-apps/plugin-global-shortcut"
import Emitter from "./emit";
import ConfigManager from "./config";

export default class ShortcutManager extends Emitter {
  shortcut: Map<string, string> = new Map()
  config: ConfigManager = new ConfigManager();

  static instance: ShortcutManager

  constructor() {
    super()
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = this
      this.config.on<Partial<Config>>("update", (config) => {
        if (config.shortcut) {
          for (const key in config.shortcut) {
            this.shortcut.set(key, config.shortcut[key])
            this.update(key, config.shortcut[key])
          }
        }
      })
      return this
    }
    return ShortcutManager.instance
  }

  private async register() {
    this.shortcut.forEach(async (shortcut, key) => {
      let is_register = await isRegistered(shortcut)
      if (!is_register) {
        await register(shortcut, () => {
          this.emit(key)
        })
      } else {
        console.warn("shotcut: ", shortcut, " has been registered by other app already");
      }
    })
  }

  private async unregister() {
    this.shortcut.forEach(async (shortcut, _) => {
      let is_register = await isRegistered(shortcut)
      if (is_register) {
        try {
          await unregister(shortcut)
        } catch (error) {
          console.warn(error);
        }
      }
    })
  }

  private parse() {
    let shortcut = this.config.get<ShortcutConfig>("shortcut") || {}
    for (const key in shortcut) {
      this.shortcut.set(key, shortcut[key])
    }
  }

  async load() {
    this.parse()
    this.register()
  }

  async reload() {
    this.unregister()
    this.parse()
    this.register()
  }

  async update(key: string, newShortcut: string) {
    if (!this.shortcut.has(key)) {
      this.shortcut.set(key, newShortcut)
    } else {
      let oldShortcut = this.shortcut.get(key)!
      await unregister(oldShortcut)
    }
    await register(newShortcut, () => {
      this.emit(key)
    })
  }

  async destroy() {
    await this.unregister()
  }
}