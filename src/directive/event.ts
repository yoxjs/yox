import execute from 'yox-common/src/function/execute'
import debounce from 'yox-common/src/function/debounce'

import * as env from 'yox-common/src/util/env'
import * as array from 'yox-common/src/util/array'

import api from 'yox-dom/index'
import * as event from '../config/event'

import VNode from 'yox-type/src/vnode/VNode'
import Directive from 'yox-type/src/vnode/Directive'
import DirectiveHooks from 'yox-type/src/hooks/Directive'
import Yox from 'yox-type/src/Yox'
import * as type from 'yox-type/index'

// 避免连续多次点击，主要用于提交表单场景
// 移动端的 tap 事件可自行在业务层打补丁实现
const syncTypes = array.toObject([event.CLICK, event.TAP]),

directive: DirectiveHooks = {
  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    let { key, name, lazy, handler } = directive, { data } = vnode

    if (!handler) {
      return
    }

    if (lazy) {
      // 编译模板时能保证不是 true 就是数字
      if (lazy === env.TRUE) {
        name = event.CHANGE
      }
      else {
        handler = debounce(
          handler,
          lazy,
          syncTypes[name]
        )
      }
    }

    if (vnode.isComponent) {
      (node as Yox).on(name, handler)
      data[key] = function () {
        (node as Yox).off(name, handler as type.eventListener)
      }
    }
    else {
      api.on(node as HTMLElement, name, handler)
      data[key] = function () {
        api.off(node as HTMLElement, name, handler as type.eventListener)
      }
    }

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {
    execute(vnode.data[directive.key])
  }
}

export default directive
