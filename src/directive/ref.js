
/**
 * <Component ref="component" />
 * <input ref="input">
 */

import * as is from 'yox-common/util/is'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'
import * as logger from 'yox-common/util/logger'

export default function ({ el, node, instance, component }) {
  let { value } = node
  if (string.falsy(value)) {
    return
  }

  let { $refs } = instance
  if (is.object($refs)) {
    if (object.has($refs, value)) {
      logger.error(`Passing a ref "${value}" is existed.`)
    }
  }
  else {
    $refs = instance.$refs = { }
  }

  let set = function (target) {
    $refs[ value ] = target
  }

  if (component) {
    if (is.array(component)) {
      array.push(component, set)
    }
    else {
      set(component)
    }
  }
  else {
    set(el)
  }

  return function () {
    if (object.has($refs, value)) {
      delete $refs[ value ]
    }
    else if (is.array(component)) {
      array.remove(component, set)
    }
  }

}
