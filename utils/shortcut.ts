import {register, isRegistered, unregister} from "@tauri-apps/plugin-global-shortcut"
import Emitter from "./emit";
import ConfigManager from "./config";
import {emit} from "@tauri-apps/api/event";

export default class ShortcutManager extends Emitter {
  shortcut: Map<string, string> = new Map()
  config: ConfigManager = new ConfigManager();

  static instance: ShortcutManager

  constructor() {
    super()
    if (!ShortcutManager.instance) {
      ShortcutManager.instance = this
      this.config.on<Partial<Config>>("update", (config) => {
        if (config.shortcut && Object.keys(config).length === 1) {
          for (const key in config.shortcut) {
            // noinspection JSIgnoredPromiseFromCall
            this.update(key, config.shortcut[key])
          }
        }
      })
      return this
    }
    return ShortcutManager.instance
  }

  private async register() {
    this.shortcut.forEach((shortcut, key) => {
      isRegistered(shortcut).then((is_register) => {
        if (!is_register) {
          register(shortcut, () => {
            this.emit(key)
          })
        } else {
          console.warn("shortcut: ", shortcut, " has been registered by other app already");
        }
      })

    })
  }

  private async unregister() {
    this.shortcut.forEach((shortcut, _) => {
      isRegistered(shortcut).then((is_register) => {
        if (is_register) {
          unregister(shortcut).catch(err => {
            console.warn(err);
          })
        }
      })
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
    await this.register()
  }

  async reload() {
    await this.unregister()
    this.parse()
    await this.register()
  }

  async update(key: string, newShortcut: string) {
    if (!this.shortcut.has(key)) {
      this.shortcut.set(key, newShortcut)
    } else {
      let oldShortcut = this.shortcut.get(key)!
      this.shortcut.set(key, newShortcut)
      await unregister(oldShortcut)
    }
    register(newShortcut, () => {
      this.emit(key)
    }).then(() => {
      emit("hotkey-update", key)
    })
  }

  async destroy() {
    await this.unregister()
  }
}

export function parseKey(code: string) {
  let rust_key: string
  let platform_key: string
  if (/shift/ig.test(code)) {
    platform_key = "Shift"
    rust_key = platform_key
  } else if (/control/ig.test(code)) {
    platform_key = "Ctrl"
    rust_key = "CommandOrControl"
  } else if (/command/ig.test(code)) {
    platform_key = "Command"
    rust_key = "CommandOrControl"
  } else if (/alt/ig.test(code)) {
    platform_key = "Alt"
    rust_key = platform_key
  } else if (/option/ig.test(code)) {
    platform_key = "Option"
    rust_key = "Alt"
  } else if (/(key|digit)/ig.test(code)) {
    platform_key = code.replace(/(key|digit)/ig, "")
    rust_key = code
  } else if (/Num/ig.test(code)) {
    platform_key = code.replace(/Divide/ig, "/")
        .replace(/Multiply/ig, "*ig")
        .replace(/Subtract/ig, "-")
        .replace(/Add/ig, "+")
        .replace(/Decimal/ig, ".")
    rust_key = code
  } else {
    rust_key = code
    platform_key = code
  }
  return {platform_key, rust_key}
}

export function decodeKey(code: string) {
  if (code === "CommandOrControl") {
    return "Ctrl"
  } else if (/(key|digit)/ig.test(code)) {
    return code.replace(/(key|digit)/ig, "")
  } else if (/Num/ig.test(code)) {
    return code.replace(/Divide/ig, "/")
        .replace(/Multiply/ig, "*ig")
        .replace(/Subtract/ig, "-")
        .replace(/Add/ig, "+")
        .replace(/Decimal/ig, ".")
  } else {
    return code
  }
}