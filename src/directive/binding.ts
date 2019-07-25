import {
  Watcher,
} from 'yox-type/src/type'

import {
  VNode,
  Directive,
} from 'yox-type/src/vnode'

import {
  YoxInterface,
} from 'yox-type/src/yox'

import execute from 'yox-common/src/function/execute'

import * as constant from 'yox-common/src/util/constant'
import * as keypathUtil from 'yox-common/src/util/keypath'

import * as domApi from 'yox-dom/src/dom'

export const once = constant.TRUE

export function bind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {

  // binding 可能是模糊匹配
  // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
  let binding = directive.modifier as string,

  // 提前判断好是否是模糊匹配，避免 watcher 频繁执行判断逻辑
  isFuzzy = keypathUtil.isFuzzy(binding),

  watcher: Watcher | void = function (newValue: any, _: any, keypath: string) {

    if (watcher) {
      const name = isFuzzy
        ? keypathUtil.matchFuzzy(keypath, binding) as string
        : directive.name

      if (vnode.isComponent) {
        const component = node as YoxInterface
        component.checkProp(name, newValue)
        component.set(name, newValue)
      }
      else {
        const element = node as HTMLElement
        if (directive.hint !== constant.UNDEFINED) {
          domApi.prop(element, name, newValue)
        }
        else {
          domApi.attr(element, name, newValue)
        }
      }
    }

  }

  vnode.context.watch(binding, watcher as Watcher)

  vnode.data[directive.key] = function () {
    vnode.context.unwatch(binding, watcher as Watcher)
    watcher = constant.UNDEFINED
  }

}

export function unbind(node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) {
  execute(vnode.data[directive.key])
}

