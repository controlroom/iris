/**
 * module containing all functionality for implementing iris mixins
 * @module iris/mixin
 * @flow
 */

import { OrderedSet, List, Map } from "immutable"

class MixinResolver {
  path: List;
  base: Class<any>;

  constructor(base: Class<any>) {
    this.base = base
    this.resolve()
  }

  /**
   * resolve
   *
   * Builds a resolve path that first finds all dependencies for
   * mixins, combines based on load path order, then resolves bottom
   * up to form the final mixin class path.
   *
   * @returns {undefined}
   */
  resolve(): void {
    const resolver = (current, coll) => {
      return current.reduce((coll, klass) => {
        if (klass.__iris_implemented)
          return resolver(klass.__iris_implemented, coll.push(klass))
        return coll.push(klass)
      }, coll)
    }
    const baseDep = this.base.__iris_implemented
    if (baseDep) {
      const allDeps = resolver(baseDep, List([this.base]))
      const cleanDeps = OrderedSet(allDeps.reverse()).toList()
      this.path = cleanDeps
    } else {
      this.path = List([this.base])
    }
  }

  buildResolvedClass(): Class<any> {
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

export class Metal {
  static __iris_implements: OrderedSet;
  opts: Map;

  constructor(opts: Map = Map()) {
    this.opts = opts
  }

  static isImplemented(iface) {
    return this.ancestors.has(iface)
  }

  static get ancestors() {
    return this.__iris_implements
  }
}


/**
 * implement
 *
 * @param {function}[classes]
 * @returns {undefined}
 */
const implement: Function = (...classes) => (base) => {
  let newBase = base.bind({})
  newBase.__iris_implemented = classes
  return newBase
}

/**
 * build
 *
 * @param klass
 * @returns {undefined}
 */
const build: Function = klass => {
  let resolver = new MixinResolver(klass)
  return resolver.buildResolvedClass()
}

export { MixinResolver, build, implement }
