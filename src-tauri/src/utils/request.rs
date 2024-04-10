use once_cell::sync::Lazy;
use std::{collections::HashMap, str::FromStr};

use reqwest::{
  header::{HeaderMap, HeaderName},
  Client,
};
use serde_json::{self, Value};

static CLIENT: Lazy<Client> = Lazy::new(|| Client::builder().build().unwrap());

#[tauri::command]
pub async fn request(
  method: String,
  url: String,
  params: HashMap<String, Value>,
  headers: HashMap<String, String>,
) -> Value {
  let mut _headers = HeaderMap::new();
  for (k, v) in headers {
    _headers.insert(
      HeaderName::from_str(&k.to_string()).unwrap(),
      v.parse().unwrap(),
    );
  }
  let response = match method.to_uppercase().as_str() {
    "GET" => get(url, params, _headers).await,
    "POST" => post(url, params, _headers).await,
    _ => get(url, params, _headers).await,
  };
  response.unwrap_or(Value::Null)
}

async fn get(
  url: String,
  params: HashMap<String, Value>,
  headers: HeaderMap,
) -> Result<Value, reqwest::Error> {
  let mut query = vec![];
  for (k, v) in params {
    query.push((k, v))
  }
  Ok(CLIENT
      .get(url)
      .query(&query)
      .headers(headers)
      .send()
      .await?
      .json::<Value>()
      .await?)
}

async fn post(
  url: String,
  params: HashMap<String, Value>,
  headers: HeaderMap,
) -> Result<Value, reqwest::Error> {
  Ok(CLIENT
      .post(url)
      .json(&params)
      .headers(headers)
      .send()
      .await?
      .json::<Value>()
      .await?)
}
