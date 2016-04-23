/**
 * Data access listener
 * @module iris/Snitch
 */

import { checkOpts } from "./utils"
import { IAccess }   from "./Access"
import { implement } from "./mixin"
import { Set }       from "immutable"

let ISnitch = (superclass) => {

  /**
   * @alias ISnitch
   * @mixin
   * @mixes IAccess
   */
  class Snitch extends superclass {
    constructor(raw) {
      const opts = checkOpts(raw)
      super(opts)
      this._snitch = opts.get("snitch")
    }

    /**
     * resetSnitch
     *
     * @param {function} fn
     * @returns {ConstructorClass}
     */
    resetSnitch(fn) {
      return new this.constructor(
        this.opts.set("snitch", fn)
      )
    }

    /**
     * snitch
     *
     * @type {function}
     */
    get snitch() {
      return this._snitch
    }

    /**
     * addToSnitch
     *
     * @param {(string[]|string)} path
     * @returns {void}
     */
    addToSnitch(path) {
      if(this.snitch) {
        this._snitch(path)
      }
    }

    /**
     * data
     *
     * @augments IAccess
     */
    get data() {
      this.addToSnitch(this.path)
      return super.data
    }

    /**
     * getInRoot
     *
     * @augments IAccess
     */
    getInRoot(path) {
      this.addToSnitch(path)
      return super.getInRoot(path)
    }

    /**
     * getIn
     *
     * @augments IAccess
     */
    getIn(path) {
      this.addToSnitch(this.appendPath(path))
      return super.getIn(path)
    }
  }

  return Snitch
}

ISnitch = implement(IAccess)(ISnitch)

export { ISnitch }
