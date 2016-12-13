
import * as env from '../../config/env'
import * as array from '../../util/array'
import * as object from '../../util/object'

export default class Context {

  /**
   * @param {Object} data
   * @param {?Context} parent
   */
  constructor(data, parent) {
    let instance = this
    instance.data = data
    instance.parent = parent
    let cache = instance.cache = { }
    cache[env.THIS] = data
  }

  push(data) {
    return new Context(data, this)
  }

  set(keypath, value) {
    let { data, cache } = this
    if (object.has(cache, keypath)) {
      delete cache[keypath]
    }
    object.set(data, keypath, value)
  }

  get(keypath) {

    let instance = this
    let { cache } = instance

    if (!object.has(cache, keypath)) {
      let result
      let keypaths = [ keypath ]
      while (instance) {
        result = object.get(instance.data, keypath)
        if (result) {
          break
        }
        else {
          instance = instance.parent
          keypaths.unshift('..')
        }
      }
      keypath = keypaths.join('/')
      if (result) {
        cache[keypath] = result.value
      }
    }

    let value = cache[keypath]
    if (keypath === env.THIS) {
      keypath = '.'
    }

    return {
      value,
      keypath,
    }

  }
}
