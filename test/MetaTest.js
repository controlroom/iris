import { expect } from "chai"
import { IMeta } from "../src/Meta"
import { build } from "../src/mixin"
import { Map, List, fromJS } from "immutable"
import { mockStore } from "./shared"

const Meta = build(IMeta)

const basicMeta = (klass, path = []) => {
  const store = mockStore({})
  return new klass({store, path})
}

describe("Meta", () => {
  it("can store generic metadata", () => {
    const o = basicMeta(Meta)
    o.meta.set("key", "value")
    expect(o.updateState().meta.get("key")).to.eql("value")
  })

  it("can store metadata with an established path", () => {
    const o = basicMeta(Meta, ["a", "b", "c"])
    o.meta.set("key", "value")
    expect(o.updateState().meta.get("key")).to.eql("value")
  })

  describe("Basic Flagging", () => {
    it("can flag a property", () => {
      const meta = basicMeta(Meta)
      meta.flag("fixing")
      expect(meta.updateState().isFlagged("fixing")).to.be.true
    })

    it("can unflag a property", () => {
      const meta = basicMeta(Meta)
      meta.flag("awesome")
      expect(meta.updateState().isFlagged("awesome")).to.be.true
      meta.unFlag("awesome")
      expect(meta.updateState().isFlagged("awesome")).to.be.false
    })

    it("can flag multiple tag keys", () => {
      const meta = basicMeta(Meta)
      meta.flag(["foo", "bar"])
      const updatedMeta = meta.updateState()
      expect(updatedMeta.isFlagged("foo")).to.be.true
      expect(updatedMeta.isFlagged("bar")).to.be.true
      expect(updatedMeta.isFlagged("flags")).to.be.false
    })
  })

  describe("Flag Groups", () => {
    it("can create nested tag groups", () => {
      const meta = basicMeta(Meta)
      meta.flag("flags", "yes")
      const updatedMeta = meta.updateState()
      expect(updatedMeta.isFlagged("flags", "yes")).to.be.true
      expect(updatedMeta.isFlagged("flags", "boop")).to.be.false
    })

    it("can accept multiple tag keys", () => {
      const meta = basicMeta(Meta)
      meta.flag("flags", ["foo", "bar"])
      const updatedMeta = meta.updateState()
      expect(updatedMeta.isFlagged("flags", "foo")).to.be.true
      expect(updatedMeta.isFlagged("flags", "bar")).to.be.true
      expect(updatedMeta.isFlagged("flags", ["foo", "bar"])).to.be.true
      expect(updatedMeta.isFlagged("flags", ["foo", "fun"])).to.be.false
    })

    it("can toggle tags", () => {
      const meta = basicMeta(Meta)
      meta.toggleFlag("basic", ["foo", "bar"])
      meta.toggleFlag("basic", "foo")
      const updatedMeta = meta.updateState()
      expect(updatedMeta.isFlagged("basic", "foo")).to.be.false
      expect(updatedMeta.isFlagged("basic", "bar")).to.be.true
    })
  })
})
