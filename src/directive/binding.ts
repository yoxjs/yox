
import isDef from 'yox-common/function/isDef'
import * as env from 'yox-common/util/env'

import VNode from 'yox-template-compiler/src/vnode/VNode'
import Binding from 'yox-template-compiler/src/vnode/Binding'

import api from '../platform/web/api'
import Yox from '../Yox'

export default {
  bind(el: HTMLElement | Yox, node: Binding, vnode: VNode) {

    const { binding } = node

    let set = function (newValue: any, oldValue: any, keypath: string) {
      let name = node.name
      if (el instanceof Yox) {
        el.set(name, value)
      }
      else if (isDef(node.hint)) {
        api.setProp(el, name, value)
      }
      else {
        // namespace 怎么办
        api.setAttr(el, name, value)
      }
    }

    // keypath 可能是模糊匹配
    // 比如延展属性 {{...obj}}，这里 keypath 会是 `obj.*`
    instance.watch(binding, set)

  },

  update(el: HTMLElement | Yox, node: Binding, vnode: VNode, oldVnode?: VNode) {

  },

  unbind(el: HTMLElement | Yox, node: Binding, vnode: VNode) {

    const { binding } = node

    instance.unwatch(binding, set)

  }
}
