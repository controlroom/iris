/**
 * basic collections
 * @module iris/Collection
 */

import { IAccess }          from "./Access"
import { ISnitch }          from "./Snitch"
import { build, implement } from "./mixin"
import { delegate }         from "./utils"

let ICollection = (superclass) => {

  /**
   * @alias ICollection
   * @mixin
   * @mixes IAccess
   * @mixes ISnitch
   */
  class Collection extends superclass {

    /**
     * model
     * If using custom model for collection then override this get property
     * with the correct returning type.
     *
     * @virtual
     * @returns {(null|Model)}
     */
    get model() {
      return this.opts.get("model") || null
    }

    /**
     * items
     *
     * @returns {(List<Model>|List<Any>)}
     */
    get items() {
      if (this.model) {
        return this._data.map((v, k) => {
          return new this.model(
            this.opts.set("path", this.appendPath(k))
          )
        })
      } else {
        return this.data
      }
    }

    // add(data) { }
    // inject(data) { }
  }

  delegate(Collection, "items", [
    "keys",
    "values",
    "entries",

    "includes",
    "first",
    "last",

    "map",
    "filter",
    "filterNot",
    "reverse",
    "sort",
    "sortBy",
    "groupBy",
    "forEach",
    "slice",
    "rest",
    "butLast",
    "skip",
    "skipLast",
    "skipWhile",
    "skipUntil",
    "take",
    "takeLast",
    "takeWhile",
    "takeUntil",
    "concat",
    "flatten",
    "flatMap",
    "reduce",
    "reduceRight",
    "every",
    "some",
    "isEmpty",
    "count",
    "countBy",
    "find",
    "findLast",
    "findEntry",
    "findLastEntry",
    "max",
    "maxBy",
    "min",
    "minBy",
    "isSubset",
    "isSuperset",
  ])

  return Collection
}

ICollection = implement(IAccess, ISnitch)(ICollection)

export { ICollection }
export default build(ICollection)
