import isDef from '../../../yox-common/src/function/isDef'
import execute from '../../../yox-common/src/function/execute'

import * as keypathUtil from '../../../yox-common/src/util/keypath'

import Yox from '../../../yox-type/src/interface/Yox'
import VNode from '../../../yox-type/src/vnode/VNode'
import Directive from '../../../yox-type/src/vnode/Directive'
import DirectiveHooks from '../../../yox-type/src/hooks/Directive'

import api from '../../../yox-dom/src/dom'

const directive: DirectiveHooks = {

  bind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {

    // binding 可能是模糊匹配
    // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
    const binding = directive.binding as string,

    isFuzzy = keypathUtil.isFuzzy(binding),

    watcher = function (newValue: any, _: any, keypath: string) {

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

    vnode.context.watch(binding, watcher)

    vnode.data[directive.key] = function () {
      vnode.context.unwatch(binding, watcher)
    }

  },

  unbind(node: HTMLElement | Yox, directive: Directive, vnode: VNode) {
    execute(vnode.data[directive.key])
  }

}

export default directive
