import { Map } from "immutable"

let reducers = Map()

export const registerReducer = reducer => {
  reducers = reducers.merge(reducer)
}

export default (state, action) => {
  // console.log(action)
  const runner = reducers.get(action.type)
  if (runner) return runner(state, action)
  return state
}
