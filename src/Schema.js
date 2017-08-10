/**
 * Helpers for accessing schema setup
 *
 * @module iris/Schema
 */

import { build, implement } from "./mixin"

let ISchema = (superclass) => class Schema extends superclass {
  static get schemaKeys() {
    return Object.keys(this.schema)
  }

  get schemaKeys() {
    return this.constructor.schemaKeys
  }

  get schema() {
    return this.constructor.schema
  }

  static typeFromSchema(key) {
    return this.schema[key]
  }

  typeFromSchema(key) {
    return this.schema[key]
  }
}

export { ISchema }
