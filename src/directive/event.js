
import debounce from '../function/debounce'

import * as env from '../config/env'
import * as is from '../util/is'
import * as native from '../platform/web/native'

export default {

  attach: function({ el, name, node, instance, listener, directives }) {

    if (!listener) {
      listener = instance.compileValue(node.keypath, node.getValue())
    }

    if (listener) {
      let { lazy } = directives
      if (lazy) {
        let value = lazy.node.getValue()
        if (is.numeric(value) && value >= 0) {
          listener = debounce(listener, value)
        }
        else if (name === 'input') {
          name = 'change'
        }
      }

      let { $component } = el
      if ($component) {
        $component.on(name, listener)
      }
      else {
        native.on(el, name, listener)
        el.$event = function () {
          native.off(el, name, listener)
          el.$event = env.NULL
        }
      }
    }

  },

  detach: function ({ el }) {
    let { $event } = el
    if ($event) {
      $event()
    }
  }

}
