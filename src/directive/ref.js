
/**
 * <Component ref="component" />
 * <input ref="input">
 */

import * as env from '../config/env'

import * as is from '../util/is'
import * as object from '../util/object'
import * as logger from '../util/logger'

export default {

  attach: function ({ el, node, instance }) {
    let value = node.getValue()
    if (value && is.string(value)) {
      let { $refs } = instance
      if (is.object($refs)) {
        if (object.has($refs, value)) {
          logger.error(`Ref ${value} is existed.`)
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
          $component.push(setRef)
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

  detach: function ({ el }) {
    let { $ref } = el
    if ($ref) {
      $ref()
    }
  }

}
