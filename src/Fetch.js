/**
 * connect to the outside world
 * @module iris/Fetch
 */

import { build, implement } from "./mixin"
import { ensureArray, ensureImmutable, checkOpts, merge } from "./utils"
import fetch from "isomorphic-fetch"

const IFetch = (superclass) => {
  /**
   * @alias IFetch
   * @mixin
   */

  class Fetch extends superclass {
    get headers() {
      return ""
    }

    async fetch({url, method = "get", body, headers}) {
      body    = body ? JSON.stringify(body) : ""
      headers = merge(this.headers, headers || {})

      let opts = {method, headers}
      if (method !== "get") opts.body = body

      let response = await fetch(url, {headers, method, body})
      let data     = await response.json();
      return data;
    }
  }

  return Fetch
}

export { IFetch }
