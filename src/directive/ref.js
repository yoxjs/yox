
/**
 * <Component @ref="component" />
 */

import {
  NULL,
} from '../config/env'

import {
  set,
} from '../util/component'

module.exports = {

  attach: function ({ el, node, instance }) {

    let component = el[`$component`]
    let value = node.getValue()
    if (component && value) {
      set(instance, 'ref', value, component)
      el.$ref = value
    }

  },

  detach: function ({ el, instance }) {

    if (el.$ref) {
      delete instance.$refs[el.$ref]
      el.$ref = NULL
    }

  }
}
