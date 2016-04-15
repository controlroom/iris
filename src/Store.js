/**
 * data persistance and retrevial core
 * @module iris/Store
 */

import { Map }        from "immutable"
import { checkOpts }  from "./utils"

const IStore = (superclass) => {

  /**
   * @alias IStore
   * @mixin
   */
  class Store extends superclass {
    /**
     * constructor
     *
     * @private
     */
    constructor(raw) {
      const opts  = checkOpts(raw, ["store"], "IStore")
      const state = opts.get("state")
      const store = opts.get("store")
      const storeOpts = state ? opts : opts.set("state", store.getState())
      super(storeOpts)
      this._store = opts.get("store")
      this._state = storeOpts.get("state")
    }

    /**
     * state
     *
     * @type {Map}
     */
    get state() {
      return this._state
    }

    /**
     * store
     *
     * @type {Store}
     */
    get store() {
      return this._store
    }

    /**
     * updateState
     *
     * @returns {Class}
     */
    updateState() {
      return new this.constructor(
        this.opts.merge({
          state: this.store.getState()
        })
      )
    }

    /**
     * dispatch
     *
     * @param {Object} action
     * @returns {Object} action results
     */
    dispatch(action) {
      return this.store.dispatch(action)
    }
  }

  return Store
}

export { IStore }
