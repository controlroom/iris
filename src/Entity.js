/**
 * Basic mixin that implements the ability to store / access structured data
 *
 * @module iris/Entity
 */

import { build, implement }       from "./mixin"
import { IModel }                 from "./Model"
import { IMeta }                  from "./Meta"
import { ISchema }                from "./Schema"
import { ICursor }                from "./Cursor"
import { DATA_KEY, ROOT_KEY }     from "./constants"
import { List, Map }              from "immutable"

import { checkOpts, ensureArray, tempId } from "./utils"
import { isReferenceType, isParentType } from "./types"

let IEntity = (superclass) =>

  /**
   * @alias IEntity
   * @mixin
   */
  class Entity extends superclass {
    static build(opts, data) {
      const id = tempId()
      const entity = new this({ id, ...opts })
      if (data) {
        entity.traverse(DATA_KEY).merge(data)
      }

      entity.flag("irisStatus", "new")

      return entity.updateState()
    }

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
      let id   = opts.get("id")
      let path = opts.get("path")

      if(!path) {
        path = List([ROOT_KEY, this.constructor.type, id])
        this.opts = opts.set("path", path)
        this.path = path
      }
    }

    buildNew(path, data = {}) {
      const type = this.typeFromSchema(path)
      if (type == null)
        throw new Error(`No type information for '${path}'`)
      if (!isReferenceType(type))
        throw new Error(`'${path}' is not a reference, you should set the value instead of newing it`)

      const newId = tempId().toString()
      let constructor = type.klass
      if(type.klass.isImplemented("Collection")) {
        constructor = type.klass.itemConstructor
      }

      const newItem = new constructor({
        id:    newId,
        store: this.store
      })

      let reverseData = {}
      if(type.opts && type.opts.reverse) {
        reverseData = {
          [type.opts.reverse]: {
            type: this.constructor.type,
            id:   this.opts.get("id")
          }
        }
      }

      if(type.klass.isImplemented("Collection")) {
        this.update([DATA_KEY, path], arr => (arr || []).concat([{
          id:   newId,
          type: constructor.type
        }]))
      }

      this.set([DATA_KEY, path], Map({
        id:   newId,
        type: constructor.type
      }))

      newItem.flag("irisStatus", "new")

      newItem.traverse(DATA_KEY).merge({
        ...data,
        ...reverseData
      })

      return newItem
    }

    get(path) {
      const type = this.typeFromSchema(path)
      if (type == null) throw new Error(`No type information for '${path}'`)

      const dataPath = [DATA_KEY, path]
      const res      = super.getIn(dataPath)
      if (res == null) return null

      if (isReferenceType(type) || isParentType(type)) {
        if (List.isList(res)) {
          return this.traverse([DATA_KEY, path], type.klass)
        } else {
          return this.go(
            [ROOT_KEY, res.get("type"), res.get("id")],
            type.klass
          )
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

IEntity = implement(IMeta, IModel, ISchema, ICursor)(IEntity)

export { IEntity }
export default build(IEntity)
