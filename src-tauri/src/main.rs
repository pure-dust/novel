// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod command;
mod setup;

use tauri::generate_handler;

use command::{chapter, init, remove, request};

fn main() {
  tauri::Builder::default()
      .invoke_handler(generate_handler![init, chapter, request, remove])
      .plugin(tauri_plugin_single_instance::init(|_, _, _| {}))
      .plugin(tauri_plugin_shell::init())
      .plugin(tauri_plugin_fs::init())
      .plugin(tauri_plugin_dialog::init())
      .plugin(tauri_plugin_global_shortcut::Builder::new().build())
      .plugin(tauri_plugin_window_state::Builder::default().build())
      .setup(setup::setup)
      .run(tauri::generate_context!())
      .expect("error while running tauri application");
}
