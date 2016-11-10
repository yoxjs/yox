
import * as env from '../config/env'
import * as helper from '../platform/web/helper'

module.exports = {

  attach: function({ el, name, node, instance }) {

    let listener = instance.compileAttr(node.keypath, node.getValue())
    if (listener) {
      let { $component } = el
      if ($component) {
        $component.on(name, listener)
      }
      else {
        helper.on(el, name, listener)
        el[`$${name}`] = listener
      }
    }

  },

  detach: function ({ el, name, node }) {
    let listener = `$${name}`
    if (el[listener]) {
      helper.off(el, name, el[listener])
      el[listener] = env.NULL
    }
  }

}
