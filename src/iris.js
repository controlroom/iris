/**
 * bootstrap React components with iris datatypes
 * @module iris/iris
 */

import React, { createElement, Component } from 'react'
import { Map, is } from "immutable"
import { isImplemented } from "./utils"

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

      get baseProps() {
        return { dispatch: this.store.dispatch }
      }

      get preparedProps() {
        return irisFn(this.store, this.props) || {}
      }

      reEvaluate(props) {
        const nextFinal = Object.assign({}, this.preparedProps, props, this.baseProps)
        const nextPreparedData = Map(nextFinal).map((v, k) => {
          return isImplemented(v, "Data") ? v.updateState().data : v
        })

        if(!is(this.currentPreparedData, nextPreparedData)) {
          this.shouldRender = true
          this.finalProps   = Map(nextFinal).map((v, k) => {
            return isImplemented(v, "Data") ? v.updateState() : v
          }).toJS()
          this.currentPreparedData = nextPreparedData
          this.setState({})
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
        this.reEvaluate(this.props)
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

