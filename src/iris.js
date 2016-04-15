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
      // shouldComponentUpdate(nextProps, nextState, nextContext) {
      //   return this.shouldRender
      // }

      constructor(props, context) {
        super(props, context)
        this.store  = props.store || context.store
      }

      get preparedProps() {
        return irisFn && irisFn(this.store, this.props) || {}
      }

      reEvaluate(props, firstRun = false) {
        const nextFinal = Object.assign({}, this.preparedProps, props)
        const nextPreparedData = Map(nextFinal).map((v, k) => {
          return isImplemented(v, "Store") ? v.updateState().data : v
        })

        if(firstRun || !is(this.currentPreparedData, nextPreparedData)) {
          // Check each snitched path
          const snitches = Map(this.finalProps).filter((v, k) => {
            return isImplemented(v, "Snitch")
          })

          const changed = !snitches.some((v, k) => {
            const before  = v.state
            const current = v.updateState().state

            return !v.snitch.some(path => {
              return !is(before.getIn(path), current.getIn(path))
            })
          })

          if (firstRun || changed) {
            this.finalProps = Map(nextFinal).map((v, k) => {
              v = isImplemented(v, "Store")  ? v.updateState() : v
              v = isImplemented(v, "Snitch") ? v.resetSnitch() : v
              return v
            }).toJS()

            this.currentPreparedData = nextPreparedData

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

