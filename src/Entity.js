/**
 * entity
 *
 * Basic mixin that implements the ability to store / access structured data
 *
 * @module iris/Entity
 */

import { build, implement }       from "./mixin"
import { checkOpts, ensureArray } from "./utils"
import { IModel }                 from "./Model"
import { ISchema }                from "./Schema"
import { ICursor }                from "./Cursor"
import { DATA_KEY, ROOT_KEY }     from "./constants"
import { List }                   from "immutable"

import { isReferenceType, isParentType } from "./types"

let IEntity = (superclass) =>

  /**
   * @alias IEntity
   * @mixin
   */
  class Entity extends superclass {
    /**
     * constructor
     *
     * Entity allows for id to be passed in during construction and will be
     * used in finding the entity data
     *
     * @private
     */
    constructor(raw) {
      const opts = checkOpts(raw)
      super(opts)
      const id   = opts.get("id")
      let   path = opts.get("path")

      if(!path) {
        path = List([ROOT_KEY, this.constructor.type, id])
        this.opts = opts.set("path", path)
        this.path = path
      }
    }

    get(path) {
      const type = this.typeFromSchema(path)
      if (type == null) throw new Error(`No type information for '${path}'`)

      const res  = super.getIn([DATA_KEY, path])

      if (isReferenceType(type) || isParentType(type)) {
        if (List.isList(res)) {
          return this.traverse([DATA_KEY, path], type.klass)
        } else {
          return this.go([ROOT_KEY, res.get("type"), res.get("id")], type.klass)
        }
      }

      return res
    }

    getIn(paths) {
      return ensureArray(paths).reduce((memo, path) => {
        return memo.get(path)
      }, this)
    }

    inspect() {
      return(
`
Iris.Entity(${this.constructor.name})
  path: [${this.path.toJS()}]
`
      )
    }
  }

IEntity = implement(IModel, ISchema, ICursor)(IEntity)

export { IEntity }
export default build(IEntity)
