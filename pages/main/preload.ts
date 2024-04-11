import ConfigManager from "~utils/config";
import ShortcutManager from "~utils/shortcut.ts";
import CacheManager from "~utils/cache";
import {appConfigDir} from "@tauri-apps/api/path";
import {exists, mkdir} from "@tauri-apps/plugin-fs";

export default async function () {
  let app_config_dir = await appConfigDir()
  if (!await exists(app_config_dir)) {
    await mkdir(app_config_dir)
  }

  let configManager = new ConfigManager()
  let shortcutManager = new ShortcutManager()
  let cacheManager = new CacheManager()

  await configManager.load()
  await shortcutManager.load()
  await cacheManager.load()
}