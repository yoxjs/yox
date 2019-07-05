import {
  Listener,
} from '../../../yox-type/src/type'

import {
  VNode,
  Directive,
} from '../../../yox-type/src/vnode'

import {
  YoxInterface,
} from '../../../yox-type/src/yox'

import {
  MODIFER_NATIVE,
} from '../../../yox-config/src/config'

import execute from '../../../yox-common/src/function/execute'
import debounce from '../../../yox-common/src/function/debounce'

import * as env from '../../../yox-common/src/util/env'
import * as domApi from '../../../yox-dom/src/dom'


export function bind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {

  let { key, name, handler, modifier } = directive, { lazy } = vnode

  if (!handler) {
    return
  }

  if (lazy) {

    const value = lazy[name] || lazy[env.EMPTY_STRING]

    if (value === env.TRUE) {
      name = env.EVENT_CHANGE
    }
    else if (value > 0) {
      handler = debounce(
        handler,
        value,
        // 避免连续多次点击，主要用于提交表单场景
        // 移动端的 tap 事件可自行在业务层打补丁实现
        name === env.EVENT_CLICK || name === env.EVENT_TAP
      )
    }

  }

  let element: HTMLElement

  if (vnode.isComponent) {
    const component = node as YoxInterface

    if (modifier === MODIFER_NATIVE) {
      element = component.$el as HTMLElement

      domApi.on(element, name, handler)
      vnode.data[key] = function () {
        domApi.off(element, name, handler as Listener)
      }
    }
    else {
      // 还原命名空间
      if (modifier) {
        name += env.RAW_DOT + modifier
      }
      component.on(name, handler)
      vnode.data[key] = function () {
        component.off(name, handler as Listener)
      }
    }
  }
  else {
    element = node as HTMLElement

    domApi.on(element, name, handler)
    vnode.data[key] = function () {
      domApi.off(element, name, handler as Listener)
    }
  }

}

export function unbind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {
  execute(vnode.data[directive.key])
}

