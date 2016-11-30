
import * as env from '../config/env'
import * as native from '../platform/web/native'

export default {

  attach: function({ el, name, node, instance }) {

    let listener = instance.compileAttr(node.keypath, node.getValue())
    if (listener) {
      let { $component } = el
      if ($component) {
        $component.on(name, listener)
      }
      else {
        native.on(el, name, listener)
        el[`$${name}`] = listener
      }
    }

  },

  detach: function ({ el, name }) {
    let listener = `$${name}`
    if (el[listener]) {
      native.off(el, name, el[listener])
      el[listener] = env.NULL
    }
  }

}
