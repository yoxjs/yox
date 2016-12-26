
import debounce from 'yox-common/function/debounce'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as native from '../platform/web/native'

export default {

  attach: function({ el, name, node, instance, listener, directives }) {

    if (!listener) {
      listener = instance.compileValue(node.keypath, node.value)
    }

    if (listener) {
      let { lazy } = directives
      if (lazy) {
        let { value } = lazy.node
        if (is.numeric(value) && value >= 0) {
          listener = debounce(listener, value)
        }
        else if (name === 'input') {
          name = 'change'
        }
      }

      let { $component } = el
      if ($component) {
        if (is.array($component)) {
          $component.push(
            function ($component) {
              $component.on(name, listener)
            }
          )
        }
        else {
          $component.on(name, listener)
        }
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
