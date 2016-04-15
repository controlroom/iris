/**
 * Domain data mutators
 * @module iris/Affect
 */

import { IStore }            from "./Store"
import { ICursor }           from "./Cursor"
import { build, implement }  from "./mixin"
import { registerReducer }   from "./reducer"

let IAffect = (superclass) => {

  /**
   * @alias IAffect
   * @mixin
   * @mixes IStore
   * @mixes ICursor
   */
  class Affect extends superclass {
    /**
     * @returns {Object}
     */
    replace(value) {
      return this.dispatch({
        type: "SET_STATE",
        path: this.path,
        data: value
      })
    }

    /**
     * @returns {Object}
     */
    set(path, value) {
      return this.traverse(path).replace(value)
    }

    /**
     * @returns {Object}
     */
    swap(fn) {
      return this.dispatch({
        type: "UPDATE_STATE",
        path: this.path,
        fn
      })
    }

    /**
     * @returns {Object}
     */
    update(key, fn) {
      return this.traverse(key).swap(fn)
    }

    /**
     * @returns {Object}
     */
    merge (data) {
      return this.dispatch({
        type: "MERGE_STATE",
        path: this.path,
        data
      })
    }

    /**
     * @returns {Object}
     */
    mergeIn (path, data) {
      return this.traverse(path).merge(data)
    }

    /**
     * @returns {Object}
     */
    copy(from, to) {
      return this.dispatch({
        type: "COPY_STATE",
        from: this.appendPath(from),
        to:   this.appendPath(to)
      })
    }
  }

  return Affect
}

IAffect = implement(IStore, ICursor)(IAffect)
export { IAffect }

registerReducer({
  SET_STATE:    (state, {path, data}) => state.setIn(path, data),
  UPDATE_STATE: (state, {path, fn})   => state.updateIn(path, fn),
  MERGE_STATE:  (state, {path, data}) => state.mergeDeepIn(path, data),
  COPY_STATE:   (state, {from, to})   => state.setIn(to, state.getIn(from))
})
