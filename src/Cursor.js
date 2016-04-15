/**
 * keep track of current nested position
 * @module iris/Cursor
 */

import { build, implement } from "./mixin"
import { Map, List, fromJS } from "immutable"
import { ensureArray, ensureImmutable, checkOpts } from "./utils"

const ICursor = (superclass) => {

  /**
   * @alias ICursor
   * @mixin
   */
  class Cursor extends superclass {
    constructor(raw) {
      const opts = checkOpts(raw)
      super(opts)
      const path   = opts.get("path")
      this.path    = path ? ensureImmutable(path) : List()
      this.history = opts.get("history", List())

      // Replace opts with constructor for history
      this.opts    = opts.set("constructor", this.constructor)
    }

    /**
     * appendPath
     * Returns global path with path argument appended
     *
     * @param path {array|string}
     * @returns {Array}
     */
    appendPath(path) {
      if (path == "" || path == []) return this.path.toJS()
      return this.path.concat(ensureArray(path)).toJS()
    }

    /**
     * prependPath
     * Returns global path with path argument prepended
     *
     * @param path {array|string}
     * @returns {Array}
     */
    prependPath(path) {
      if (path == "" || path == []) return this.path.toJS()
      return ensureArray(path).concat(this.path.toJS())
    }

    //---  Traversal  ------------------------------------------------------------
    /**
     * back
     * Move to previous position in history
     *
     *
     * @returns {ConstructorClass}
     */
    back() {
      const prevHistory = this.history.last()
      const loader      = prevHistory.get("constructor")
      return new loader(prevHistory)
    }

    /**
     * up
     * Move up one position in path
     *
     * @returns {ConstructorClass}
     */
    up() {
      return new this.constructor(
        this.opts.merge({
          path:    this.path.pop(),
          history: this.history.push(this.opts)
        })
      )
    }

    /**
     * go
     * Move relative to root
     *
     * @param path {string.array}
     * @param {function} [constructor]
     * @returns {Cursor}
     */
    go(path, constructor) {
      const loader = constructor || this.constructor
      return new loader(
        this.opts.merge(Map({
          path:    ensureArray(path),
          history: this.history.push(this.opts)
        }))
      )
    }

    /**
     * traverse
     * Move relative to current position
     *
     * @param {(string|string[])} path
     * @param {function} [constructor]
     * @returns {ConstructorClass}
     */
    traverse(path, constructor) {
      const loader = constructor || this.constructor
      return new loader(
        this.opts.merge(Map({
          path:    this.appendPath(path),
          history: this.history.push(this.opts)
        }))
      )
    }
  }

  return Cursor
}

export { ICursor }
