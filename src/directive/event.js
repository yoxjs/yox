
import debounce from 'yox-common/function/debounce'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'

import * as native from '../platform/web/native'

export default {

  attach({ el, node, instance, directives, type, listener }) {

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

      let { $component, $event } = el
      if (!$event) {
        $event = el.$event = [ ]
      }

      if ($component) {
        let bind = function ($component) {
          $component.on(type, listener)
          array.push(
            $event,
            {
              type,
              listener,
            }
          )
        }
        if (is.array($component)) {
          array.push($component, bind)
        }
        else {
          bind($component)
        }
      }
      else {
        native.on(el, type, listener)
        array.push(
          $event,
          {
            type,
            listener,
            native: env.TRUE,
          }
        )
      }
    }

  },

  update(options) {
    this.detach(options)
    this.attach(options)
  },

  detach({ el }) {
    let { $component, $event } = el
    if ($event) {
      el.$event = env.NULL
      array.each(
        $event,
        function (item) {
          if (item.native) {
            native.off(el, item.type, item.listener)
          }
          else {
            $component.off(item.type, item.listener)
          }
        }
      )
    }
  }

}
