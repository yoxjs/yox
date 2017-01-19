
import debounce from 'yox-common/function/debounce'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'

import * as native from '../platform/web/native'

// 避免连续多次点击，主要用于提交表单场景
// 移动端的 tap 事件可自行在业务层打补丁实现
const immediateTypes = [ 'click', 'tap' ]

export default function ({ el, node, instance, component, directives, type, listener }) {

  if (!type) {
    type = node.modifier
  }
  if (!listener) {
    listener = instance.compileValue(node.keypath, node.value)
  }

  if (type && listener) {
    let { lazy } = directives
    if (lazy) {
      let { value } = lazy
      if (is.numeric(value) && value >= 0) {
        listener = debounce(listener, value, array.has(immediateTypes, type))
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
