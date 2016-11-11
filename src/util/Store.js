
import * as is from '../util/is'
import * as object from '../util/object'

export default class Store {

  constructor() {
    this.data = { }
  }

  get(key) {
    return this.data[key]
  }

  set(key, value) {
    let { data } = this
    if (is.object(key)) {
      object.each(
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