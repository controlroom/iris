/**
 * integrate GraphQL features into Entity/Collection classes
 * @module iris/GraphQL
 */

import { build, implement }  from "./mixin"
import { Map, List, fromJS } from "immutable"
import { registerReducer }   from "./reducer"
import { ensureArray, ensureImmutable, checkOpts, createNSActions } from "./utils"

import { DATA_KEY, ROOT_KEY, GQL_TYPE_KEY } from "./constants"
import { isReferenceType } from "./types"

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

  static query() {
    const allFields = this.schemaKeys.concat([GQL_TYPE_KEY])
    const isNestedField = (type, key) =>
      key != GQL_TYPE_KEY && isReferenceType(type)

    const nestedFields = allFields.map(key => {
      const type = this.typeFromSchema(key)
      if(isNestedField(type, key)) {
        const entity = type.klass.entity || type.klass
        return key + entity.query()
      }

      return key
    })

    return ("{" + nestedFields.join(" ") + "}")
  }

  static normalizeExtract(item, rootSet) {
    const [final, updatedSet] = this.refFields.reduce(([memoItem, memoSet], field) => {
      const refData = memoItem.get(field)
      const type    = this.typeFromSchema(field)

      if(refData && !refData.isEmpty()) {
        const entity = type.klass.entity || type.klass

        if(List.isList(refData)) {
          const [identityList, updatedMemoSet] = refData.reduce(([dataIdList, dataSet], data) => {
            const [identity, updatedDataSet] = entity.normalizeExtract(data, dataSet)

            return [
              dataIdList.push(identity),
              updatedDataSet
            ]
          }, [List(), memoSet])

          return [
            memoItem.set(field, identityList),
            updatedMemoSet
          ]
        } else {
          const [identity, updatedMemoSet] = entity.normalizeExtract(refData, memoSet)

          return [
            memoItem.set(field, identity),
            updatedMemoSet
          ]
        }
      }

      return [memoItem, memoSet]
    }, [item, rootSet])


    return [
      // identity
      Map({
        id:   final.get("id"),
        type: final.get(GQL_TYPE_KEY)
      }),

      // itemSet with current item pushed
      updatedSet.push(final)
    ]
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

  _gql_extractQueryStatement(name) {
    const queryOp = this.constructor.graphOps.getIn(["query", name])
    let method    = name
    const arglist = queryOp.args
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
    const method = this._gql_extractQueryStatement(name)

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
      this._gql_entityConstructor = this.constructor.entity
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
