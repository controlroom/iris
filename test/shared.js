import { createStore } from "redux"
import reducer from "../src/reducer"
import { Map, fromJS } from "immutable"

export const mockEntities = (entities) => {
  return entities.reduce((memo, {type, id, attributes, relationships}) => {
    if (!memo.entities[type]) memo.entities[type] = {}
    memo.entities[type][id] = { id, type, attributes, relationships }
    return memo
  }, {entities: {}})
}

export const entityData = (type, id, attributes, relationships = {}) => {
  return({ type, id, attributes, relationships})
}

export const mockStore = (data = {}) => {
  return createStore(reducer, fromJS(data))
}

