/**
 * bootstrap React components with iris datatypes
 * @module iris/iris
 */

import React, { createElement, Component }  from 'react'
import { Map, is, Set }                     from "immutable"
import { isImplemented }                    from "./utils"

class DataRevaluator {
  constructor(component) {
    this.component       = component
    this.previousState   = Map()
    this.currentIrisData = Map()
    this.currentJSProps  = Map()
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
    const [jsProps, irisProps] = this.extractPropTypes(props)

    const nextIrisData  = irisProps.map(e => currentState.getIn(e.path))
    const isIrisUpdated = !is(this.currentIrisData, nextIrisData)
    const isJSUpdated   = !is(this.currentJSProps,  jsProps)

    if(isIrisUpdated || isJSUpdated) {
      const changed = this.extractChangedIris(renderProps, currentState)

      if (isJSUpdated || changed) {
        this.previousState   = currentState
        this.currentIrisData = nextIrisData
        this.currentJSProps  = jsProps

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
      ...irisProps.map(v => v.resetSnitch()).toObject()
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
   * @param {object} map
   * @param {Map} currentState
   * @returns {(object|false)}
   */
  extractChangedIris(map, currentState) {
    const changes = Object.keys(map).reduce((memo, k) => {
      const v = map[k]
      if(isImplemented(v, "Snitch")
         && v.snitch
         && v.snitch.some(path => {
           return !is(this.previousState.getIn(path), currentState.getIn(path))
         })
      )
      {
        memo[k] = new v.constructor(
          v.opts.merge({
            snitch: Set(),
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
    return Object.keys(props).reduce((memo, k) => {
      const v = props[k]
      isImplemented(v, "Snitch")
        ? memo[1] = memo[1].set(k, v)
        : memo[0] = memo[0].set(k, v)
        return memo
    }, [Map(), Map()])
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

        firstRun ? this.evaluator.boot(nextProps) : this.evaluator.evaluate(nextProps)
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
      store: React.PropTypes.object.isRequired
    };

    return Iris
  }
}

