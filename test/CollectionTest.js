import expect                 from "expect"
import { ICollection }        from "../src/Collection"
import { build }              from "../src/mixin"
import { mockStore }          from "./shared"
import { Map, List, fromJS }  from "immutable"

const Collection = build(ICollection)

const store = mockStore({ a: [1, 2, 3] })

describe("Collection", () => {
  describe("basic iteration", () => {
    let coll
    before(() => { coll = new Collection(Map({store, path: ["a"]})) })
    it("#map", () => { expect(coll.map(e => e + 1).toJS()).toEqual([2, 3, 4]) })
    it("#filter", () => { expect(coll.filter(e => e > 2).toJS()).toEqual([3]) })
  })
})

