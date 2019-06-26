import {
  VNode,
  Directive,
} from '../../../yox-type/src/type'

import {
  Listener,
  YoxInterface,
} from '../../../yox-type/src/global'

import execute from '../../../yox-common/src/function/execute'
import debounce from '../../../yox-common/src/function/debounce'

import * as env from '../../../yox-common/src/util/env'
import * as domApi from '../../../yox-dom/src/dom'


export function bind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {

  let { name, handler } = directive, { lazy } = vnode

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

  if (vnode.isComponent) {

    (node as YoxInterface).on(name, handler)
    vnode.data[directive.key] = function () {
      (node as YoxInterface).off(name, handler as Listener<any>)
    }

  }
  else {

    domApi.on(node as HTMLElement, name, handler)
    vnode.data[directive.key] = function () {
      domApi.off(node as HTMLElement, name, handler as Listener<any>)
    }

  }

}

export function unbind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {
  execute(vnode.data[directive.key])
}

