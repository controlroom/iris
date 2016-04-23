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
import Model from "../src/Model"
import Collection from "../src/Collection"
import reducer from "../src/reducer"
import { Provider } from "react-redux"
import { Map, fromJS } from "immutable"

const mockStore = configureMockStore()
const basicStore = mockStore()

class BasicMock extends Component {
  render() {
    return <div></div>
  }
}

const renderToDom = (toRender) => {
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
    let renderSpy = expect.createSpy()
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

  describe("basic changes", () => {
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
      spy1 = s1;
      spy2 = s2;
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

  describe("Collection Snitch", () => {
    @iris()
    class ModelClass extends Component {
      render() {
        return(
          <div>
            {this.props.item.get("name")}
          </div>
        )
      }
    }

    @iris((store, props) => ({
      collection: new Collection({store, path: ["collection"], model: Model})
    }))
    class CollectionClass extends Component {
      render() {
        const { spy, collection, fn } = this.props
        spy()
        return (
          <div>
            {collection.map(item => {
              return (
                <div>
                  {fn(item)}
                </div>
              )
            })}
          </div>
        )
      }
    }

    let newStore = () => createStore(reducer, fromJS({
      collection: {
        1: {
          id: 1,
          name: "Kevin"
        },
        2: {
          id: 2,
          name: "Rachelle"
        }
      }
    }))

    it("should rerender collection on each change", () => {
      const store   = newStore()
      const collSpy = expect.createSpy()
      const node    = global.document.createElement("div")
      const fn      = item => {
        return item.get("name")
      }
      render(
        <Provider {...{store}}>
          <CollectionClass spy={collSpy} fn={fn} />
        </Provider>,
        node
      )
      const model = new Model({store, path: ["collection", "1"]})
      model.set("name", "radical")
      expect(collSpy.calls.length).toBe(2)
    })

    it("should only render once when delegating", () => {
      const store   = newStore()
      const collSpy = expect.createSpy()
      const node    = global.document.createElement("div")
      const fn      = item => {
        return (
          <ModelClass displayName="[Model]"item={item} />
        )
      }
      render(
        <Provider {...{store}}>
          <CollectionClass displayName="[Collection]" spy={collSpy} fn={fn} />
        </Provider>,
        node
      )
      const model = new Model({store, path: ["collection", "1"]})
      model.set("name", "radical")
      expect(collSpy.calls.length).toBe(1)
    })
  })
})
