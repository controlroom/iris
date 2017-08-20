import t from "../src/types"
import { build, implement, emptyImpl } from "../src/mixin"
import { IGraphQL, graphQuery, graphMutation } from "../src/GraphQL"
import { ICollection } from "../src/Collection"
import { IEntity } from "../src/Entity"

import { Recipe } from "./Recipe"

const GQLEntity     = build(implement(IGraphQL, IEntity)(emptyImpl()))
const GQLCollection = build(implement(IGraphQL, ICollection)(emptyImpl()))

class StepDescription extends GQLEntity {
  static type = "StepDescription";
  static schema = {
    id:   t.Id(t.Integer()),
    text: t.String(),

    step: t.Parent()
  }
}

graphMutation(StepDescription, {
  name:   "createStep",
  fields: ["text"]
})

class StepTimer extends GQLEntity {
  static type = "StepTimer";
  static schema = {
    id:        t.Id(t.Integer()),
    duration:  t.Integer(),
    progress:  t.Integer(),
    isRunning: t.Boolean(),
    pausedAt:  t.DateTime(),
    startedAt: t.DateTime(),

    step:      t.Parent()
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
  name:     "createStep",
  optional: true,
  fields:   ["duration"]
})

graphMutation(StepTimer, {
  name:    "updateStepTimer",
  include: ["id"],
  fields:  ["duration", "progress", "isRunning", "pausedAt", "startedAt"]
})

class Step extends GQLEntity {
  static type = "StepItem";
  static schema = {
    id:         t.Id(t.Integer()),
    isComplete: t.Boolean(),
    position:   t.Integer(),

    description: t.Reference(StepDescription, {reverse: "step"}),
    timer:       t.Reference(StepTimer,       {reverse: "step"}),

    recipe:      t.Parent(() => Recipe)
  }

  get recipeId() {
    return this.get("recipe").id
  }

  complete() {
    this.dataMutation("updateStep", {
      isComplete: true
    })
  }
}

graphMutation(Step, {
  name:   "createStep",
  creator: true,
  fields: [
    "position",
    "description",
    "timer",
    {"recipeId": {
      fn:    o => o._getIn(["__data", "recipe", "id"]),
      type: "ID"
    }}
  ]
})

graphMutation(Step, {
  name:   "updateStep",
  include: ["id"],
  fields:  ["isComplete", "position"]
})

class Steps extends GQLCollection {
  static itemConstructor = Step

  get sorted() {
    return this.items.sortBy(i => i.get("position"))
  }
}

graphQuery(Steps, {
  name: "steps"
})

export {
  StepDescription,
  StepTimer,
  Steps,
  Step
}
