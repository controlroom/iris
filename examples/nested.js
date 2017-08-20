import { createStore } from "redux"
import reducer from "../src/reducer"
import { Map, fromJS, List } from "immutable"
import { build, implement, emptyImpl } from "../src/mixin"
import { IGraphQL, graphQuery } from "../src/GraphQL"
import { IEntity } from "../src/Entity"
import { ICollection } from "../src/Collection"
import t from "../src/types"

import { Recipe, Recipes } from "./Recipe"
import { Step, Steps } from "./Step"


const store = createStore(reducer, fromJS({}))
const printStore = () =>
  console.log(JSON.stringify(store.getState().toJS(), null, "  "))

// --- Build New Recipe (With everything)
//
// const recipe = Recipe.build({store})
// const step = recipe.buildNew("steps", {
//   position: 12
// })
//
// step.buildNew("description")
// step.buildNew("timer")


// --- Build new recipe with basics for creator mutation
//
// const newRecipe = Recipe.build({store}, {
//   name: "Ben's Recipe",
//   recipeType: "REGULAR"
// })
//
// newRecipe.graphMutation("createRecipe").then(() => {
//   console.log(JSON.stringify(store.getState().toJS(), null, "  "))
// })


// --- Load All Recipes
//
// const recipes = new Recipes({store})
// recipes.graphQuery("recipes").then(() => {
//   recipes.updateState().items.forEach(a => {
//     console.log(a.get("name"))
//   })
//   // printStore()
// })


// --- Load Recipe
//
// const recipe = new Recipe({store, id: "3"})
// recipe.graphQuery("recipe").then(() => {
//   console.log(recipe)
// })


// --- Singular Recipe
//
// const recipe = new Recipe({store, id: "1"})
// recipe.graphQuery("recipe").then(() => {
//
//   // step.traverse("__data").merge({
//   //   isComplete: false
//   // })
//   //
//   // step.flag("isNew")
//
//   console.log(JSON.stringify(store.getState().toJS(), null, "  "))
//   // const newStep = Step.build({store})
//   // newStep.traverse("__data").merge({
//   //   position: 1,
//   //   recipeId: recipe.updateState().get("id")
//   // })
//   //
//   // console.log(newStep.updateState().get("position"))
// //   const steps = recipe.updateState().get("steps")
// //   const firstStep = steps.first()
// //   const basedRecipe = firstStep.get("recipe")
// //
// //   console.log(firstStep, basedRecipe)
// }).catch(console.error)
//

// -- Build new step with relationships

const recipe = new Recipe({store, id: "11"})
const step = recipe.buildNew("steps", {
  position: 12
})

step.buildNew("description", {
  text: "This is a thing that I really want to work"
})

step.buildNew("timer", {
  duration: 12
})


// printStore()
// step.updateState().graphMutation("createStep")
// step.updateState().graphMutation("createStep").then((data) => {
//   printStore()
// })

// step.graphMutation("createStep").then(() => {
//   printStore()
//   // console.log(step.updateState().recipeId)
// })

// --- All Steps
// const steps = new Steps({store})
// steps.graphQuery("steps").then(data => {
//   // console.log(steps.updateState().items.getIn(["10", "description"]))
//   // console.log(steps.updateState())
//   // const description = step.getIn(["description", "text"])
//   // console.log(step)
//   printStore()
// })
