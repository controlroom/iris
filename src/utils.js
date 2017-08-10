import { Map, fromJS } from "immutable"

/**
 * ensureArray
 *
 * @param {(array|string|null)} val
 * @returns {Array}
 */
export const ensureArray = vals => {
  if( vals == null) return []
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

/**
 * merge
 * Merge together objects
 *
 * @param {obj[]} objs
 * @returns {obj}
 */
export const merge = (...objs) => Object.assign(...objs)


/**
 * createNSActions
 * create object with namespaced values based on passed in list
 *
 * @param {string[]} objs
 * @returns {obj}
 */
export const createNSActions = (namespace, ...constants) => {
  return constants.reduce((acc, constant) => {
    acc[constant] = "Iris." + namespace + "/" + constant;
    return acc;
  }, {});
}

/**
 * log
 * Simple logging helper object
 *
 * @param {string} level
 * @param {string[]} message
 * @returns {void}
 */
export const log = (level, ...message) => {
  if (process.env.NODE_ENV !== "production") {
    console[level](...message);
  }
}
