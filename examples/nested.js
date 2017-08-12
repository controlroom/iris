import { createStore } from "redux"
import reducer from "../src/reducer"
import { Map, fromJS } from "immutable"
import { build, implement, emptyImpl } from "../src/mixin"
import { IGraphQL, graphQuery } from "../src/GraphQL"
import { IEntity } from "../src/Entity"
import { ICollection } from "../src/Collection"
import t from "../src/types"

import { Recipe } from "./Recipe"

// graphMutation(Recipe, {
//   creator: true,
//   name:    "createRecipe",
//   fields:  ["name", "recipeType"]
// })
//
// class Recipes extends GQLCollection {
//   get model() {
//     return Recipe
//   }
// }
//
// graphQuery(Recipes, {
//   name: "getAllRecipes"
// })
//
// class DashboardRecipe extends GQLEntity {
//   static graphSchema = {
//     rating:    t.Number(),
//     updatedAt: t.DateTime(),
//
//     user: t.Object({
//       id: t.Id()
//     })
//   }
// }
//
// class BoxedRecipes extends GQLCollection {
//   get model() {
//     return DashboardRecipe
//   }
//
//   get scoped() {
//     const currentUserId = buildAuth(this.store).get("userId")
//     return this.items
//       .filter(r => r.getIn("user", "id") === currentUserId && !r.get("rating"))
//       .groupBy(r => r.getIn("origin", "id"))
//       .map(group => group.sortBy(r => r.get("rating")).last())
//   }
// }
//
// graphQuery(BoxedRecipes, {
//   name: "getBoxedRecipes"
// })
//
// class ActiveRecipes extends GQLCollection {
//   get model() {
//     return DashboardRecipe
//   }
//
//   get scoped() {
//     const currentUserId = buildAuth(this.store).get("userId")
//     return this.items
//       .filter(r => r.getIn("user", "id") === currentUserId && !r.get("rating"))
//       .sortBy(r => r.get("updatedAt"))
//   }
// }
//
// graphQuery(ActiveRecipes, {
//   name: "getActiveRecipes"
// })
//
// class Steps extends GQLCollection {
//   get model() {
//     return Step
//   }
//
//   get sorted() {
//     return this.items.sortBy(i => i.get("position"))
//   }
// }
//
// class StepDescription extends GQLEntity {
//   static graphSchema = {
//     text: t.String()
//   }
// }
//
// graphMutation(StepDescription, {
//   name:   "createStep",
//   child:  true,
//   fields: ["text"]
// })
//
// class StepTimer extends GQLEntity {
//   static graphSchema = {
//     id:        t.Id(),
//     duration:  t.Number(),
//     progress:  t.Number(),
//     isRunning: t.Boolean(),
//     pausedAt:  t.DateTime(),
//     startedAt: t.DateTime(),
//   }
//
//   get remaining () {
//     let sinceStarted = 0
//     const progress = this.get("progress") || 0
//     if(this.get("isRunning")) {
//       sinceStarted = Math.floor(
//         moment.duration(
//           moment().diff(moment(this.get("startedAt"))
//         )
//       ).asSeconds())
//     }
//
//     return this.get("duration") - (progress + sinceStarted)
//   }
//
//   // Mutations
//   //
//   play() {
//     this.dataMutation("updateStepTimer", {
//       isRunning: true,
//       startedAt: moment().toString()
//     })
//   }
//
//   pause() {
//     this.dataMutation("updateStepTimer", {
//       isRunning: false,
//       progress:  this.get("duration") - this.remaining,
//       startedAt: null
//     })
//   }
//
//   reset() {
//     this.dataMutation("updateStepTimer", {
//       isRunning: false,
//       progress: 0,
//       startedAt: null
//     })
//   }
// }
//
// graphMutation(StepTimer, {
//   name:  "createStep",
//   child:  true,
//   fields: ["duration"]
// })
//
// graphMutation(StepTimer, {
//   name:    "updateStepTimer",
//   include: ["id"],
//   fields:  ["duration", "progress", "isRunning", "pausedAt", "startedAt"]
// })
//
// class Step extends GQLEntity {
//   static graphSchema = {
//     id:         t.Id(),
//     isComplete: t.Boolean(),
//     position:   t.Number(),
//
//     description: t.Reference(StepDescription),
//     timer:       t.Reference(StepTimer),
//   }
//
//   get recipeId() {
//     return this.getIn("recipe", "id")
//   }
// }
//
// graphMutation(Step, {
//   name: "createStep",
//   creator: true,
//   fields: [
//     "position",
//     "description",
//     "timer",
//     {"recipe": "recipeId"}
//   ]
// })
//
//
// graphMutation(Step, {
//   name:   "updateStep",
//   fields: ["isComplete", "position"]
// })


const store = createStore(reducer, fromJS({}))

// Singular Recipe
const recipe = new Recipe({store, id: "1"})
recipe.graphQuery("recipe").then(() => {
  const steps = recipe.updateState().get("steps")
  const firstStep = steps.first()
  const basedRecipe = firstStep.get("recipe")

  console.log(firstStep, basedRecipe)
}).catch(console.error)

// All Steps
// const steps = new Steps({store})
// steps.graphQuery("steps").then(data => {
//   console.log(steps.updateState().items.getIn(["10", "description"]))
//   // console.log(steps.updateState())
//   // const description = step.getIn(["description", "text"])
//   // console.log(step)
//   cb()
// }).catch(cb)
