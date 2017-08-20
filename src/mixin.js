/**
 * module containing all functionality for implementing iris mixins
 * @module iris/mixin
 */

import { OrderedSet, List, Map } from "immutable"
import { log }                   from "./utils"

let implementBase

/**
 * MixinResolver
 * used internally to extract and resolve mixin dependencies for classes.
 *
 * @private
 */
class MixinResolver {
  constructor(base) {
    this.base = base
    this.checkForBase()
    this.resolve()
  }

  checkForBase() {
    if (this.base.name === "implementBase") {
      const anon = (superclass) => class Anonymous extends superclass {}
      this.base = this.base(anon)
    }
  }

  /**
   * resolve
   *
   * Builds a resolve path that first finds all dependencies for
   * mixins, combines based on load path order, then resolves bottom
   * up to form the final mixin class path.
   *
   * @returns {void}
   */
  resolve() {
    const resolver = (current, coll) => {
      return current.reduce((coll, klass) => {
        if (klass.__iris_implemented)
          return resolver(klass.__iris_implemented, coll.push(klass))
        return coll.push(klass)
      }, coll)
    }
    const baseDep = this.base.__iris_implemented
    if (baseDep) {
      const allDeps   = resolver(baseDep, List([this.base]))
      const cleanDeps = OrderedSet(allDeps.reverse()).toList()
      this.path       = cleanDeps
    } else {
      this.path = List([this.base])
    }
  }

  buildResolvedClass() {
    const klass = this.path.reduce((c, mix) => {
      return mix(c)
    }, Metal)
    klass.__iris_implements = ancestors(klass)
    return klass
  }
}

const ancestors = (klass) => {
  const back = (list, current) => {
    const p = Object.getPrototypeOf(current)
    if(p === Metal) {
      return list.add(p.name)
    } else {
      return back(list.add(p.name), p)
    }
  }

  return back(OrderedSet([klass.name]), klass)
}

/**
 * Metal
 * mixed into the root position of all mixed in classes. Adds helper
 * functionality.
 */
export class Metal {
  constructor(opts = Map()) {
    this.opts = opts
  }

  /**
   * isImplemented
   * returns boolean if interface has been mixed into current class
   *
   * @param _interface
   */
  isImplemented(_interface) {
    return this.ancestors.has(_interface)
  }

  static isImplemented(_interface) {
    return this.ancestors.has(_interface)
  }

  static get ancestors() {
    return this.__iris_implements
  }

  get ancestors() {
    return this.constructor.ancestors
  }
}


/**
 * implement
 *
 * @param {function}[classes]
 * @returns {undefined}
 */
const implement = (...classes) => {
  function implementBase (base) {
    if(base.__iris_implemented) {
      log("error", "Your implementation has already been implemented")
    }

    let newBase = base.bind({})
    newBase.__iris_implemented = classes
    return newBase
  }

  return implementBase
}

/**
 * build
 *
 * @param klass
 * @returns {undefined}
 */
const build = klass => {
  let resolver = new MixinResolver(klass)
  return resolver.buildResolvedClass()
}

/**
 * emptyImpl
 *
 * Provide a simple base for implementation functions
 *
 * @returns {fn}
 */
const emptyImpl = () => (superclass) => {
  return class Impl extends superclass { }
}

export { MixinResolver, build, implement, emptyImpl }
