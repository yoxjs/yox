
import debounce from 'yox-common/function/debounce'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'

import * as native from '../platform/web/native'

export default {

  attach: function({ el, node, instance, directives, type, listener }) {

    if (!type) {
      type = node.subName
    }
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
        else if (type === 'input') {
          type = 'change'
        }
      }

      let { $component } = el
      if ($component) {
        if (is.array($component)) {
          $component.push(
            function ($component) {
              $component.on(type, listener)
            }
          )
        }
        else {
          $component.on(type, listener)
        }
      }
      else {
        native.on(el, type, listener)
        el.$event = function () {
          native.off(el, type, listener)
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
