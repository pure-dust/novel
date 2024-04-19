export default class LoopQueue<T> {
  private readonly origin: T[]
  private current: number = -1

  constructor(init: T[]) {
    this.origin = init
  }

  next() {
    this.current++
    if (this.current > this.origin.length - 1) {
      this.current = 0
    }
    return this.origin[this.current]
  }

  prev() {
    this.current--
    if (this.current < 0) {
      this.current = this.origin.length - 1
    }
    return this.origin[this.current]
  }

  insert(data: T, index?: number) {
    this.origin.splice(index || this.origin.length - 1, 0, data)
  }

  remove(index: number) {
    this.origin.slice(index, 1)
  }
}