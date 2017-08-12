import { expect } from "chai"
import { ICursor } from "../src/Cursor"
import { build } from "../src/mixin"
import { Map, List, fromJS } from "immutable"

const Cursor = build(ICursor)

describe("Cursor", () => {
  describe("#path", () => {
    it("returns empty list for new cursor", () => {
      const c = new Cursor()
      expect(c.path).to.eql(List([]))
    })
  })

  describe("#appendPath", () => {
    it("returns new path without moving cursor", () => {
      const c = (new Cursor()).traverse("p1")
      expect(c.appendPath(["p2"])).to.eql(["p1", "p2"])
    })
  })

  describe("#prependPath", () => {
    it("returns new path without moving cursor", () => {
      const c = (new Cursor()).traverse("p1")
      expect(c.prependPath(["p2"])).to.eql(["p2", "p1"])
    })
  })

  describe("#traverse", () => {
    it("records path after basic traverse", () => {
      const c = (new Cursor()).traverse("p1")
      expect(c.path).to.eql(List(["p1"]))
    })

    it("records path after nested traverse", () => {
      const c = (new Cursor()).traverse(["p1", "p2"])
      expect(c.path).to.eql(List(["p1", "p2"]))
    })

    it("works with multiple traversals", () => {
      const c = (new Cursor()).traverse("p1").traverse("p2")
      expect(c.path).to.eql(List(["p1", "p2"]))
    })

    it("can load from a custom constructor", () => {
      class Other extends Cursor {}
      const c = (new Cursor()).traverse("p1", Other)
      expect(c).to.be.an.instanceOf(Other)
    })
  })

  describe("#up", () => {
    it("returns cursor moving up one spot in path", () => {
      const c = (new Cursor()).traverse(["p1", "p2"])
      expect(c.up().path.toJS()).to.eql(["p1"])
    })
  })

  describe("back", () => {
    it("moves in history regardless of path", () => {
      const c = (new Cursor()).traverse("p1").traverse(["p2", "p3", "p4"])
      expect(c.back().path).to.eql(List(["p1"]))
    })
  })

  describe("#go", () => {
    it("moves to a new path", () => {
      const c = (new Cursor()).traverse("p1").traverse("p2").go("v1")
      expect(c.path).to.eql(List(["v1"]))
    })
  })
})
