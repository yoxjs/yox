
/**
 * <Component ref="component" />
 * <input ref="input">
 */

import * as env from '../config/env'

import * as is from '../util/is'
import * as object from '../util/object'
import * as logger from '../util/logger'
import * as component from '../util/component'

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
      // [TODO] 异步组件在这里会有问题
      $refs[value] = el.$component || el
      el.$ref = value
    }
  },

  detach: function ({ el, instance }) {
    if (el.$ref) {
      delete instance.$refs[el.$ref]
      el.$ref = env.NULL
    }
  }

}
