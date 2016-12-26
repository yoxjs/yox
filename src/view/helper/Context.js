
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as keypathUtil from 'yox-common/util/keypath'

export default class Context {

  /**
   * @param {Object} data
   * @param {?Context} parent
   */
  constructor(data, parent) {
    this.data = object.copy(data)
    this.parent = parent
    this.cache = { }
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
      let keys = [ keypath ]
      while (instance) {
        result = object.get(instance.data, keypath)
        if (result) {
          break
        }
        else {
          instance = instance.parent
          keys.unshift(keypathUtil.LEVEL_PARENT)
        }
      }
      keypath = keys.join(keypathUtil.SEPARATOR_PATH)
      if (result) {
        cache[keypath] = result.value
      }
    }

    let value = cache[keypath]
    if (keypath === 'this') {
      keypath = keypathUtil.LEVEL_CURRENT
    }

    return {
      value,
      keypath,
    }

  }
}
