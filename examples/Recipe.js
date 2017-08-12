import t from "../src/types"
import { build, implement, emptyImpl } from "../src/mixin"
import { IGraphQL, graphQuery } from "../src/GraphQL"
import { IEntity } from "../src/Entity"

import { Steps } from "./Step"

const GQLEntity = build(implement(IGraphQL, IEntity)(emptyImpl()))

class LineageRecipe extends GQLEntity {
  static type = "RecipeItem";
  static schema = {
    id: t.Id()
  }
}

const recipeTypeEnumSet = t.EnumSet([
  "REGULAR",
  "BAKERS"
])

class Recipe extends GQLEntity {
  static type = "RecipeItem";
  static schema = {
    id:           t.Id(t.Integer()),
    name:         t.String(),
    branchType:   t.String(),

    recipeType:   t.Enum(recipeTypeEnumSet),

    origin:       t.Reference(LineageRecipe),
    parent:       t.Reference(LineageRecipe),

    steps:        t.Reference(Steps, {reverse: "recipe"})
  }
}

graphQuery(Recipe, {
  name: "recipe",
  args: {
    id: t.Id(t.Integer())
  }
})

export {
  Recipe
}
