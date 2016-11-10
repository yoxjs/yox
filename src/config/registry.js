
import {
  isObject,
} from '../util/is'

import {
  each,
} from '../util/object'

class Store {

  constructor() {
    this.data = { }
  }

  get(key) {
    return this.data[key]
  }

  set(key, value) {
    let { data } = this
    if (isObject(key)) {
      each(
        key,
        function (value, name) {
          data[name] = value
        }
      )
    }
    else {
      data[key] = value
    }
  }

}

export let component = new Store()
export let directive = new Store()
export let filter = new Store()
export let partial = new Store()
