import { expect } from "chai"
import { IAccess } from "../src/Access"
import { build, implement } from "../src/mixin"
import { mockStore } from "./shared"
import { Map, fromJS } from "immutable"

const Data = build(implement(IAccess))
const modelFrom = (data) => {
  const store = mockStore(fromJS(data))
  return new Data({store})
}

describe("Access", () => {
  describe("#data", () => {
    it("returns data at current spot", () => {
      const data = { v1: {v2: 44} }
      const model = modelFrom(data)
      expect(model.data).to.deep.equal(fromJS(data))
    })
  })

  describe("#getIn", () => {
    it("can find data", () => {
      const model = modelFrom({ v1: {v2: 44} })
      expect(model.traverse("v1").getIn("v2")).to.equal(44)
    })

    it("works with nested data", () => {
      const model = modelFrom({ v1: {v2: {v3: 99 }}})
      expect(model.getIn(["v1", "v2", "v3"])).to.equal(99)
    })
  })
})
