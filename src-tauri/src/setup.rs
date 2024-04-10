use tauri::{
  image::Image,
  menu::{MenuBuilder, MenuItemBuilder},
  path::BaseDirectory,
  tray::{ClickType, TrayIconBuilder},
  App, Manager,
};

#[derive(Debug, serde::Deserialize)]
struct TooltipPayload {
  name: String,
  chapter: u32,
  line: u32,
}

pub fn setup(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
  let path = app
      .path()
      .resolve("icons/icon.ico", BaseDirectory::Resource)?;

  let quit = MenuItemBuilder::with_id("quit", "退出").build(app).unwrap();
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
      .items(&[&reload, &select, &setting, &quit])
      .build()?;
  let tray = TrayIconBuilder::new()
      .icon(Image::from_path(path).unwrap())
      .menu(&menu)
      .on_menu_event(move |app, event| match event.id().as_ref() {
        "quit" => app.exit(0),
        "select" => app.emit("select", ()).unwrap(),
        "reload" => app.emit("reload", ()).unwrap(),
        "setting" => {
          let setting = app.get_webview_window("setting");
          match setting {
            Some(setting_window) => {
              let visible = setting_window.is_visible().unwrap();
              if visible {
                setting_window.hide().unwrap();
              } else {
                setting_window.show().unwrap()
              };
            }
            None => {
              let _ = tauri::WebviewWindowBuilder::new(
                app,
                "setting",
                tauri::WebviewUrl::App("/pages/config/index.html".into()),
              )
                  .fullscreen(false)
                  .resizable(false)
                  .inner_size(540.0, 400.0)
                  .center()
                  .decorations(false)
                  .transparent(true)
                  .shadow(false)
                  .skip_taskbar(false)
                  .always_on_top(false)
                  .build()
                  .unwrap();
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
    let tooltip = format!(
      "书名: {}\n章节: {}\n行数: {}",
      data.name, data.chapter, data.line
    );
    tray.set_tooltip(Some(tooltip)).unwrap();
  });

  Ok(())
}
