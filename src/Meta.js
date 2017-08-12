/**
 * Allow storing non-domain data (and flags!)
 *
 * @module iris/Meta
 */

import { IAccess }         from "./Access"
import { IAffect }         from "./Affect"
import { implement }       from "./mixin"
import { Set }             from "immutable"
import { registerReducer } from "./reducer"
import { META_KEY }        from "./constants"

import { ensureArray, createNSActions } from "./utils"

const {
  ADD_FLAGS,
  REMOVE_FLAGS,
  TOGGLE_FLAGS,
} = createNSActions("Meta",
  "ADD_FLAGS", "REMOVE_FLAGS", "TOGGLE_FLAGS"
)

let IMeta = (superclass) => {
  const metaPath = (ctx) => {
    const path = ctx.metaPath ? ensureArray(ctx.metaPath) : []
    return ctx.appendPath(META_KEY).concat(path)
  }

  const extractFlags = (ctx, keyPath) => {
    const flags = ensureArray(keyPath.pop())
    keyPath     = (keyPath.length == 0) ? ["flags"] : keyPath
    return [flags, metaPath(ctx).concat(keyPath)]
  }

  const flagDispatch = (ctx, type, keyPath) => {
    const [flags, path] = extractFlags(ctx, keyPath)
    return ctx.dispatch({type, path, flags})
  }

  class Meta extends superclass {
    get meta() {
      return this.traverse(META_KEY)
    }

    //---  Flagging  -------------------------------------------------------------
    flag(...keyPath) {
      flagDispatch(this, ADD_FLAGS, keyPath)
    }

    unFlag(...keyPath) {
      flagDispatch(this, REMOVE_FLAGS, keyPath)
    }

    toggleFlag(...keyPath) {
      flagDispatch(this, TOGGLE_FLAGS, keyPath)
    }

    isFlagged(...keyPath) {
      const [flags, path] = extractFlags(this, keyPath)
      const flagSet       = this.getInRoot(path)
      if(!flagSet) return false
      return flags.every(flag => flagSet.has(flag))
    }
  }

  return Meta
}

IMeta = implement(IAccess, IAffect)(IMeta)

export { IMeta }

const updateSet = (state, path, fn) =>
  state.updateIn(path, f => fn(f || Set()))

registerReducer({
  [ADD_FLAGS]: (state, {path, flags}) => {
    return updateSet(state, path, set => set.concat(flags))
  },
  [REMOVE_FLAGS]: (state, {path, flags}) => {
    return updateSet(state, path, set => set.subtract(flags))
  },
  [TOGGLE_FLAGS]: (state, {path, flags}) => {
    return updateSet(state, path, set => {
      const toRemove = set.intersect(flags)
      const toAdd    = Set(flags).subtract(toRemove)
      return set.subtract(toRemove).union(toAdd)
    })
  }
})
