/**
 * data persistance and retrevial core
 * @module iris/Store
 */

import { Map }        from "immutable"
import { checkOpts }  from "./utils"

const IStore = (superclass) => class Store extends superclass {
  constructor(raw) {
    const opts  = checkOpts(raw, ["store"], "IStore")
    const state = opts.get("state")
    const store = opts.get("store")
    const storeOpts = state ? opts : opts.set("state", store.getState())
    super(storeOpts)
    this.store = opts.get("store")
    this.state = storeOpts.get("state")
  }

  updateState() {
    return new this.constructor(this.opts.set("state", this.store.getState()))
  }

  dispatch(action) {
    return this.store.dispatch(action)
  }
}

export { IStore }
