import { jsdom } from 'jsdom'

global.document = jsdom('<!doctype html><html><body></body></html>')
global.window = document.defaultView
global.navigator = global.window.navigator

import React, { Component, createElement } from "react"
import { render } from "react-dom"
import configureMockStore from "redux-mock-store"
import { createStore } from "redux"
import expect from "expect"
import { renderIntoDocument, mockComponent } from "react-addons-test-utils"

import iris from "../src/iris"
import { buildModel, modelReducer } from "../src/Model"
import { Provider } from "react-redux"
import { Map } from "immutable"

const mockStore = configureMockStore()
const basicStore = mockStore()

class BasicMock extends Component {
  render() {
    return <div></div>
  }
}

describe("iris", () => {
  it("calls irisFn with (store, props) as arguments", () => {
    const irisFn    = expect.createSpy()
    const Ele       = iris(irisFn)(BasicMock)
    const props     = {a: 1}
    renderIntoDocument(
      <Provider store={basicStore}>
        <Ele {...props} />
      </Provider>
    )
    expect(irisFn).toHaveBeenCalledWith(basicStore, props)
  })

  it("return from irisFn is injected into child props", (done) => {
    class CheckProps extends Component {
      constructor(props) {
        super(props)
        expect(props.radical).toExist()
        done()
      }
      render() {
        return <div></div>
      }
    }

    const irisFn = (a, b) => ({radical: true})
    const Ele = iris(irisFn)(CheckProps)

    renderIntoDocument(
      <Provider store={basicStore}>
        <Ele />
      </Provider>
    )
  })

  describe.skip("changes", () => {
    let renderSpy, model, Ele, store, node
    before(() => {
      renderSpy = expect.createSpy()
      class DidRender extends Component {
        render() {
          renderSpy()
          return <div>
            {this.props.model.getIn(["v1", "v2"])}
          </div>
        }
      }

      const irisFn = (store, _) => {
        model = buildModel(store)
        return {model}
      }
      Ele = iris(irisFn)(DidRender)
      const reducer = (state, action) => {
        const runner = modelReducer[action.type]
        if (runner) return runner(state, action)
        return state
      }
      store = createStore(reducer, Map())
      node = global.document.createElement("div")
      render(
        <Provider store={store}>
          <Ele />
        </Provider>,
        node
      )
    })

    it("rerenders after model change", () => {
      model.set(["v1", "v2"], 400)
      expect(renderSpy.calls.length).toEqual(2)
    })

    it("rerenders after prop change", () => {
      render(
        <Provider store={store}>
          <Ele newProp="rad" />
        </Provider>,
        node
      )
      expect(renderSpy.calls.length).toEqual(3)
    })

    it("does not rerender unless unique prop change", () => {
      render(
        <Provider store={store}>
          <Ele newProp="rad" />
        </Provider>,
        node
      )
      expect(renderSpy.calls.length).toEqual(3)
    })

  })
})


