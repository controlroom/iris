import t from "../src/types"
import { build, implement, emptyImpl } from "../src/mixin"
import { IGraphQL, graphQuery, graphMutation } from "../src/GraphQL"
import { IEntity } from "../src/Entity"
import { ICollection } from "../src/Collection"

import { Steps } from "./Step"

const GQLEntity     = build(implement(IGraphQL, IEntity)(emptyImpl()))
const GQLCollection = build(implement(IGraphQL, ICollection)(emptyImpl()))

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

    recipeType:   t.Enum("RecipeType", recipeTypeEnumSet),

    origin:       t.Reference(LineageRecipe),
    parent:       t.Reference(LineageRecipe),

    steps:        t.Reference(Steps, {reverse: "recipe"})
  }
}

// Pass along metadata to

graphMutation(Recipe, {
  name:    "createRecipe",
  creator: true,
  fields:  ["name", "recipeType"]
})

graphQuery(Recipe, {
  name: "recipe",
  args: {
    id: t.Id(t.Integer())
  }
})

class Recipes extends GQLCollection {
  static itemConstructor = Recipe
}

graphQuery(Recipes, {
  name: "recipes"
})

class DashboardUser extends GQLEntity {
  static type = "User";
  static schema = {
    id: t.Id(t.Integer())
  }
}

class DashboardRecipe extends GQLEntity {
  static type = "RecipeItem";
  static schema = {
    rating:    t.Float(),
    updatedAt: t.DateTime(),

    user: t.Reference(DashboardUser)
  }
}

class BoxedRecipes extends GQLCollection {
  static itemConstructor = DashboardRecipe

  get scoped() {
    // const currentUserId = buildAuth(this.store).get("userId")
    // return this.items
    //   .filter(r => r.getIn("user", "id") === currentUserId && !r.get("rating"))
    //   .groupBy(r => r.getIn("origin", "id"))
    //   .map(group => group.sortBy(r => r.get("rating")).last())
  }
}

graphQuery(BoxedRecipes, {
  name: "getBoxedRecipes"
})

class ActiveRecipes extends GQLCollection {
  static itemConstructor = DashboardRecipe

  get scoped() {
    // const currentUserId = buildAuth(this.store).get("userId")
    // return this.items
    //   .filter(r => r.getIn("user", "id") === currentUserId && !r.get("rating"))
    //   .sortBy(r => r.get("updatedAt"))
  }
}

graphQuery(ActiveRecipes, {
  name: "getActiveRecipes"
})


export {
  Recipe,
  Recipes
}
