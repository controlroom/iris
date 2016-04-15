import { Map, fromJS } from "immutable"

export const ensureArray     = (vals) => Array.isArray(vals) ? vals : [vals]
export const ensureImmutable = (val)  => Array.isArray(val) ? fromJS(val) : val
export const isImplemented   = (v, type) => {
  return (v && typeof v == "object" && "isImplemented" in v && v.isImplemented(type))
}

/**
 * checkOpts
 * Pass along optional required keys, and convert to immutable map from
 * javascript object
 *
 * example:
 * checkOpts(raw, ["favorite"], "ClassName")
 *
 * Instanciating a class will fail if a favorite key is missing from the passed
 * in options object/Map. "ClassName" is only for informational purposes of the
 * check fails.
 *
 * @param opts
 * @param {string} items
 * @param {string} type
 * @returns {Map}
 */
export const checkOpts = (opts, items = [], type) => {
  const ensuredMap = Map.isMap(opts) ? opts : Map(opts)
  items.forEach(item => {
    if(!ensuredMap.has(item)) throw new Error(`${type} mixin requires ${item} in options`)
  })
  return ensuredMap
}


export const delegate = (klass, fns) => {
  fns.forEach(fn => {
    klass.prototype[fn] = function(...args) {
      return this.items[fn](...args)
    }
  })
}
