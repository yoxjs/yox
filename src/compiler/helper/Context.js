
import * as object from '../../util/object'
import * as expression from '../../util/expression'

module.exports = class Context {

  /**
   * @param {Object} data
   * @param {?Context} parent
   */
  constructor(data, parent) {
    let instance = this
    instance.data = data
    instance.parent = parent
    instance.cache = {}
    instance.cache[expression.THIS_ARG] = data
  }

  push(data) {
    return new Context(data, this)
  }

  set(keypath, value) {
    let { data, cache } = this
    if (object.has(cache, keypath)) {
      delete cache[keypath]
    }
    if (keypath.indexOf('.') > 0) {
      let terms = keypath.split('.')
      let prop = terms.pop()
      let result = object.get(data, terms.join('.'))
      if (result) {
        result.value[prop] = value
      }
    }
    else {
      data[keypath] = value
    }
  }

  get(keypath) {

    let instance = this
    let { cache } = instance
    if (!object.has(cache, keypath)) {
      let result
      while (instance) {
        result = object.get(instance.data, keypath)
        if (result) {
          cache[keypath] = result.value
          break
        }
        else {
          instance = instance.parent
        }
      }
    }

    return cache[keypath]

  }
}
