class LineageRecipe extends Entity {
  static graphSchema = {
    id: t.Id()
  }
}

const recipeTypeEnumSet = t.EnumSet([
  "REGULAR",
  "BAKERS"
])

class Recipe extends Entity {
  static graphSchema = {
    id:           t.Id(),
    name:         t.String(),
    branchType:   t.String(),
    isBakers:     t.Boolean(),
    rating:       t.Number(),
    resultNotes:  t.String(),

    recipeType:   t.Enum(recipeTypeEnumSet),

    origin:       t.Reference(LineageRecipe),
    parent:       t.Reference(LineageRecipe),

    steps:        t.Reference(Steps)
  }
}

graphQuery(Recipe, {
  name: "getRecipe",
  arguments: {
    id: t.Id()
  }
})

graphMutation(Recipe, {
  creator: true,
  name:    "createRecipe",
  fields:  ["name", "recipeType"]
})

class Recipes extends Collection {
  get model() {
    return Recipe
  }
}

graphQuery(Recipes, {
  name: "getAllRecipes"
})

class DashboardRecipe extends Entity {
  static graphSchema = {
    rating:    t.Number(),
    updatedAt: t.DateTime(),

    user: t.Object({
      id: t.Id()
    })
  }
}

class BoxedRecipes extends Collection {
  get model() {
    return DashboardRecipe
  }

  get scoped() {
    const currentUserId = buildAuth(this.store).get("userId")
    return this.items
      .filter(r => r.getIn("user", "id") === currentUserId && !r.get("rating"))
      .groupBy(r => r.getIn("origin", "id"))
      .map(group => group.sortBy(r => r.get("rating")).last())
  }
}

graphQuery(BoxedRecipes, {
  name: "getBoxedRecipes"
})

class ActiveRecipes extends Collection {
  get model() {
    return DashboardRecipe
  }

  get scoped() {
    const currentUserId = buildAuth(this.store).get("userId")
    return this.items
      .filter(r => r.getIn("user", "id") === currentUserId && !r.get("rating"))
      .sortBy(r => r.get("updatedAt"))
  }
}

graphQuery(ActiveRecipes, {
  name: "getActiveRecipes"
})

class Steps extends Collection {
  get model() {
    return Step
  }

  get sorted() {
    return this.items.sortBy(i => i.get("position"))
  }
}

class StepDescription extends Entity {
  static graphSchema = {
    text: t.String()
  }
}

graphMutation(StepDescription, {
  name:   "createStep",
  child:  true,
  fields: ["text"]
})

class StepTimer extends Entity {
  static graphSchema = {
    id:        t.Id(),
    duration:  t.Number(),
    progress:  t.Number(),
    isRunning: t.Boolean(),
    pausedAt:  t.DateTime(),
    startedAt: t.DateTime(),
  }

  get remaining () {
    let sinceStarted = 0
    const progress = this.get("progress") || 0
    if(this.get("isRunning")) {
      sinceStarted = Math.floor(
        moment.duration(
          moment().diff(moment(this.get("startedAt"))
        )
      ).asSeconds())
    }

    return this.get("duration") - (progress + sinceStarted)
  }

  // Mutations
  //
  play() {
    this.dataMutation("updateStepTimer", {
      isRunning: true,
      startedAt: moment().toString()
    })
  }

  pause() {
    this.dataMutation("updateStepTimer", {
      isRunning: false,
      progress:  this.get("duration") - this.remaining,
      startedAt: null
    })
  }

  reset() {
    this.dataMutation("updateStepTimer", {
      isRunning: false,
      progress: 0,
      startedAt: null
    })
  }
}

graphMutation(StepTimer, {
  name:  "createStep",
  child:  true,
  fields: ["duration"]
})

graphMutation(StepTimer, {
  name:    "updateStepTimer",
  include: ["id"],
  fields:  ["duration", "progress", "isRunning", "pausedAt", "startedAt"]
})

class Step extends Entity {
  static graphSchema = {
    id:         t.Id(),
    isComplete: t.Boolean(),
    position:   t.Number(),

    description: t.Reference(StepDescription),
    timer:       t.Reference(StepTimer),
  }

  get recipeId() {
    return this.getIn("recipe", "id")
  }
}

graphMutation(Step, {
  name: "createStep",
  creator: true,
  fields: [
    "position",
    "description",
    "timer",
    {"recipe": "recipeId"}
  ]
})


graphMutation(Step, {
  name:   "updateStep",
  fields: ["isComplete", "position"]
})
