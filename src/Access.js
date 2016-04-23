/**
 * Domain data accessors
 * @module iris/DomainAccess
 */

import { IStore }            from "./Store"
import { ICursor }           from "./Cursor"
import { build, implement }  from "./mixin"

let IAccess = (superclass) => {

  /**
   * @alias IAccess
   * @mixin
   * @mixes IStore
   * @mixes ICursor
   */
  class Access extends superclass {
    /**
     * Return immutable data at the current path
     * @type {Immutable.Collection}
     */
    get data() {
      return this.state.getIn(this.path)
    }

    /**
     * Return immutable data at the current path. RAW ACCESS: Created not to
     * override.
     * @type {Immutable.Collection}
     */
    get _data() {
      return this.state.getIn(this.path)
    }

    /**
     * Return immutable data using path from data root
     * @arg {(Array|string)} path
     * @type {Immutable.Collection}
     */
    getInRoot(path) {
      return this.state.getIn(path)
    }

    /**
     * Return immutable data using path from current position
     * @arg {(Array|string)} path
     * @type {Immutable.Collection}
     */
    getIn(path) {
      return this.state.getIn(this.appendPath(path))
    }

    /**
     * @type {Immutable.Collection}
     */
    get(path) {
      return this.getIn(path)
    }
  }

  return Access
}

IAccess = implement(IStore, ICursor)(IAccess)
export { IAccess }
