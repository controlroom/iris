/**
 * bootstrap React components with iris datatypes
 * @module iris/iris
 */

import React, { createElement, Component }  from "react"
import { Map, is, Set, fromJS }             from "immutable"
import { isImplemented }                    from "./utils"
import PropTypes                            from "prop-types"

class DataRevaluator {
  constructor(component) {
    this.component       = component
    this.previousState   = Map()
    this.currentIrisData = Map()
    this.currentJSProps  = Map()
    this.snitches        = Map()
  }

  /**
   * evaluate
   *
   * 1. Has the overall data changed?
   * 2. Find changed Models
   *    2a. Update State & Snitch
   * 3. Rerender
   *
   * @param {object} props
   * @returns {void}
   */
  evaluate(props) {
    const renderProps          = this.component.renderProps
    const currentState         = this.component.store.getState()
    const [JSProps, irisProps] = this.extractPropTypes(props)

    const nextIrisData  = irisProps.map(e => currentState.getIn(e.path))
    const isIrisUpdated = !is(this.currentIrisData, nextIrisData)
    const isJSUpdated   = !is(this.currentJSProps,  JSProps)

    if(isIrisUpdated || isJSUpdated) {
      const changed = this.extractChangedIris(irisProps, currentState)

      if (isJSUpdated || changed) {
        this.previousState   = currentState
        this.currentIrisData = nextIrisData
        this.currentJSProps  = JSProps

        const finalProps = {
          ...props,
          ...changed
        }

        this.component.shouldRender = true
        this.component.renderProps  = finalProps
        this.component.forceUpdate()
      }
    }
  }

  boot(props) {
    const [jsProps, irisProps] = this.extractPropTypes(props)
    const currentState         = this.component.store.getState()
    const nextIrisData         = irisProps.map(e => currentState.getIn(e.path))
    this.currentJSProps        = jsProps
    this.currentIrisData       = nextIrisData
    this.previousState         = currentState


    const finalProps = {
      ...props,
      ...irisProps.map((v, k) => {
        return v.resetSnitch(this._pushSnitchPath(k))
      }).toObject()
    }

    this.component.renderProps = finalProps
  }

  /**
   * extractChangedIris
   *
   * Using the snitch paths, we extract the objects that need to change.  We
   * return a map with changed Iris object or false if nothing.  Also to save
   * time, we update the object with new State and Snitch
   *
   * @param {Map} irisProps
   * @param {Map} currentState
   * @returns {(object|false)}
   */
  extractChangedIris(irisProps, currentState) {
    const changes = irisProps.reduce((memo, v, k) => {
      if(this.snitches.get(k) && this.snitches.get(k).some(path => {
        return !is(
          this.previousState.getIn(path),
          currentState.getIn(path)
        )
      }))
      {
        this.snitches = this.snitches.set(k, Set())
        memo[k] = new v.constructor(
          v.opts.merge({
            snitch: this._pushSnitchPath(k),
            state: currentState
          })
        )
      }

      return memo
    }, {})

    return Object.keys(changes).length > 0 ? changes : false
  }

  /**
   * extractPropTypes
   *
   * Split out vanilla JS props and specific Iris data types
   *
   * @param {object} props
   * @returns {[Map, Map]}
   */
  extractPropTypes(props) {
    return Object.entries(props).reduce((memo, [k, v]) => {
      isImplemented(v, "Snitch")
        ? memo[1] = memo[1].set(k, v)
        : memo[0] = memo[0].set(k, v)
        return memo
    }, [Map(), Map()])
  }

  _pushSnitchPath(k) {
    return path => {
      this.snitches = this.snitches.set(
        k,
        this.snitches.get(k, Set()).add(path)
      )
    }
  }
}

export default (irisFn) => {
  return (Child) => {
    class Iris extends Component {
      shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.shouldRender
      }

      constructor(props, context) {
        super(props, context)
        this.store       = props.store || context.store
        this.evaluator   = new DataRevaluator(this)
        this.renderProps = {}
      }

      get preparedProps() {
        return irisFn && irisFn(this.store, this.props) || {}
      }

      reEvaluate(props, firstRun = false) {
        const nextProps = {
          ...this.preparedProps,
          ...props
        }

        firstRun
         ? this.evaluator.boot(nextProps)
         : this.evaluator.evaluate(nextProps)
      }

      storeChanged() {
        this.reEvaluate(this.props)
      }

      componentWillReceiveProps(next) {
        this.reEvaluate(next)
      }

      componentWillMount() {
        this.unsubscribe = this.store.subscribe(this.storeChanged.bind(this))
        this.reEvaluate(this.props, true)
      }

      componentWillUnmount() {
        this.unsubscribe()
      }

      render() {
        this.shouldRender = false
        return createElement(Child, this.renderProps)
      }
    }

    Iris.contextTypes = {
      store: PropTypes.object.isRequired
    };

    return Iris
  }
}

