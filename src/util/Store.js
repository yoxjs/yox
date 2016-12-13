
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
        function (value, key) {
          data[key] = value
        }
      )
    }
    else if (is.string(key)) {
      data[key] = value
    }
  }

}
