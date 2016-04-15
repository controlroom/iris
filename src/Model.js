/**
 * common mixins for a basic model
 * @module iris/Model
 */

import { IAccess }          from "./Access"
import { IAffect }          from "./Affect"
import { ISnitch }          from "./Snitch"
import { build, implement } from "./mixin"

let IModel = (superclass) => class Model extends superclass {}

IModel = implement(IAccess, IAffect, ISnitch)(IModel)

export { IModel }
export default build(IModel)
