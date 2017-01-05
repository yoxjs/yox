
/**
 * <Component ref="component" />
 * <input ref="input">
 */

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as logger from 'yox-common/util/logger'

export default {

  attach({ el, key, node, instance, component }) {
    let { value } = node
    if (value && is.string(value)) {
      let { $refs } = instance
      if (is.object($refs)) {
        if (object.has($refs, value)) {
          logger.error(`Passing a ref "${value}" is existed.`)
        }
      }
      else {
        $refs = instance.$refs = { }
      }

      let setRef = function (target) {
        $refs[value] = target
        el[key] = function () {
          delete $refs[value]
        }
      }

      if (component) {
        if (is.array(component)) {
          array.push(component, setRef)
        }
        else {
          setRef(component)
        }
      }
      else {
        setRef(el)
      }

    }
  },

  detach({ el, key }) {
    if (el[key]) {
      el[key]()
      el[key] = env.NULL
    }
  }

}
