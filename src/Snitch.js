/**
 * Data access listener
 * @module iris/Snitch
 */

import { checkOpts } from "./utils"
import { IAccess }   from "./Access"
import { implement } from "./mixin"
import { Set }       from "immutable"

let ISnitch = (superclass) => {
  class Snitch extends superclass {
    constructor(raw) {
      const opts = checkOpts(raw)
      super(opts)
      this._snitch = opts.get("snitch")
    }

    resetSnitch() {
      return this.constructor(this.opts.set("snitch", Set()))
    }

    get snitch() {
      return this._snitch
    }

    addToSnitch(path) {
      if(this.snitch) {
        this._snitch = this._snitch.add(path)
      }
    }

    get data() {
      this.addToSnitch(this.path)
      return super.data
    }

    getInRoot(path) {
      this.addToSnitch(path)
      return super.getInRoot(path)
    }

    getIn(path) {
      this.addToSnitch(this.appendPath(path))
      return super.getIn(path)
    }
  }

  return Snitch
}

ISnitch = implement(IAccess)(ISnitch)

export { ISnitch }
