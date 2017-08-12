import { expect }             from "chai"
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
  static itemConstructor = TestModel
}

describe("Collection", () => {
  describe("Basic immutable collection operations", () => {
    let coll
    before(() => {
      const store = mockStore({ a: [1, 2, 3] })
      coll = new Collection({store, path: ["a"]})
    })
    it("#map", () => { expect(coll.map(e => e + 1).toJS()).to.eql([2, 3, 4]) })
    it("#filter", () => { expect(coll.filter(e => e > 2).toJS()).to.eql([3]) })
  })

  describe("Normalized Insert", () => {
    it("can add new data", () => { })
  })
  describe("Normalize initial data", () => {})
  describe("Root initializing", () => { })
  describe("Schema relation initializing", () => { })
})
