
/**
 * <Component @ref="component" />
 */

import * as env from '../config/env'

import * as component from '../util/component'

module.exports = {

  attach: function ({ el, node, instance }) {

    let child = el[`$component`]
    let value = node.getValue()
    if (child && value) {
      component.set(instance, 'ref', value, child)
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
