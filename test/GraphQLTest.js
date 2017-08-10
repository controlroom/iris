import expect from "expect"
import t from "../src/types"
import GraphQL, { IGraphQL } from "../src/GraphQL"
import { build, implement, emptyImpl } from "../src/mixin"
import { mockStore } from "./shared"
import { Map, fromJS, List, Set } from "immutable"
import { IEntity } from "../src/Entity"
import { ICollection } from "../src/Collection"
import { ensureArray, checkOpts } from "../src/utils"

const GQLEntity     = build(implement(IGraphQL, IEntity)(emptyImpl()))
const GQLCollection = build(implement(IGraphQL, ICollection)(emptyImpl()))

class StepDescription extends GQLEntity {
  static type = "StepDescription";
  static schema = {
    id:   t.Id(t.Integer()),
    text: t.String()
  }
}

class StepTimer extends GQLEntity {
  static type = "StepTimer";
  static schema = {
    id:        t.Id(t.Integer()),
    duration:  t.Integer(),
    progress:  t.Integer(),
    isRunning: t.Boolean(),
    pausedAt:  t.DateTime(),
    startedAt: t.DateTime()
  }
}

class Step extends GQLEntity {
  static type = "StepItem";
  static schema = {
    id:         t.Id(t.Integer()),
    isComplete: t.Boolean(),
    position:   t.Integer(),

    description: t.Reference(StepDescription),
    timer:       t.Reference(StepTimer)
  }
}

const recipeTypeEnumSet = t.EnumSet([
  "REGULAR",
  "BAKERS"
])

class Steps extends GQLCollection {
  static entity = Step
}

graphQuery(Steps, {
  name: "steps"
})

class LineageRecipe extends GQLEntity {
  static type = "RecipeItem";
  static schema = {
    id: t.Id(t.Integer())
  }
}

class Recipe extends GQLEntity {
  static type = "RecipeItem";
  static schema = {
    id:           t.Id(t.Integer()),
    name:         t.String(),
    branchType:   t.String(),

    recipeType:   t.Enum(recipeTypeEnumSet),

    origin:       t.Reference(LineageRecipe),
    parent:       t.Reference(LineageRecipe),

    steps:        t.Reference(Steps)
  }
}

function graphQuery(klass, opts) {
  klass.graphOps = klass.graphOps.setIn(["query", opts.name], opts)
}

graphQuery(Recipe, {
  name: "recipe",
  args: {
    id: t.Id(t.Integer())
  }
})

describe("GraphQLTest", () => {
  it("#fieldSet", cb => {
    const store = mockStore()

    // Singular Recipe
    const recipe = new Recipe({store, id: "1"})
    recipe.graphQuery("recipe").then(() => {
      console.log(recipe.updateState().get("name"))
      cb()
    }).catch(cb)

    // All Steps
    // const steps = new Steps({store})
    // steps.graphQuery("steps").then(data => {
    //   console.log(steps.updateState().items.getIn(["10", "description"]))
    //   // console.log(steps.updateState())
    //   // const description = step.getIn(["description", "text"])
    //   // console.log(step)
    //   cb()
    // }).catch(cb)
  })
})
