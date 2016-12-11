
/**
 * <Component o-ref="component" />
 */

import * as env from '../config/env'

import * as logger from '../util/logger'
import * as component from '../util/component'

export default {

  attach: function ({ el, node, instance }) {

    let value = node.getValue()
    if (value) {
      if (component.get(instance, 'ref', value, env.TRUE)) {
        logger.error(`Ref ${value} is existed.`)
      }
      component.set(instance, 'ref', value, el.$component || el)
      el.$ref = value
    }

  },

  detach: function ({ el, instance }) {

    if (el.$ref) {
      component.remove(instance, 'ref', el.$ref)
      el.$ref = env.NULL
    }

  }
}
