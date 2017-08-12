import { expect } from "chai"
import { IAffect } from "../src/Affect"
import { IAccess } from "../src/Access"
import { build, implement } from "../src/mixin"
import { mockStore } from "./shared"
import { Map, fromJS } from "immutable"

const Data = build(implement(IAffect, IAccess))
const modelFrom = (data) => {
  const store = mockStore(fromJS(data))
  return new Data({store})
}

describe("Affect", () => {
  describe("#replace", () => {
    it("basic replace", () => {
      const model = modelFrom({ v1: "foo" })
      model.traverse("v1").replace("bar")
      expect(model.updateState().data.toJS()).to.eql({v1: "bar"})
    })
  })

  describe("#set", () => {
    it("basic set", () => {
      const model = modelFrom({ v1: "foo" })
      model.set("v1", "bar")
      expect(model.updateState().data.toJS()).to.eql({v1: "bar"})
    })
  })

  describe("#update", () => {
    it("basic update", () => {
      const model = modelFrom({ v1: 88 })
      model.update("v1", i => i + 1)
      expect(model.updateState().data.toJS()).to.eql({v1: 89})
    })
  })

  describe("#merge", () => {
    it("basic merge", () => {
      const model = modelFrom({ v1: { foo: "bar", a: 1}})
      model.traverse("v1").merge({foo: "bars"})
      expect(model.updateState().data.toJS()).to.eql({ v1: { foo: "bars", a: 1}})
    })
  })

  describe("#mergeIn", () => {
    it("basic mergeIn", () => {
      const model = modelFrom({ v1: { foo: "bar", a: 1}})
      model.mergeIn("v1", {foo: "bars"})
      expect(model.updateState().data.toJS()).to.eql({ v1: { foo: "bars", a: 1}})
    })
  })

  describe("#copy", () => {
    it("basic copy", () => {
      const model = modelFrom({ v1: 100 })
      model.copy("v1", "v2")
      expect(model.updateState().data.toJS()).to.eql({ v1: 100, v2: 100})
    })
  })
})
