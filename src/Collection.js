/**
 * basic collections
 * @module iris/Collection
 */

import { IAccess }          from "./Access"
import { build, implement } from "./mixin"
import { delegate }         from "./utils"

let ICollection = (superclass) => {

  /**
   * @alias ICollection
   * @mixin
   * @mixes IAccess
   */
  class Collection extends superclass {

    /**
     * items
     *
     * @returns {(Model|Map)}
     */
    get items() {
      if (this.constructor.model) {
        return this.data.map((v, k) => {
          return new this.constructor.model(
            this.opts.set("path", this.appendPath(k))
          )
        })
      } else {
        return this.data
      }
    }
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

ICollection = implement(IAccess)(ICollection)

export { ICollection }
export default build(ICollection)
