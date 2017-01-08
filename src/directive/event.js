
import debounce from 'yox-common/function/debounce'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'

import * as native from '../platform/web/native'

export default function ({ el, node, instance, component, directives, type, listener }) {

  if (!type) {
    type = node.modifier
  }
  if (!listener) {
    listener = instance.compileValue(node.keypath, node.value)
  }

  if (listener) {
    let { lazy } = directives
    if (lazy) {
      if (is.numeric(lazy.value) && lazy.value >= 0) {
        listener = debounce(listener, lazy.value)
      }
      else if (type === 'input') {
        type = 'change'
      }
    }

    if (component) {
      let bind = function (component) {
        component.on(type, listener)
      }
      if (is.array(component)) {
        array.push(component, bind)
      }
      else {
        bind(component)
      }
      return function () {
        component.off(type, listener)
        if (is.array(component)) {
          array.remove(component, bind)
        }
      }
    }
    else {
      native.on(el, type, listener)
      return function () {
        native.off(el, type, listener)
      }
    }
  }

}
