
import debounce from 'yox-common/function/debounce'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'

import api from '../platform/web/api'
import * as event from '../config/event'

// 避免连续多次点击，主要用于提交表单场景
// 移动端的 tap 事件可自行在业务层打补丁实现
const syncTypes = [ event.CLICK, event.TAP ]

export default function ({ el, node, instance, component, directives, type, listener }) {

  if (!type) {
    type = node.modifier
  }

  let destroy = env.noop

  if (!listener) {
    let result = instance.compileDirective(node)
    if (result) {
      listener = result.listener
      if (result.destroy) {
        destroy = result.destroy
      }
    }
  }

  if (type && listener) {
    let { lazy } = directives
    if (lazy) {
      let { value } = lazy
      if (is.numeric(value) && value >= 0) {
        listener = debounce(listener, value, array.has(syncTypes, type))
      }
      else if (type === event.INPUT) {
        type = event.CHANGE
      }
    }

    if (component) {
      let unbind
      let bind = function (component) {
        component.on(type, listener)
        unbind = function () {
          component.off(type, listener)
        }
      }
      if (is.array(component)) {
        array.push(component, bind)
        unbind = function () {
          array.remove(component, bind)
        }
      }
      else {
        bind(component)
      }
      return function () {
        unbind()
        destroy()
      }
    }
    else {
      api.on(el, type, listener)
      return function () {
        api.off(el, type, listener)
        destroy()
      }
    }
  }

}
