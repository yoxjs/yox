import debounce from 'yox-common/function/debounce'

import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'

import api from '../platform/web/api'
import * as event from '../config/event'

import Yox from '../Yox'
import VNode from 'yox-template-compiler/src/vnode/VNode'
import Event from 'yox-template-compiler/src/vnode/Event'

// 避免连续多次点击，主要用于提交表单场景
// 移动端的 tap 事件可自行在业务层打补丁实现
const syncTypes = [ event.CLICK, event.TAP ]

export default {
  bind(el: HTMLElement | Yox, node: Event, vnode: VNode) {

    let { name, lazy, handler } = node

    if (lazy) {
      // 编译模板时能保证不是 true 就是数字
      if (lazy === env.TRUE) {
        name = event.CHANGE
      }
      else {
        handler = debounce(
          handler,
          lazy,
          array.has(syncTypes, name)
        )
      }
    }

    if (vnode.isComponent) {
      (el as Yox).on(name, handler)
    }
    else {
      api.on(el as HTMLElement, name, handler)
    }

  },

  unbind(el: HTMLElement | Yox, node: Event, vnode: VNode) {

  }
}
