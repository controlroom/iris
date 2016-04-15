/**
 * bootstrap React components with iris datatypes
 * @module iris/iris
 */

import React, { createElement, Component }  from 'react'
import { Map, is, Set }                     from "immutable"
import { isImplemented }                    from "./utils"

export default (irisFn) => {
  return (Child) => {
    class Iris extends Component {
      shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.shouldRender
      }

      constructor(props, context) {
        super(props, context)
        this.store = props.store || context.store
      }

      get preparedProps() {
        return irisFn && irisFn(this.store, this.props) || {}
      }

      reEvaluate(props, firstRun = false) {
        // Gather all Props
        const nextProps = Map({...this.preparedProps, ...props})

        // Split props based on Plain JS and Snitchable
        const [jsProps, irisProps] = nextProps.reduce((memo, v, k) => {
          isImplemented(v, "Snitch")
            ? memo[1] = memo[1].set(k, v)
            : memo[0] = memo[0].set(k, v)
          return memo
        }, [Map(), Map()])

        // Gather updated states for Iris props
        const nextIrisData = irisProps.map((v, k) => v.updateState().data)

        const isIrisUpdated = !is(this.currentIrisData, nextIrisData)
        const isJSUpdated   = !is(this.currentJSProps,  jsProps)

        if(firstRun || isIrisUpdated || isJSUpdated) {
          const changed = Map(this.finalProps).filter((v, k) => {
            if(isImplemented(v, "Snitch")) {
              const before  = v.state
              const current = v.updateState().state

              if(!v.snitch) return true

              return v.snitch.some(path => {
                return !is(before.getIn(path), current.getIn(path))
              })
            }
          })

          if (firstRun || isJSUpdated || !changed.isEmpty()) {
            this.shouldRender = true
            this.finalProps = nextProps.map((v, k) => {
              v = isImplemented(v, "Store")  ? v.updateState() : v
              v = isImplemented(v, "Snitch") ? v.resetSnitch() : v
              return v
            }).toObject()

            this.currentIrisData = nextIrisData
            this.currentJSProps  = jsProps

            // only rerender after intial render setup
            !firstRun && this.forceUpdate()
          }
        }
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
        return createElement(Child, this.finalProps)
      }
    }

    Iris.contextTypes = {
      store: React.PropTypes.object.isRequired
    };

    return Iris
  }
}

