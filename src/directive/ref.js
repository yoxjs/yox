
/**
 * <Component @ref="component" />
 */

import * as env from '../config/env'

import * as component from '../util/component'

export default {

  onAttach: function ({ el, node, instance }) {

    let child = el[`$component`]
    let value = node.getValue()
    if (child && value) {
      component.set(instance, 'ref', value, child)
      el.$ref = value
    }

  },

  onDetach: function ({ el, instance }) {

    if (el.$ref) {
      delete instance.$refs[el.$ref]
      el.$ref = env.NULL
    }

  }
}
