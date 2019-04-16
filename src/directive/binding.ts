import isDef from 'yox-common/function/isDef'
import * as keypathUtil from 'yox-common/util/keypath'

import VNode from 'yox-template-compiler/src/vnode/VNode'
import Binding from 'yox-template-compiler/src/vnode/Binding'

import api from '../platform/web/api'
import Yox from '../Yox'

export default {
  bind(el: HTMLElement | Yox, node: Binding, vnode: VNode) {

    // binding 可能是模糊匹配
    // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
    const { binding } = node, isFuzzy = keypathUtil.isFuzzy(binding)

    let set = function (newValue: any, oldValue: any, keypath: string) {

      const name = isFuzzy
        ? keypathUtil.matchFuzzy(keypath, binding)
        : node.name

      if (vnode.isComponent) {
        el.set(name, newValue)
      }
      else if (isDef(node.hint)) {
        api.prop(el, name, newValue)
      }
      else {
        api.attr(el, name, newValue)
      }

    }

    instance.watch(binding, set)

  },

  update(el: HTMLElement | Yox, node: Binding, vnode: VNode, oldVnode?: VNode) {

  },

  unbind(el: HTMLElement | Yox, node: Binding, vnode: VNode) {

    const { binding } = node

    instance.unwatch(binding, set)

  }
}
