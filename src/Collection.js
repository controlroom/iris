/**
 * basic collections
 *
 * A collection is either pointing to the base collection (root), or it is a
 * subset that is located in another place
 *
 * @module iris/Collection
 */

import { IAccess }             from "./Access"
import { ISnitch }             from "./Snitch"
import { build, implement }    from "./mixin"
import { delegate, checkOpts } from "./utils"
import { Map, List }           from "immutable"
import { ROOT_KEY }            from "./constants"

let ICollection = (superclass) => {

  /**
   * @alias ICollection
   * @mixin
   * @mixes IAccess
   * @mixes ISnitch
   */
  class Collection extends superclass {
    constructor(raw) {
      const opts = checkOpts(raw)
      super(opts)
      const path = opts.get("path")

      if(!path) {
        this.opts = opts.set("path", [ROOT_KEY, this.entity.type])
      }
    }

    get itemConstructor() {
      return this.opts.get("itemConstructor") || this.constructor.itemConstructor
    }

    /**
     * items
     *
     * @returns {(List<Entity>|List<Any>)}
     */
    get items() {
      if (this.itemConstructor) {
        const data = this._data || Map()

        if (Map.isMap(data)) {
          return data.map((v, k) => {
            return new this.itemConstructor(
              this.opts.set("path", this.appendPath(k))
            )
          })
        } else if (List.isList(data)) {
          return data.map(id => {
            return new this.itemConstructor(
              this.opts.set("path", [ROOT_KEY, id.get("type"), id.get("id")])
            )
          })
        } else {
          throw new Error("I am unsure about the data in this collection")
        }
      } else {
        return this.data
      }
    }

    inspect() {
      return(
`
Iris.Collection(${this.constructor.name})
  path: [${this.path.toJS()}]
`
)
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

ICollection = implement(IAccess, ISnitch)(ICollection)

export { ICollection }
export default build(ICollection)
