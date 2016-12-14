
import * as env from '../../config/env'
import * as array from '../../util/array'
import * as object from '../../util/object'
import * as keypath from '../../util/keypath'

export default class Context {

  /**
   * @param {Object} data
   * @param {?Context} parent
   */
  constructor(data, parent) {
    this.data = object.copy(data)
    this.parent = parent
    this.cache = { }
    this.cache[env.THIS] = data
  }

  push(data) {
    return new Context(data, this)
  }

  set(key, value) {
    let { data, cache } = this
    if (object.has(cache, key)) {
      delete cache[key]
    }
    object.set(data, key, value)
  }

  get(key) {

    let instance = this
    let { cache } = instance

    if (!object.has(cache, key)) {
      let result
      let keys = [ key ]
      while (instance) {
        result = object.get(instance.data, key)
        if (result) {
          break
        }
        else {
          instance = instance.parent
          keys.unshift(keypath.LEVEL_PARENT)
        }
      }
      key = keys.join(keypath.SEPARATOR_PATH)
      if (result) {
        cache[key] = result.value
      }
    }

    let value = cache[key]
    if (key === env.THIS) {
      key = keypath.LEVEL_CURRENT
    }

    return {
      value,
      keypath: key,
    }

  }
}
