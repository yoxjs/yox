
import {
  has,
  get,
  set,
} from '../../util/object'

module.exports = class Context {

  /**
   * @param {Object} data
   * @param {?Context} parent
   */
  constructor(data, parent) {
    this.data = data
    this.parent = parent
    this.cache = {
      'this': data
    }
  }

  push(data) {
    return new Context(data, this)
  }

  set(keypath, value) {
    let { data, cache } = this
    if (has(cache, keypath)) {
      delete cache[keypath]
    }
    if (keypath.indexOf('.') > 0) {
      let terms = keypath.split('.')
      let prop = terms.pop()
      let result = get(data, terms.join('.'))
      if (result) {
        result.value[prop] = value
      }
    }
    else {
      data[keypath] = value
    }
  }

  get(keypath) {

    let context = this
    let { cache } = context
    if (!has(cache, keypath)) {
      let result
      while (context) {
        result = get(context.data, keypath)
        if (result) {
          cache[keypath] = result.value
          break
        }
        else {
          context = context.parent
        }
      }
    }

    return cache[keypath]

  }
}
