use std::fmt::Debug;
use std::process::Command;

use tauri::menu::SubmenuBuilder;
use tauri::{
  image::Image,
  menu::{MenuBuilder, MenuItemBuilder},
  path::BaseDirectory,
  tray::{ClickType, TrayIconBuilder},
  App, Manager, PhysicalSize,
};


use crate::command::Novel;

#[derive(Debug, serde::Deserialize)]
struct TooltipPayload {
  name: String,
  chapter: usize,
  line: usize,
}

fn exec_command(command_str: &[&str]) {
  let _ = if cfg!(target_os = "windows") {
    Command::new("cmd").arg("/c").args(command_str).output().expect("exec command failed")
  } else {
    Command::new("sh").arg("-c").args(command_str).output().expect("exec command failed")
  };
}

pub fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
  let _ = tauri::WebviewWindowBuilder::new(
    app,
    "main",
    tauri::WebviewUrl::App("/pages/main/index.html".into()),
  )
    .fullscreen(false)
    .resizable(false)
    .inner_size(400.0, 24.0)
    .decorations(false)
    .transparent(true)
    .shadow(false)
    .skip_taskbar(true)
    .always_on_top(true)
    .build();

  let path = app
    .path()
    .resolve("icons/icon.ico", BaseDirectory::Resource)?;

  let quit = MenuItemBuilder::with_id("quit", "退出").build(app).unwrap();
  let config = SubmenuBuilder::new(app.handle(), "配置文件").items(&[
    &MenuItemBuilder::with_id("vscode_config", "使用vscode打开").build(app).unwrap(),
    &MenuItemBuilder::with_id("notepad_config", "使用记事本打开").build(app).unwrap(),
    &MenuItemBuilder::with_id("config_dir", "打开文件目录").build(app).unwrap()
  ]).build().unwrap();
  let cache = SubmenuBuilder::new(app.handle(), "缓存文件").items(&[
    &MenuItemBuilder::with_id("vscode_cache", "使用vscode打开").build(app).unwrap(),
    &MenuItemBuilder::with_id("notepad_cache", "使用记事本打开").build(app).unwrap(),
    &MenuItemBuilder::with_id("cache_dir", "打开文件目录").build(app).unwrap()
  ]).build().unwrap();
  let select = MenuItemBuilder::with_id("select", "选择书籍")
    .build(app)
    .unwrap();
  let reload = MenuItemBuilder::with_id("reload", "重载")
    .build(app)
    .unwrap();
  let setting = MenuItemBuilder::with_id("setting", "设置")
    .build(app)
    .unwrap();
  let menu = MenuBuilder::new(app)
    .items(&[&reload, &select, &setting, &config, &cache, &quit])
    .build()?;
  let tray = TrayIconBuilder::new()
    .icon(Image::from_path(path).unwrap())
    .menu(&menu)
    .on_menu_event(move |app, event| match event.id().as_ref() {
      "quit" => app.exit(0),
      "select" => app.emit("select", ()).unwrap(),
      "reload" => app.emit("reload", ()).unwrap(),
      "vscode_config" => {
        let path = app.path().app_config_dir().unwrap().join("config.json");
        exec_command(&["code", path.to_str().unwrap()])
      }
      "notepad_config" => {
        let path = app.path().app_config_dir().unwrap().join("config.json");
        exec_command(&["notepad", path.to_str().unwrap()])
      }
      "vscode_cache" => {
        let path = app.path().app_config_dir().unwrap().join("cache");
        exec_command(&["code", path.to_str().unwrap()])
      }
      "notepad_cache" => {
        let path = app.path().app_config_dir().unwrap().join("cache");
        exec_command(&["notepad", path.to_str().unwrap()])
      }
      "config_dir" => {
        let path = app.path().app_config_dir().unwrap();
        exec_command(&["start", path.to_str().unwrap()])
      }
      "cache_dir" => {
        let path = app.path().app_config_dir().unwrap();
        exec_command(&["start", path.to_str().unwrap()])
      }
      "setting" => {
        match app.get_webview_window("setting") {
          Some(setting_window) => {
            let visible = setting_window.is_visible().unwrap();
            if visible {
              setting_window.hide().unwrap();
            } else {
              setting_window.show().unwrap()
            };
          }
          None => {
            let setting = tauri::WebviewWindowBuilder::new(
              app,
              "setting",
              tauri::WebviewUrl::App("/pages/config/index.html".into()),
            )
              .fullscreen(false)
              .resizable(false)
              .decorations(false)
              .transparent(true)
              .shadow(false)
              .skip_taskbar(false)
              .always_on_top(false)
              .build()
              .unwrap();
            setting.set_size(PhysicalSize::new(540, 400)).unwrap();
            setting.center().unwrap();
          }
        }
        ()
      }
      _ => (),
    })
    .on_tray_icon_event(|tray, event| {
      if event.click_type == ClickType::Left {
        let app = tray.app_handle();
        if let Some(window) = app.get_webview_window("main") {
          let _ = window.show();
          let _ = window.set_focus();
        }
      }
    })
    .build(app)?;

  app.listen("change-tip", move |event| {
    let data: TooltipPayload = serde_json::from_str(event.payload()).unwrap();
    let instance = Novel::new();
    let novel = instance.lock().unwrap();
    let process = (data.chapter as f64 / novel.chapter().len() as f64) * 100.0;
    let tooltip = format!(
      "书名: {}\n章节: {}\n行数: {}\n进度: {}%",
      data.name, data.chapter, data.line, format!("{:.2}", process)
    );
    tray.set_tooltip(Some(tooltip)).unwrap();
  });

  Ok(())
}
