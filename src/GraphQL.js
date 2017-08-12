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

let IGraphQL = (superclass) => class GraphQL extends superclass {
  static graphOps = Map()

  static get refFields() {
    return this.schemaKeys.filter(k =>
      k != GQL_TYPE_KEY && isReferenceType(this.typeFromSchema(k))
    )
  }

  static get baseFields() {
    return this.schemaKeys.filter(k =>
      !isParentType(this.typeFromSchema(k))
    ).concat([GQL_TYPE_KEY])
  }

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

  _gql_execQuery(name) {
    // Extract query arguments from opt keys
    const method = this.extractQueryStatement(name)

    return this.fetch({
      body: {
        query: "query { " + method + " " + this._gql_entityConstructor.query() + " }",
        variables: null
      },
      url:    "http://localhost:4000/graphql",
      method: "post"
    })
    .then(res => this._gql_gatherResponseData(name, res))
    .then(res => this._gql_normalizeResponseData(res))
    .then(res => this._gql_updateStoreData(res))
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

  graphQuery(name) {
    return this._gql_execQuery(name)
  }
}

IGraphQL = implement(IStore, IFetch, ISchema)(IGraphQL)

export const graphQuery = (klass, opts) => {
  klass.graphOps = klass.graphOps.setIn(["query", opts.name], opts)
}

export { IGraphQL }
export default build(IGraphQL)

registerReducer({
  [PUSH_ENTITIES]: (state, {items}) =>
    items.reduce((state, item) =>
      state.mergeIn(
        [ROOT_KEY, item.get(GQL_TYPE_KEY), item.get("id"), DATA_KEY],
        item
      )
    , state)
})
