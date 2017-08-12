import { expect } from "chai"
import t from "../src/types"
import GraphQL, { IGraphQL, graphQuery } from "../src/GraphQL"
import { build, implement, emptyImpl } from "../src/mixin"
import { mockStore } from "./shared"
import { Map, fromJS, List, Set } from "immutable"
import { IEntity } from "../src/Entity"
import { ICollection } from "../src/Collection"
import { ensureArray, checkOpts } from "../src/utils"
import { GQL_TYPE_KEY } from "../src/constants"

const GQLCollection = build(implement(IGraphQL, ICollection)(emptyImpl()))

const identity = (type, id) => ({ id, type })
const base = (type, id, data = {}) => ({
  [GQL_TYPE_KEY]: type,
  id,
  ...data
})

describe("GraphQLTest", () => {
  describe(".normalizeExtract", () => {
    describe("entity reference", () => {
      class Child extends GraphQL {
        static type = "Child";
        static schema = {
          id:     t.Id(t.Integer()),
          name:   t.String(),
        }
      }

      class Parent extends GraphQL {
        static type = "Parent";
        static schema = {
          id:    t.Id(t.Integer()),
          child: t.Reference(Child)
        }
      }

      it("extracts children", () => {
        const [_, finalList] = Parent.normalizeExtract(fromJS(
          base("Parent", 12, {
            child: base("Child", 9, {
              name: "Kevin"
            })
          })
        ), List())

        const target = [
          base("Parent", 12, {
            child: identity("Child", 9)
          }),
          base("Child", 9, {
            name: "Kevin"
          })
        ]

        expect(finalList.toJS()).to.have.deep.members(target)
      })
    })

    describe("reverse parent injection", () => {
      class Child extends GraphQL {
        static type = "Child";
        static schema = {
          id:     t.Id(t.Integer()),
          parent: t.Parent("Parent"),
        }
      }

      class Parent extends GraphQL {
        static type = "Parent";
        static schema = {
          id:    t.Id(t.Integer()),

          child: t.Reference(Child, {reverse: "parent"})
        }
      }

      it("extracts children", () => {
        const [_, finalList] = Parent.normalizeExtract(fromJS(
          base("Parent", 12, {
            child: base("Child", 9, {
              name: "Kevin"
            })
          })
        ), List())

        const target = [
          base("Parent", 12, {
            child: identity("Child", 9)
          }),
          base("Child", 9, {
            name: "Kevin",
            parent: identity("Parent", 12),
          })
        ]

        expect(finalList.toJS()).to.have.deep.members(target)
      })
    })

    describe("collection reference", () => {
      class Child extends GraphQL {
        static type = "Child";
        static schema = {
          id:   t.Id(),
          name: t.String()
        }
      }

      class Children extends GQLCollection {
        static itemConstructor = Child
      }

      class Parent extends GraphQL {
        static type = "Parent"
        static schema = {
          id:       t.Id(),
          number:   t.Integer(),
          children: t.Reference(Children)
        }
      }

      it("extracts children", () => {
        const [_, finalList] = Parent.normalizeExtract(fromJS(
          base("Parent", 99, {
            number: 1000,
            children: [
              base("Child", 1234, {
                name: "Mark"
              }),
              base("Child", 1235, {
                name: "Larry"
              })
            ]
          })
        ), List())

        const target = [
          base("Parent", 99, {
            number: 1000,
            children: [
              identity("Child", 1234),
              identity("Child", 1235)
            ]
          }),
          base("Child", 1234, {
            name: "Mark"
          }),
          base("Child", 1235, {
            name: "Larry"
          })
        ]

        expect(finalList.toJS()).to.have.deep.members(target)
      })
    })
  })
})
