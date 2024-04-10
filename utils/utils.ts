import {BaseDirectory} from "@tauri-apps/api/path"
import {create, exists, writeTextFile} from "@tauri-apps/plugin-fs"


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

function easeInOutSine(value: number) {
  return -(Math.cos(Math.PI * value) - 1) / 2
}

export function logScale(data: Uint8Array) {
  let tmp = []
  let length = data.length
  let maxLog = Math.log(length)
  let step = maxLog / length
  for (let i = 0; i < length; i++) {
    let dataIndex = Math.floor(Math.exp(step * i))
    tmp.push(Math.floor(data[dataIndex]))
  }

  return tmp
}

export function interpolate(data: Uint8Array | Array<number>) {
  let halfwayPoint = Math.floor(data.length / 4)
  let firstHalf = data.slice(0, halfwayPoint * 3)
  let secondHalf = data.slice(halfwayPoint * 3)

  let output = []
  let group = [firstHalf[0]]

  for (let i = 0; i < firstHalf.length; i++) {
    if (firstHalf[i] != group[0]) {
      if (group[0] === 0) {
        output.push(...group)
      } else {
        let step = 1 / group.length
        let difference = firstHalf[i] - group[0]

        for (let j = 0; j < group.length; j++) {
          let value = group[0] + difference * easeInOutSine(step * j)
          output.push(Math.floor(value))
        }
      }

      group = [firstHalf[i]]
    } else {
      group.push(firstHalf[i])
    }

  }

  for (let i = 0; i < group.length; i++) {
    let value = group[0]
    output.push(value)
  }
  return [...output, ...secondHalf]
}

export function filename(path: string) {
  let reg = /[\\|/]/
  return path.split(reg).at(-1)?.split(".")?.[0] || path
}

export async function writeFile(path: string, data: string, baseDir = BaseDirectory.AppConfig) {
  if (!await exists(path, {baseDir})) {
    await create(path, {baseDir})
  }
  await writeTextFile(path, data, {baseDir})
}