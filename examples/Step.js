import t from "../src/types"
import { build, implement, emptyImpl } from "../src/mixin"
import { IGraphQL, graphQuery } from "../src/GraphQL"
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
}

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
}

class Steps extends GQLCollection {
  static itemConstructor = Step
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
