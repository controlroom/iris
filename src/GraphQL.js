/**
 * integrate GraphQL features into Entity/Collection classes
 * @module iris/GraphQL
 */

import { build, implement }  from "./mixin"
import { Map, List, fromJS } from "immutable"
import { registerReducer }   from "./reducer"
import { ensureArray, ensureImmutable, checkOpts, createNSActions } from "./utils"

import { DATA_KEY, ROOT_KEY, GQL_TYPE_KEY } from "./constants"
import { isReferenceType, isParentType } from "./types"

import { IFetch }  from "./Fetch"
import { IStore }  from "./Store"
import { IAffect } from "./Affect"
import { ISchema } from "./Schema"

const {
  PUSH_ENTITIES
} = createNSActions("GraphQL",
  "PUSH_ENTITIES"
)

let IGraphQL = (superclass) => {

  /**
   * @alias IGraphQL
   * @mixin
   * @mixes IStore
   * @mixes IFetch
   * @mixes ISchema
   */
  class GraphQL extends superclass {
    static graphOps = Map()

    /**
     * Return schema fields that are of type Reference
     *
     * @type {string[]}
     */
    static get refFields() {
      return this.schemaKeys.filter(k =>
        k != GQL_TYPE_KEY && isReferenceType(this.typeFromSchema(k))
      )
    }

    /**
     * Return schema fields that should be sent to the GraphQL backend
     *
     * @type {string[]}
     */
    static get baseFields() {
      return this.schemaKeys.filter(k =>
        !isParentType(this.typeFromSchema(k))
      ).concat([GQL_TYPE_KEY])
    }

    /**
     * Nested GraphQL query string that includes query fields for all
     * reference relationships
     *
     * @type {string}
     */
    static query() {
      const isNestedField = (type, key) =>
        key != GQL_TYPE_KEY && isReferenceType(type)

      const nestedFields = this.baseFields.map(key => {
        const type = this.typeFromSchema(key)
        if(isNestedField(type, key)) {
          const entity = type.klass.itemConstructor || type.klass
          return key + entity.query()
        }

        return key
      })

      return ("{" + nestedFields.join(" ") + "}")
    }

    /**
     * Extracts GraphQL response data into a normalized list of entity data. For example a
     * response from the server that contains nested data like:
     *
     * {
     *   id: 4,
     *   name: "Hello",
     *   __typename: "Parent"
     *   thing1: {
     *     id: 123,
     *     name: "I am a thing",
     *     otherData: "here is more data",
     *     __typename: "Thing"
     *   }
     * }
     *
     * Should be converted into this list (based on the schema of the parent):
     * [
     *   {
     *     __typename: "Parent",
     *     id: 4,
     *     name: "Hello"
     *     thing1: {
     *       id: "123",
     *       type: "Thing"
     *     }
     *   },
     *   {
     *     __typename: "Thing",
     *     id: 123,
     *     name: "I am a thing",
     *     otherData: "here is more data"
     *     parent: {
     *       id: "4",
     *       type: "Parent"
     *     }
     *   }
     * ]
     *
     * This method takes care of injecting reverse relationships when they are
     * speficied in the schema for each field.
     *
     * @arg {Object|Array} item
     * @arg {Immutable.List} rootList
     * @arg {Object} reverse
     * @type {string}
     */
    static normalizeExtract(item, rootList, reverse) {
      // Calculate identity for current item right now
      const itemId = Map({
        id:   item.get("id"),
        type: item.get(GQL_TYPE_KEY)
      })

      // If a reverse should be added to our current item, then set the data right now
      if (reverse) {
        item = item.set(reverse.name, reverse.identity)
      }

      const [result, updatedList] = this.refFields.reduce(([memoItem, memoList], field) => {
        const refData   = memoItem.get(field)
        const type      = this.typeFromSchema(field)
        let reverseData = null

        // Did the options in our Reference type specify a reverse name?
        if(type.opts && type.opts.reverse) {
          reverseData = {
            name: type.opts.reverse,
            identity: itemId
          }
        }

        if(refData && !refData.isEmpty()) {
          const entity = type.klass.itemConstructor || type.klass

          // Has Many
          //
          if(List.isList(refData)) {
            const [identityList, updatedMemoList] = refData.reduce(([dataIdList, dataList], data) => {
              const [identity, updatedDataList] = entity.normalizeExtract(data, dataList, reverseData)

              return [
                dataIdList.push(identity),
                updatedDataList
              ]
            }, [List(), memoList])

            return [
              memoItem.set(field, identityList),
              updatedMemoList
            ]

          // Has One
          //
          } else {
            const [identity, updatedMemoList] = entity.normalizeExtract(refData, memoList, reverseData)

            return [
              memoItem.set(field, identity),
              updatedMemoList
            ]
          }
        }

        return [memoItem, memoList]
      }, [item, rootList])

      return [ itemId, updatedList.push(result) ]
    }

    _gql_gatherResponseData(queryName, response) {
      if(response.errors) {
        throw new Error(JSON.stringify(response.errors))
      } else {
        return response.data[queryName]
      }
    }

    _gql_normalizeResponseData(data) {
      return ensureArray(data).reduce((memo, item) => {
        const [_, allItems] = this._gql_entityConstructor.normalizeExtract(fromJS(item), memo)
        return allItems
      }, List())
    }

    _gql_updateStoreData(data) {
      return this.dispatch({
        type: PUSH_ENTITIES,
        items: data
      })
    }

    _gql_execQL(name, query, variables) {
      return this.fetch({
        body:   { query, variables },
        url:    "http://localhost:4000/graphql",
        method: "post"
      })
      .then(res => this._gql_gatherResponseData(name, res))
      .then(res => this._gql_normalizeResponseData(res))
      .catch(console.error)
    }

    constructor(raw) {
      super(checkOpts(raw))

      if (this.isImplemented("Collection")) {
        this._gql_entityConstructor = this.constructor.itemConstructor
      } else {
        this._gql_entityConstructor = this.constructor
      }
    }

    get headers() {
      return({
        "Accept":       "application/json",
        "Content-Type": "application/json"
      })
    }


    extractQueryStatement(name) {
      const queryOp = this.constructor.graphOps.getIn(["query", name])
      let method    = name
      const arglist = queryOp && queryOp.args
      if(arglist) {
        const args = Object.entries(arglist).map(([k, v]) => {
          return(k + ": " + this.opts.get(k))
        })

        method += "(" + args.join(",") + ")"
      }

      return method
    }

    graphQuery(name) {
      const method = this.extractQueryStatement(name)
      const query  = "query { " + method + " " + this._gql_entityConstructor.query() + " }"

      return this._gql_execQL(name, query, null)
        .then(res => this._gql_updateStoreData(res))
    }

    graphMutationData(opts) {
      const {name, keyPrefix, rootMemo, fnPath, fnMemo, varMemo} = opts

      const mutationData = this.constructor.graphOps.getIn(["mutation", name])
      return mutationData.fields.reduce(([rootMemo, fnMemo, varMemo], key) => {
        let lookup = key
        if (typeof key === "object") {
          [[key, lookup]] = Object.entries(key)
        }

        let val
        if (typeof lookup === "object") {
          val = lookup.fn(this)
        } else if (typeof lookup === "function") {
          val = lookup(this)
        } else {
          val = this.get(lookup)
        }

        const type = this.typeFromSchema(key)

        let gqlType
        if (type == null) {
          gqlType = lookup.type
        } else {
          gqlType = type.gqlType
        }

        const prefixedKey = keyPrefix + key

        if (type && val && isReferenceType(type)) {
          return val.graphMutationData({
            ...opts,
            rootMemo,
            fnMemo,
            varMemo,
            keyPrefix: prefixedKey + "_",
            fnPath: fnPath.push(key)
          })
        }

        if(!val) return [ rootMemo, fnMemo, varMemo ]

        return [
          rootMemo.push(`$${prefixedKey}: ${gqlType}!`),
          fnMemo.setIn(fnPath.push(key), "$" + prefixedKey),
          varMemo.set(prefixedKey, val)
        ]
      }, [rootMemo, fnMemo, varMemo])
    }

    graphMutation(name) {
      const [root, fn, vars] = this.graphMutationData({
        name,
        keyPrefix: "",
        rootMemo: List(),
        fnPath: List(),
        fnMemo: Map(),
        varMemo: Map()
      })

      const mergedFn = JSON.stringify(fn.toJS())
        .replace(/"/g, "")
        .replace(/,|:/g, "$& ")
        .slice(1, -1)

      const mutation = `
        mutation ${name}(${root.join(", ")}) {
          ${name}(${mergedFn})
            ${this._gql_entityConstructor.query()}
        }
      `

      return this._gql_execQL(name, mutation, vars)
        .then(res => this._gql_updateStoreData(res))
    }
  }

  return GraphQL
}

IGraphQL = implement(IStore, IFetch, ISchema)(IGraphQL)

export const graphQuery = (klass, opts) => {
  klass.graphOps = klass.graphOps.setIn(["query", opts.name], opts)
}

export const graphMutation = (klass, opts) => {
  klass.graphOps = klass.graphOps.setIn(["mutation", opts.name], opts)
}

export { IGraphQL }
export default build(IGraphQL)

registerReducer({
  [PUSH_ENTITIES]: (state, {items}) =>
    items.reduce((state, item) =>
      state.mergeDeepIn(
        [ROOT_KEY, item.get(GQL_TYPE_KEY), item.get("id"), DATA_KEY],
        item
      )
    , state)
})
