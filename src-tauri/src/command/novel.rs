use regex::Regex;
use std::{
  collections::HashMap,
  fs::File,
  io::{BufRead, BufReader},
  path::Path,
  sync::{Arc, Mutex},
};

fn get_filename(url: &str) -> Option<String> {
  Path::new(&url)
      .file_name()
      .and_then(|name| name.to_str().and_then(|name| Some(name.to_string())))
}

struct Novel {
  title: String,
  path: String,
  content: HashMap<String, String>,
  chapter: Vec<String>,
}

impl Novel {
  pub fn new() -> Arc<Mutex<Novel>> {
    static mut INSTANCE: Option<Arc<Mutex<Novel>>> = None;
    unsafe {
      INSTANCE
          .get_or_insert_with(|| {
            Arc::new(Mutex::new(Novel {
              title: String::from(""),
              path: String::from(""),
              content: HashMap::new(),
              chapter: Vec::new(),
            }))
          })
          .clone()
    }
  }

  pub fn decode(&mut self, path: String) {
    self.chapter.clear();
    self.content.clear();
    let title = get_filename(&path).unwrap_or_default();
    self.path = path.clone();
    self.title = title;
    let regex = Regex::new(r"第[零一二三四五六七八九十百千万0-9]+章[\s|：]*[?s:.]*").unwrap();
    let file = File::open(path);
    let mut title = String::from("");
    let mut chapter = String::from("");
    match file {
      Ok(file) => {
        let reader = BufReader::new(file);
        for line in reader.lines() {
          match line {
            Ok(content) => {
              if regex.is_match(&content) {
                if title.is_empty() {
                  title = format!("{}\n", content);
                } else if !chapter.is_empty() {
                  self.content.insert(title.clone(), chapter.clone());
                  self.chapter.push(title.clone());
                  title = format!("{}\n", content);
                  chapter.clear();
                }
              } else if !title.is_empty() {
                chapter.push_str(&format!("{}\n", content));
              }
            }
            Err(_err) => (),
          }
        }
      }
      Err(_err) => (),
    }
    if !title.is_empty() && !chapter.is_empty() {
      self.chapter.push(title.clone());
      self.content.insert(title, chapter);
    }
  }

  pub fn chapter(&self) -> Vec<String> {
    self.chapter.clone()
  }

  pub fn single(&self, title: String) -> String {
    self.content.get(&title).unwrap().to_string()
  }
}

#[tauri::command(async)]
pub fn init(path: String) -> Vec<String> {
  let instance = Novel::new();
  let mut novel = instance.lock().unwrap();
  novel.decode(path);
  novel.chapter()
}

#[tauri::command]
pub fn chapter(title: String) -> String {
  let instance = Novel::new();
  let novel = instance.lock().unwrap();
  novel.single(title)
}

