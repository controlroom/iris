import expect from "expect"
import Data from "../src/Data"
import { build, implement } from "../src/mixin"
import { mockStore } from "./shared"
import { Map, fromJS } from "immutable"

const modelFrom = (data) => {
  const store = mockStore(fromJS(data))
  return new Data(Map({store}))
}

describe("Data", () => {
  describe("#data", () => {
    it("returns data at current spot", () => {
      const data = { v1: {v2: 44} }
      const model = modelFrom(data)
      expect(model.data).toEqual(fromJS(data))
    })
  })

  describe("#getIn", () => {
    it("can find data", () => {
      const model = modelFrom({ v1: {v2: 44} })
      expect(model.traverse("v1").getIn("v2")).toEqual(44)
    })

    it("works with nested data", () => {
      const model = modelFrom({ v1: {v2: {v3: 99 }}})
      expect(model.getIn(["v1", "v2", "v3"])).toBe(99)
    })
  })

  describe("#replace", () => {
    it("basic replace", () => {
      const model = modelFrom({ v1: "foo" })
      model.traverse("v1").replace("bar")
      expect(model.updateState().data).toEqual(fromJS({v1: "bar"}))
    })
  })

  describe("#set", () => {
    it("basic set", () => {
      const model = modelFrom({ v1: "foo" })
      model.set("v1", "bar")
      expect(model.updateState().data).toEqual(fromJS({v1: "bar"}))
    })
  })

  describe("#update", () => {
    it("basic update", () => {
      const model = modelFrom({ v1: 88 })
      model.update("v1", i => i + 1)
      expect(model.updateState().data).toEqual(fromJS({v1: 89}))
    })
  })

  describe("#merge", () => {
    it("basic merge", () => {
      const model = modelFrom({ v1: { foo: "bar", a: 1}})
      model.traverse("v1").merge({foo: "bars"})
      expect(model.updateState().data).toEqual(fromJS({ v1: { foo: "bars", a: 1}}))
    })
  })

  describe("#mergeIn", () => {
    it("basic mergeIn", () => {
      const model = modelFrom({ v1: { foo: "bar", a: 1}})
      model.mergeIn("v1", {foo: "bars"})
      expect(model.updateState().data).toEqual(fromJS({ v1: { foo: "bars", a: 1}}))
    })
  })

  describe("#copy", () => {
    it("basic copy", () => {
      const model = modelFrom({ v1: 100 })
      model.copy("v1", "v2")
      expect(model.updateState().data).toEqual(fromJS({ v1: 100, v2: 100}))
    })
  })
})
