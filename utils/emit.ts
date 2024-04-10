type Callback<T> = (param: T) => void


export default class Emitter {

  private _events: Map<string, Array<Function>> = new Map()

  constructor() {
  }

  on<T>(event: string, cb: Callback<T>) {
    if (!this._events.has(event)) {
      this._events.set(event, [])
    }
    this._events.get(event)!.push(cb)
  }

  once<T>(event: string, cb: Callback<T>) {
    let wrap = (param: T) => {
      cb(param)
      this.off(event, wrap)
    }
    this.on(event, wrap)
  }

  off(event: string, cb: Function) {
    if (!this._events.has(event)) {
      return
    }
    this._events.set(event, this._events.get(event)!.filter(callback => callback !== cb))
  }

  emit(event: string, ...params: any[]) {
    this._events.get(event)?.forEach(cb => {
      cb(...params)
    })
  }
}

