
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

  attach({ el, node, instance }) {
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
        el.$ref = function () {
          delete $refs[value]
          el.$ref = env.NULL
        }
      }

      let { $component } = el
      if ($component) {
        if (is.array($component)) {
          array.push($component, setRef)
        }
        else {
          setRef($component)
        }
      }
      else {
        setRef(el)
      }

    }
  },

  detach({ el }) {
    let { $ref } = el
    if ($ref) {
      $ref()
    }
  }

}
