
import {
  on,
  off,
} from '../platform/web/helper'

import {
  NULL,
} from '../config/env'

module.exports = {

  attach: function({ el, name, node, instance }) {

    let listener = instance.compileAttr(node.keypath, node.getValue())
    if (listener) {
      let { $component } = el
      if ($component) {
        $component.on(name, listener)
      }
      else {
        on(el, name, listener)
        el[`$${name}`] = listener
      }
    }

  },

  detach: function ({ el, name, node }) {
    let listener = `$${name}`
    if (el[listener]) {
      off(el, name, el[listener])
      el[listener] = NULL
    }
  }

}
