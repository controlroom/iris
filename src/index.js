/**
 * @module iris
 * @private
 */

export Collection, { ICollection }   from "./Collection"
export Model, { IModel }             from "./Model"

export { IAccess }                   from "./Access"
export { IAffect }                   from "./Affect"
export { ICursor }                   from "./Cursor"
export { IStore }                    from "./Store"

export iris                          from "./iris"
export reducer, { registerReducer }  from "./reducer"
export { build, implement }          from "./mixin"
export { checkOpts }                 from "./utils"
