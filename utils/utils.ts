import {BaseDirectory} from "@tauri-apps/api/path"
import {create, exists, writeTextFile} from "@tauri-apps/plugin-fs"

type MergeObject =
    Record<string, string | number | boolean | Function | Array<MergeObject> | MergeObject>
    | Array<MergeObject>

export async function request<T>(url: string, type?: XMLHttpRequestResponseType) {
  return new Promise<T>((resolve, reject) => {
    let XHR = new XMLHttpRequest()
    XHR.responseType = type || "json"
    XHR.onload = () => {
      return resolve(XHR.response)
    }
    XHR.onerror = () => {
      return reject()
    }
    XHR.open("get", url)
    XHR.send()
  })
}

export async function writeFile(path: string, data: string, baseDir = BaseDirectory.AppConfig) {
  if (!await exists(path, {baseDir})) {
    await create(path, {baseDir})
  }
  await writeTextFile(path, data, {baseDir})
}

export function filename(path: string) {
  let reg = /[\\|/]/
  return path.split(reg).at(-1)?.split(".")?.[0] || path
}

export function merge<T extends MergeObject>(target: MergeObject, source: MergeObject) {
  for (const key in source) {
    if (typeof target[key] === "undefined") {
      target[key] = source[key]
    } else if (["number", "string", "boolean", "function"].includes(typeof source[key])) {
      target[key] = source[key]
    } else {
      merge(target[key], source[key])
    }
  }
  return target as T
}