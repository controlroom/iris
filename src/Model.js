/**
 * common mixins for a basic model
 * @module iris/Model
 */

import { IAccess }          from "./Access"
import { IAffect }          from "./Affect"
import { ISnitch }          from "./Snitch"
import { build, implement } from "./mixin"

let IModel = (superclass) => {

  /**
   * @alias IModel
   * @mixin
   * @mixes IAccess
   * @mixes IAffect
   * @mixes ISnitch
   */
  class Model extends superclass {
    /**
     * type
     * override if model should be normalized with a type
     *
     * @virtual
     * @returns {(null|string)}
     */
    get type() {
      return null
    }
  }

  return Model
}

IModel = implement(IAccess, IAffect, ISnitch)(IModel)

export { IModel }
export default build(IModel)
