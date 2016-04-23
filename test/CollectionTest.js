import expect                 from "expect"
import { ICollection }        from "../src/Collection"
import Model                  from "../src/Model"
import { build }              from "../src/mixin"
import { mockStore }          from "./shared"
import { Map, List, fromJS }  from "immutable"

const Collection = build(ICollection)

class TestModel extends Model {
  get type() {
    return "test"
  }
}

class TestCollection extends Collection {
  get model() {
    return TestModel
  }
}

describe("Collection", () => {
  describe("basic iteration", () => {
    let coll
    before(() => {
      const store = mockStore({ a: [1, 2, 3] })
      coll = new Collection(Map({store, path: ["a"]}))
    })
    it("#map", () => { expect(coll.map(e => e + 1).toJS()).toEqual([2, 3, 4]) })
    it("#filter", () => { expect(coll.filter(e => e > 2).toJS()).toEqual([3]) })
  })

  describe("Normalized Insert", () => {
  })
})

