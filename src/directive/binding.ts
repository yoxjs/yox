import isDef from 'yox-common/function/isDef'
import execute from 'yox-common/function/execute'

import * as keypathUtil from 'yox-common/util/keypath'

import VNode from 'yox-type/src/vnode/VNode'
import Directive from 'yox-type/src/vnode/Directive'
import DirectiveHook from 'yox-type/src/hook/Directive'
import Yox from 'yox-type/src/Yox'

import api from 'yox-dom'

const directive: DirectiveHook = {

  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    // binding 可能是模糊匹配
    // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
    const { binding } = directive

    if (binding) {

      const isFuzzy = keypathUtil.isFuzzy(binding),

      watcher = function (newValue: any, oldValue: any, keypath: string) {

        const name = isFuzzy
          ? keypathUtil.matchFuzzy(keypath, binding) as string
          : directive.name

        if (vnode.isComponent) {
          (node as Yox).set(name, newValue)
        }
        else if (isDef(directive.hint)) {
          api.prop(node as HTMLElement, name, newValue)
        }
        else {
          api.attr(node as HTMLElement, name, newValue)
        }

      }

      vnode.instance.watch(binding, watcher)

      vnode.data[directive.key] = function () {
        vnode.instance.unwatch(binding, watcher)
      }

    }

  },

  update(node: HTMLElement | Yox, directive: Directive, vnode: VNode, oldVnode: VNode) {

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {
    execute(vnode.data[directive.key])
  }

}

export default directive
