import { Map, fromJS } from "immutable"

/**
 * ensureArray
 *
 * @param {(array|string)} val
 * @returns {Array}
 */
export const ensureArray = vals => {
  return Array.isArray(vals) ? vals : [vals]
}

/**
 * ensureImmutable
 *
 * @param {(array|string|List)} val
 * @returns {List}
 */
export const ensureImmutable = val => {
  return Array.isArray(val) ? fromJS(val) : val
}

/**
 * isImplemented
 * helper to check if class has mixed in a specific interface
 *
 * @param {object} v
 * @param {string} type
 * @returns {boolean}
 */
export const isImplemented = (v, type) => {
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


/**
 * delegate
 * Delegate function calls (fns) to delegator of klass
 *
 * @param {function} klass
 * @param {string} delegator
 * @param {string[]} fns
 * @returns {void}
 */
export const delegate = (klass, delegator, fns) => {
  fns.forEach(fn => {
    klass.prototype[fn] = function(...args) {
      return this[delegator][fn](...args)
    }
  })
}
