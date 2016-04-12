/**
 * basic state retrieval and mutation
 * @module iris/Data
 */

import { IStore }            from "./Store"
import { ICursor }           from "./Cursor"
import { build, implement }  from "./mixin"
import { registerReducer }   from "./reducer"

let IData = (superclass) => class Data extends superclass {
  //---  Accessors  ------------------------------------------------------------
  get data() {
    return this.state.getIn(this.path)
  }

  getInRoot(path) {
    return this.state.getIn(path)
  }

  getIn(path) {
    return this.state.getIn(this.appendPath(path))
  }

  //---  Modifiers  ------------------------------------------------------------
  replace(value) {
    return this.dispatch({
      type: "SET_STATE",
      path: this.path,
      data: value
    })
  }

  set(path, value) {
    return this.traverse(path).replace(value)
  }

  swap(fn) {
    return this.dispatch({
      type: "UPDATE_STATE",
      path: this.path,
      fn
    })
  }

  update(key, fn) {
    return this.traverse(key).swap(fn)
  }

  merge (data) {
    return this.dispatch({
      type: "MERGE_STATE",
      path: this.path,
      data
    })
  }

  mergeIn (path, data) {
    return this.traverse(path).merge(data)
  }

  copy(from, to) {
    return this.dispatch({
      type: "COPY_STATE",
      from: this.appendPath(from),
      to:   this.appendPath(to)
    })
  }
}

IData = implement(IStore, ICursor)(IData)

export { IData }
export default build(IData)

registerReducer({
  SET_STATE:    (state, {path, data}) => state.setIn(path, data),
  UPDATE_STATE: (state, {path, fn})   => state.updateIn(path, fn),
  MERGE_STATE:  (state, {path, data}) => state.mergeDeepIn(path, data),
  COPY_STATE:   (state, {from, to})   => state.setIn(to, state.getIn(from))
})
