
import {
  isObject,
} from './is'

import {
  each,
} from './object'

module.exports = class Store {

  constructor(data) {
    this.data = data || { }
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
