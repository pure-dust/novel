use std::fs::{metadata, remove_dir, remove_file};
use std::path::Path;

#[tauri::command(async)]
pub fn remove(path: String) -> bool {
  if Path::new(&path).exists() {
    if metadata(String::from(&path)).unwrap().is_dir() {
      remove_dir(String::from(&path)).is_ok()
    } else {
      remove_file(String::from(path)).is_ok()
    }
  } else {
    false
  }
}