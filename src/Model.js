/**
 * common mixins for a basic model
 * @module iris/Model
 */

import { IData }            from "./Data"
import { build, implement } from "./mixin"

let IModel = (superclass) => class Model extends superclass { }

IModel = implement(IData)(IModel)

export { IModel }
export default build(IModel)
