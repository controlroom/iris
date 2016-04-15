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

  const spyClass = () => {
    const renderSpy = expect.createSpy()
    class SpyClass extends Component {
      render() {
        renderSpy()
        return (
          <div>
            {this.props.spyFn && this.props.spyFn(this.props)}
          </div>
        )
      }
    }

    return [renderSpy, SpyClass]
  }

  describe.skip("basic changes", () => {
    let renderSpy, spyFn, model, Ele, store, node
    before(() => {
      const [rS, DidRender] = spyClass()
      renderSpy = rS
      const irisFn = (store, _) => {
        model = new Model({store})
        return {model: model}
      }
      spyFn = (props) => props.model.get(["v1", "v2"])
      Ele   = iris(irisFn)(DidRender)
      store = createStore(reducer, Map())
      node  = global.document.createElement("div")
      render(
        <Provider store={store}>
          <Ele {...{spyFn}} />
        </Provider>,
        node
      )
    })

    it("rerenders after model change", () => {
      model.set(["v1", "v2"], 400)
      expect(renderSpy.calls.length).toEqual(2)
    })

    it("rerenders after prop change", () => {
      const newProp = "rad"
      render(
        <Provider store={store}>
          <Ele {...{spyFn, newProp}} />
        </Provider>,
        node
      )
      expect(renderSpy.calls.length).toEqual(3)
    })

    it("does not rerender unless unique prop change", () => {
      const newProp = "rad"
      render(
        <Provider store={store}>
          <Ele {...{spyFn, newProp}} />
        </Provider>,
        node
      )
      expect(renderSpy.calls.length).toEqual(3)
    })
  })

  describe("Simple Snitch changes", () => {
    let Ele1, spy1, fn1, Ele2, spy2, fn2, model
    before(() => {
      const store  = createStore(reducer, Map())
      model        = new Model({store})
      const [s1, E1] = spyClass()
      const [s2, E2] = spyClass()
      spy1 = s1; spy2 = s2
      Ele1         = iris()(E1)
      Ele2         = iris()(E2)
      fn1          = params => params.model.get("attr1") || "rad"
      fn2          = params => params.model.get("attr2") || "rad"
      const node   = global.document.createElement("div")
      render(
        <Provider {...{store}}>
          <div>
            <Ele1 {...{spyFn: fn1, model}} />
            <Ele2 {...{spyFn: fn2, model}} />
          </div>
        </Provider>,
        node
      )
    })

    it("rerenders only after affected model change", () => {
      model.set("attr1", 400)
      model.set("attr1", 500)
      expect(spy1.calls.length).toEqual(3)
      model.set("attr2", 800)
      expect(spy2.calls.length).toEqual(2)
    })
  })
})
