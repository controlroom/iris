import expect from "expect"
import { MixinResolver, implement, build } from "../src/mixin"
import { List, OrderedSet } from "immutable"

const M1 = (superclass) => class M1 extends superclass {}
let M2   = (superclass) => class M2 extends superclass {}
M2       = implement(M1)(M2)
let M3   = (superclass) => class M3 extends superclass {}
M3       = implement(M2, M1)(M3)

describe("MixinResolver", () => {
  it("gathers correct resolve path", () => {
    const resolver = new MixinResolver(M3)
    expect(resolver.path).toEqual(List([M1, M2, M3]))
  })
})

const Mixin1 = (superclass) => class extends superclass {
  get bar() {
    return this.foo
  }
}

let Mixin2 = (superclass) => class extends superclass {
  setFoo(v) {
    this.foo = v
  }
}

Mixin2 = implement(Mixin1)(Mixin2)

const Empty = (superclass) => class extends superclass { }

describe("builder", () => {
  it("works", () => {
    let a = new (build(Mixin2))
    a.setFoo(12)
    expect(a.bar).toEqual(12)
  })

  it("handles empty mixin", () => {
    let a = new (build(Empty))
  })
})

describe("ancestors", () => {
  it("can show implemented interfaces", () => {
    const built = build(M3)
    expect(new built().ancestors).toEqual(OrderedSet(["M3", "M2", "M1", "Metal"]))
  })
})

describe("isImplemented", () => {
  it("can query implemented interfaces", () => {
    const built = build(M3)
    expect(new built().isImplemented("M1")).toBe(true)
  })
})
