import { Set } from "immutable"
import { Metal } from "./mixin"

const lookupClass = (klass) => {
  if (klass.__iris_implements) {
    return klass
  }

  return klass()
}

const types = {
  //---  Aggregators  ----------------------------------------------------------
  Maybe: (types, ...preds) => {},
  Any: (...preds) => check => true,

  //---  Builders  -------------------------------------------------------------
  EnumSet: (arr) => new Set(arr),

  //---  Types  ----------------------------------------------------------------
  isIdType: type => type.kind === "id",
  Id: (type = types.Integer()) => ({
    check: type.check,
    kind: "id"
  }),

  isBooleanType: type => type.kind === "bool",
  Boolean: (...opts) => ({
    opts,
    check: val => typeof(val) === "boolean",
    kind: "bool"
  }),

  isIntegerType: type => type.kind === "int",
  Integer: (...opts) => ({
    opts,
    check: Number.isInteger,
    kind: "int"
  }),

  isFloatType: type => type.kind === "float",
  Float: (...opts) => ({
    opts,
    check: val => typeof(val) === "number" && !Number.isInteger(val),
    kind: "float"
  }),

  isEnumType: type => type.kind === "enum",
  Enum: (set) => ({
    set,
    check: set.has,
    kind: "enum"
  }),

  isStringType: type => type.kind === "string",
  String: (...opts) => ({
    opts,
    check: val => typeof(val) === "string",
    kind: "string"
  }),

  isDateTimeType: type => type.kind === "dateTime",
  DateTime: (...opts) => ({
    opts,
    kind: "dateTime"
  }),

  isReferenceType: type => type.kind === "ref",
  Reference: (klass, opts) => ({
    opts,
    get klass() {
      return lookupClass(klass)
    },
    kind: "ref"
  }),

  isParentType: type => type.kind === "parent",
  Parent: (klass, opts) => ({
    opts,
    get klass() {
      return lookupClass(klass)
    },
    kind: "parent"
  })
}

export default types
module.exports = types
